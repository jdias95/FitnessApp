const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const http = require("http");
const { format } = require("date-fns-tz");
const { time } = require("console");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

process.env.CI = false;

const saltRounds = 10;

app.use(express.static("public", { maxAge: 26 * 7 * 24 * 60 * 60 * 1000 }));
app.use(express.json());
app.use(
  cors({
    origin: [process.env.CORS_ORIGIN, process.env.CORS_ORIGIN_2],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    }),
    cookie: {
      expires: 10000000000,
    },
  })
);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const sendEmail = ({ OTP, recipient_email, email_type }) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mail_configs =
      email_type === "recovery"
        ? {
            from: process.env.EMAIL_SENDER,
            to: recipient_email,
            subject: "Reset Password",
            html: `<!DOCTYPE html>
              <html>
                <body>
                  <div>
                    <p>Use the temporary password below to reset your password:</p>
                    <h2>${OTP}</h2>
                  </div>
                </body>
              </html>`,
          }
        : email_type === "welcome"
        ? {
            from: process.env.EMAIL_SENDER,
            to: recipient_email,
            subject: "Welcome!",
            html: `<!DOCTYPE html>
              <html>
                <body>
                  <div>
                    <p>Welcome to WeGoJim!<br><br>Thank you for trying out my app. If you have any questions or feedback, please feel free to reach out. I hope its features allow you to better manage your fitness progress.<br><br>Best Regards,<br>Josh</p>
                  </div>
                </body>
              </html>`,
          }
        : {
            from: process.env.EMAIL_SENDER,
            to: recipient_email,
            subject: "Password Successfully Reset",
            html: `<!DOCTYPE html>
              <html>
                <body>
                  <div>
                    <p>You successfully reset your password to WeGoJim!</p>
                  </div>
                </body>
              </html>`,
          };

    transporter.sendMail(mail_configs, (error, info) => {
      if (error) {
        console.error(error);
        return reject({ message: "An error has occured" });
      }
      return resolve({ message: "Email sent successfully" });
    });
  });
};

app.post("/api/send-email", (req, res) => {
  const sqlSelect = `SELECT * FROM users WHERE email = ?`;

  db.query(sqlSelect, [req.body.recipient_email], (err, result) => {
    if (err) {
      console.log("Error executing SELECT query:", err);
    }

    if (result.length > 0) {
      sendEmail(req.body)
        .then((response) => res.send(response.message))
        .catch((error) => res.status(500).send(error.message));
    } else {
      res.send({ message: "User doesn't exist" });
    }
  });
});

app.put("/api/reset-password", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const sqlUpdate = `UPDATE users SET password = ? WHERE email = ?`;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log("Error hashing password:", err);
      return res.status(500).json({ message: "Error during password reset" });
    }

    db.query(sqlUpdate, [hash, email], (err, result) => {
      if (err) {
        console.log("Error executing SQL query:", err);
        return res.status(500).json({ message: "Error during password reset" });
      } else {
        console.log("Password reset successful:", result);
        sendEmail({ OTP: null, recipient_email: email, email_type: "success" });
        res.status(200).json({ message: "Password reset successful" });
      }
    });
  });
});

app.post("/api/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;

  const sqlPost =
    "INSERT INTO users (email, password, first_name) VALUES (?, ?, ?)";

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log("Error hashing password:", err);
      return res.status(500).json({ message: "Error during registration" });
    }

    db.query(sqlPost, [email, hash, firstName], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(200).json({
            message: "User already exists",
          });
        }
        console.log("Error executing SQL query:", err);
        return res.status(500).json({ message: "Error during registration" });
      }
      res.status(200).json({ message: "Registration successful" });
    });
  });
});

app.get("/api/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user[0] });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/api/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const sqlPost = "SELECT * FROM users WHERE email = ?";
  db.query(sqlPost, [email], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (err, response) => {
        if (response) {
          req.session.user = result;
          console.log(req.session.user);
          res.send(result);
        } else {
          res.send({ message: "Wrong email/password combination" });
        }
      });
    } else {
      res.send({ message: "User doesn't exist" });
    }
  });
});

app.delete("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    res.clearCookie("userId", {
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: 10000000000,
      },
    });

    res.status(200).json({ message: "Logout successful" });
  });
});

app.get("/api/get/:userId", (req, res) => {
  const userId = req.params.userId;
  const sqlSelect = "SELECT * FROM users WHERE id = ?";

  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log(err);
    } else {
      res.status(200).json(result[0]);
    }
  });
});

app.post("/api/insert/profile", (req, res) => {
  const userId = req.body.userId;
  const weight = req.body.weight;
  const height = req.body.height;
  const age = req.body.age;
  const activityLevel = req.body.activityLevel;
  const gender = req.body.gender;
  const measurementType = req.body.measurementType;
  const weightGoal = req.body.weightGoal;
  const targetWeight = req.body.targetWeight;

  const sqlInsert =
    "INSERT INTO user_profiles (user_id, weight, height, age, activity_level, gender, measurement_type, weight_goal, target_weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sqlInsert,
    [
      userId,
      weight,
      height,
      age,
      activityLevel,
      gender,
      measurementType,
      weightGoal,
      targetWeight,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

app.put("/api/update/profile/:userId", (req, res) => {
  const userId = req.params.userId;
  const weight = req.body.weight;
  const height = req.body.height;
  const age = req.body.age;
  const activityLevel = req.body.activityLevel;
  const gender = req.body.gender;
  const measurementType = req.body.measurementType;
  const weightGoal = req.body.weightGoal;
  const targetWeight = req.body.targetWeight;

  const sqlUpdate = `
    UPDATE user_profiles 
    SET weight = ?, height = ?, age = ?, activity_level = ?, gender = ?, measurement_type = ?, weight_goal = ?, target_weight = ?
    WHERE user_id = ?
  `;

  db.query(
    sqlUpdate,
    [
      weight,
      height,
      age,
      activityLevel,
      gender,
      measurementType,
      weightGoal,
      targetWeight,
      userId,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

app.get("/api/get/profile/:userId", (req, res) => {
  const userId = req.params.userId;
  const sqlSelect = "SELECT * FROM user_profiles WHERE user_id = ?";

  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.error("Error retrieving profile:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Profile not found" });
    } else {
      res.status(200).json(result[0]);
    }
  });
});

app.post("/api/insert/routine", (req, res) => {
  const userId = req.body.userId;
  const name = req.body.name;

  const sqlInsert =
    "INSERT INTO exercise_routines (user_id, name) VALUES (?, ?)";
  db.query(sqlInsert, [userId, name], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log(err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.get("/api/get/routines/:userId", (req, res) => {
  const userId = req.params.userId;
  const sqlSelect = "SELECT * FROM exercise_routines WHERE user_id = ?";

  db.query(sqlSelect, userId, (err, result) => {
    if (err) {
      console.error("Error retrieving routines:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Routines not found" });
    } else {
      res.status(200).json(result);
    }
  });
});

app.put("/api/update/routine/:id", (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  const sqlUpdate = `UPDATE exercise_routines SET name = ? WHERE id = ?`;

  db.query(sqlUpdate, [name, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log(err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.delete("/api/delete/routine/:id", (req, res) => {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM exercise_routines WHERE id = ?";

  db.query(sqlDelete, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error deleting routine:", err);
    } else {
      res.status(204).send();
    }
  });
});

app.post("/api/insert/weight", (req, res) => {
  const userId = req.body.userId;
  const weight = req.body.weight;
  const date = req.body.date;

  const sqlInsert =
    "INSERT INTO weight_times (user_id, weight, date) VALUES (?, ?, ?)";
  db.query(sqlInsert, [userId, weight, date], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log(err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.get("/api/get/weight/:userId", (req, res) => {
  const userId = req.params.userId;
  const sqlSelect = "SELECT * FROM weight_times WHERE user_id = ? LIMIT 100";

  db.query(sqlSelect, [userId], (err, result) => {
    if (err) {
      console.error("Error retrieving weights:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Weights not found" });
    } else {
      res.status(200).json(result);
    }
  });
});

app.put("/api/update/weight/:userId", (req, res) => {
  const userId = req.params.userId;
  const weight = req.body.weight;
  const date = req.body.date;

  const sqlUpdate = `UPDATE weight_times SET weight = ? WHERE user_id = ? AND date = ?`;

  db.query(sqlUpdate, [weight, userId, date], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log("Error updating weight:", err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.delete("/api/delete/weight/:id", (req, res) => {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM weight_times WHERE id = ?";

  db.query(sqlDelete, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error deleting weight:", err);
    } else {
      res.status(204).send();
    }
  });
});

app.post("/api/insert/exercise", (req, res) => {
  const userId = req.body.userId;
  const routineId = req.body.routineId;
  const name = req.body.name;
  const repsHigh = req.body.repsHigh;
  const repsLow = req.body.repsLow;
  const setsHigh = req.body.setsHigh;
  const setsLow = req.body.setsLow;
  const weight = req.body.weight;
  const tracked = req.body.tracked;
  const bw = req.body.bw;
  const notes = req.body.notes;
  const sortOrder = req.body.sortOrder;

  const sqlInsert =
    "INSERT INTO exercises (user_id, routine_id, name, reps_high, reps_low, sets_high, sets_low, weight, tracked, bw, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sqlInsert,
    [
      userId,
      routineId,
      name,
      repsHigh,
      repsLow,
      setsHigh,
      setsLow,
      weight,
      tracked,
      bw,
      notes,
      sortOrder,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log(err);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

app.get("/api/get/exercises/:userId", (req, res) => {
  const userId = req.params.userId;
  const sqlSelect =
    "SELECT * FROM exercises WHERE user_id = ? ORDER BY sort_order";

  db.query(sqlSelect, [userId], (err, result) => {
    if (err) {
      console.error("Error retrieving weights:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Exercises not found" });
    } else {
      res.status(200).json(result);
    }
  });
});

app.put("/api/update/exercise/:id", (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const repsHigh = req.body.repsHigh;
  const repsLow = req.body.repsLow;
  const setsHigh = req.body.setsHigh;
  const setsLow = req.body.setsLow;
  const weight = req.body.weight;
  const tracked = req.body.tracked;
  const bw = req.body.bw;
  const notes = req.body.notes;
  const sortOrder = req.body.sortOrder;

  const sqlUpdate = `UPDATE exercises SET name = ?, reps_high = ?, reps_low = ?, sets_high = ?, sets_low = ?, weight = ?, tracked = ?, bw = ?, notes = ?, sort_order = ? WHERE id = ?`;

  db.query(
    sqlUpdate,
    [
      name,
      repsHigh,
      repsLow,
      setsHigh,
      setsLow,
      weight,
      tracked,
      bw,
      notes,
      sortOrder,
      id,
    ],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        console.log("Error updating exercise:", err);
      } else {
        res.status(200).json(result);
      }
    }
  );
});

app.delete("/api/delete/exercise/:id", (req, res) => {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM exercises WHERE id = ?";

  db.query(sqlDelete, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error deleting exercise:", err);
    } else {
      res.status(204).send();
    }
  });
});

app.post("/api/sync/workout-log", (req, res) => {
  const { userId, localLog, timezone } = req.body;
  const now = new Date();
  const date = format(now, "yyyy-MM-dd", { timeZone: timezone || "UTC" });

  db.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: "DB connection failed" });

    conn.beginTransaction(async (err) => {
      if (err) {
        conn.release();
        return res.status(500).json({ error: "Transaction start failed" });
      }

      try {
        // Get or create workout_log
        let [workoutLog] = await queryAsync(
          conn,
          "SELECT * FROM workout_logs WHERE user_id = ? AND log_date = ?",
          [userId, date]
        );

        if (!workoutLog) {
          const result = await queryAsync(
            conn,
            "INSERT INTO workout_logs (user_id, log_date) VALUES (?, ?)",
            [userId, date]
          );
          workoutLog = { id: result.insertId, user_id: userId, date };
        }

        const workoutLogId = workoutLog.id;

        // Get existing exercises
        const existingExercises = await queryAsync(
          conn,
          "SELECT * FROM log_exercises WHERE workout_log_id = ?",
          [workoutLogId]
        );
        const existingExerciseMap = new Map(
          existingExercises.map((ex) => [ex.id, ex])
        );

        const seenExerciseIds = new Set();

        for (const localEx of localLog) {
          let logExerciseId = localEx.id;

          if (logExerciseId && existingExerciseMap.has(logExerciseId)) {
            // Update exercise name if changed
            await queryAsync(
              conn,
              `UPDATE log_exercises 
               SET exercise_name = ?, tracked = ?, bw = ? 
               WHERE id = ?`,
              [localEx.name, localEx.tracked, localEx.bw, logExerciseId]
            );
          } else {
            // Insert new exercise
            const result = await queryAsync(
              conn,
              "INSERT INTO log_exercises (workout_log_id, exercise_name, tracked, bw) VALUES (?, ?, ?, ?)",
              [workoutLogId, localEx.name, localEx.tracked, localEx.bw]
            );
            logExerciseId = result.insertId;
            localEx.id = logExerciseId; // update back
          }

          seenExerciseIds.add(logExerciseId);

          if (localEx.tracked) {
            // Ensure tracked_exercises entry exists
            const [trackedRow] = await queryAsync(
              conn,
              "SELECT * FROM tracked_exercises WHERE log_exercise_id = ? AND user_id = ?",
              [logExerciseId, userId]
            );

            let trackedExerciseId;
            if (!trackedRow) {
              const trackedResult = await queryAsync(
                conn,
                "INSERT INTO tracked_exercises (user_id, log_exercise_id, exercise_name) VALUES (?, ?, ?)",
                [userId, logExerciseId, localEx.name]
              );
              trackedExerciseId = trackedResult.insertId;
            } else {
              trackedExerciseId = trackedRow.id;
              // Keep exercise_name updated if it changes
              await queryAsync(
                conn,
                "UPDATE tracked_exercises SET exercise_name = ? WHERE id = ?",
                [localEx.name, trackedExerciseId]
              );
            }

            // Ensure tracked_exercises_order entry exists
            const [orderRow] = await queryAsync(
              conn,
              "SELECT * FROM tracked_exercises_order WHERE user_id = ? AND exercise_name = ?",
              [userId, localEx.name]
            );

            if (!orderRow) {
              const orderResult = await queryAsync(
                conn,
                "INSERT INTO tracked_exercises_order (user_id, exercise_name, sort_order) VALUES (?, ?, ?)",
                [userId, localEx.name, 0]
              );

              // Update sort_order to match its id
              await queryAsync(
                conn,
                "UPDATE tracked_exercises_order SET sort_order = ? WHERE id = ?",
                [orderResult.insertId, orderResult.insertId]
              );
            }
          }

          // Get existing sets for this exercise
          const existingSets = await queryAsync(
            conn,
            "SELECT * FROM log_sets WHERE log_exercise_id = ?",
            [logExerciseId]
          );
          const existingSetMap = new Map(existingSets.map((s) => [s.id, s]));
          const seenSetIds = new Set();

          for (const localSet of localEx.sets || []) {
            let logSetId = localSet.id;

            if (logSetId && existingSetMap.has(logSetId)) {
              await queryAsync(
                conn,
                "UPDATE log_sets SET reps = ?, weight = ?, notes = ? WHERE id = ?",
                [localSet.reps, localSet.weight, localSet.notes, logSetId]
              );
            } else {
              const result = await queryAsync(
                conn,
                "INSERT INTO log_sets (log_exercise_id, reps, weight, notes) VALUES (?, ?, ?, ?)",
                [logExerciseId, localSet.reps, localSet.weight, localSet.notes]
              );
              logSetId = result.insertId;
              localSet.id = logSetId;
            }

            seenSetIds.add(logSetId);
          }

          // Delete removed sets
          for (const s of existingSets) {
            if (!seenSetIds.has(s.id)) {
              await queryAsync(conn, "DELETE FROM log_sets WHERE id = ?", [
                s.id,
              ]);
            }
          }
        }

        // Delete removed exercises
        for (const ex of existingExercises) {
          if (!seenExerciseIds.has(ex.id)) {
            await queryAsync(conn, "DELETE FROM log_exercises WHERE id = ?", [
              ex.id,
            ]);
          }
        }

        // Commit
        conn.commit((err) => {
          if (err) {
            return conn.rollback(() => {
              conn.release();
              res.status(500).json({ error: "Commit failed" });
            });
          }
          conn.release();
          res.json({ success: true, localLog });
        });
      } catch (e) {
        conn.rollback(() => {
          conn.release();
          console.error(e);
          res
            .status(500)
            .json({ error: "Transaction failed", details: e.message });
        });
      }
    });
  });
});

function queryAsync(conn, sql, params) {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

app.get("/api/get/workout-log/:userId/:date", (req, res) => {
  const userId = req.params.userId;
  const date = req.params.date;
  const sqlSelect =
    "SELECT * FROM workout_logs WHERE user_id = ? AND log_date = ?";

  db.query(sqlSelect, [userId, date], (err, result) => {
    if (err) {
      console.error("Error retrieving workout log:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Workout log not found" });
    } else {
      res.status(200).json(result[0]);
    }
  });
});

app.get("/api/get/log-exercises/:workoutLogId", (req, res) => {
  const workoutLogId = req.params.workoutLogId;

  const sqlSelect = "SELECT * FROM log_exercises WHERE workout_log_id = ?";
  db.query(sqlSelect, [workoutLogId], (err, result) => {
    if (err) {
      console.error("Error retrieving log exercises:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Log exercises not found" });
    } else {
      res.status(200).json(result);
    }
  });
});

app.post("/api/insert/log-exercise", (req, res) => {
  const workoutLogId = req.body.workoutLogId;
  const exerciseName = req.body.exerciseName;

  const sqlInsert =
    "INSERT INTO log_exercises (workout_log_id, exercise_name) VALUES (?, ?)";
  db.query(sqlInsert, [workoutLogId, exerciseName], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log(err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.put("/api/update/log-exercise/:id", (req, res) => {
  const id = req.params.id;
  const exerciseName = req.body.exerciseName;

  const sqlUpdate = `UPDATE log_exercises SET exercise_name = ? WHERE id = ?`;
  db.query(sqlUpdate, [exerciseName, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log("Error updating log exercise:", err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.delete("/api/delete/log-exercise/:id", (req, res) => {
  const id = req.params.id;

  const sqlDelete = "DELETE FROM log_exercises WHERE id = ?";
  db.query(sqlDelete, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error deleting log exercise:", err);
    } else {
      res.status(204).send();
    }
  });
});

app.get("/api/get/log-sets/:logExerciseId", (req, res) => {
  const logExerciseId = req.params.logExerciseId;

  const sqlSelect = "SELECT * FROM log_sets WHERE log_exercise_id = ?";
  db.query(sqlSelect, [logExerciseId], (err, result) => {
    if (err) {
      console.error("Error retrieving log sets:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else if (result.length === 0) {
      res.status(404).json({ error: "Log sets not found" });
    } else {
      res.status(200).json(result);
    }
  });
});

app.post("/api/insert/log-set", (req, res) => {
  const logExerciseId = req.body.logExerciseId;
  const reps = req.body.reps;
  const weight = req.body.weight;
  const notes = req.body.notes;

  const sqlInsert =
    "INSERT INTO log_sets (log_exercise_id, reps, weight, notes) VALUES (?, ?, ?, ?)";
  db.query(sqlInsert, [logExerciseId, reps, weight, notes], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log(err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.put("/api/update/log-set/:id", (req, res) => {
  const id = req.params.id;
  const reps = req.body.reps;
  const weight = req.body.weight;
  const notes = req.body.notes;

  const sqlUpdate = `UPDATE log_sets SET reps = ?, weight = ?, notes = ? WHERE id = ?`;
  db.query(sqlUpdate, [reps, weight, notes, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log("Error updating log set:", err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.delete("/api/delete/log-set/:id", (req, res) => {
  const id = req.params.id;

  const sqlDelete = "DELETE FROM log_sets WHERE id = ?";
  db.query(sqlDelete, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error deleting log set:", err);
    } else {
      res.status(204).send();
    }
  });
});

app.post("/api/insert/tracked-exercise", (req, res) => {
  const userId = req.body.userId;
  const logExerciseId = req.body.logExerciseId;
  const exerciseName = req.body.exerciseName;

  const sqlInsert =
    "INSERT INTO tracked_exercises (user_id, log_exercise_id, name) VALUES (?, ?, ?)";
  db.query(sqlInsert, [userId, logExerciseId, exerciseName], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log("Error creating tracked exercise:", err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.get("/api/get/tracked-exercises/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT te.id,
           te.user_id,
           te.log_exercise_id,
           te.exercise_name,
           le.bw,
           teo.id AS order_id,
           teo.sort_order,
           ls.id AS set_id,
           ls.reps,
           ls.weight,
           ls.notes,
           wl.log_date
    FROM tracked_exercises te
    LEFT JOIN tracked_exercises_order teo
      ON te.user_id = teo.user_id
     AND te.exercise_name = teo.exercise_name
    LEFT JOIN log_exercises le
      ON te.log_exercise_id = le.id
    LEFT JOIN workout_logs wl
      ON le.workout_log_id = wl.id
    LEFT JOIN log_sets ls
      ON le.id = ls.log_exercise_id
    WHERE te.user_id = ?
    ORDER BY 
      CASE WHEN teo.sort_order IS NOT NULL THEN teo.sort_order ELSE 9999 END,
      te.exercise_name, ls.id
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error retrieving tracked exercises:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Exercises not found" });
    }

    // Group by exercise_name, then by log_exercise_id (or date) → creates history
    const grouped = {};

    result.forEach((row) => {
      if (!grouped[row.exercise_name]) {
        grouped[row.exercise_name] = [];
      }

      // Check if this log_exercise already exists in the array
      let logEntry = grouped[row.exercise_name].find(
        (entry) => entry.log_exercise_id === row.log_exercise_id
      );

      if (!logEntry) {
        logEntry = {
          id: row.id,
          user_id: row.user_id,
          log_exercise_id: row.log_exercise_id,
          exercise_name: row.exercise_name,
          bw: row.bw,
          order_id: row.order_id,
          sort_order: row.sort_order,
          date: row.log_date,
          sets: [],
          working_weight: null,
          working_set_count: 0,
          reps_low: null,
          reps_high: null,
          volume: 0,
        };
        grouped[row.exercise_name].push(logEntry);
      }

      // Add set if present
      if (row.set_id) {
        logEntry.sets.push({
          id: row.set_id,
          reps: row.reps,
          weight: row.weight,
          notes: row.notes,
        });
      }
    });

    // Calculate metrics for each log
    Object.values(grouped).forEach((exerciseLogs) => {
      exerciseLogs.forEach((exercise) => {
        if (exercise.sets.length > 0) {
          // Volume = sum of reps × weight
          exercise.volume = exercise.sets.reduce(
            (sum, s) => sum + (s.reps || 0) * (s.weight || 0),
            0
          );

          // Mode of weights (ties → higher weight)
          const weightCounts = {};
          let modeWeight = null;
          let maxCount = 0;

          exercise.sets.forEach((s) => {
            if (s.weight != null) {
              weightCounts[s.weight] = (weightCounts[s.weight] || 0) + 1;

              const count = weightCounts[s.weight];
              if (
                count > maxCount ||
                (count === maxCount && s.weight > modeWeight)
              ) {
                maxCount = count;
                modeWeight = s.weight;
              }
            }
          });

          exercise.working_weight = modeWeight;

          const workingSets = exercise.sets.filter(
            (s) => s.weight === modeWeight
          );

          exercise.working_set_count = workingSets.length;

          // reps_low / reps_high
          if (workingSets.length > 0) {
            const repsValues = workingSets
              .map((s) => s.reps)
              .filter((r) => r != null);

            if (repsValues.length > 0) {
              const minReps = Math.min(...repsValues);
              const maxReps = Math.max(...repsValues);

              exercise.reps_low = minReps;
              exercise.reps_high = minReps === maxReps ? null : maxReps;
            }
          }
        }
      });

      // Sort logs by date ascending
      exerciseLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // Sort order array
    const sortOrderArray = Object.values(grouped)
      .flat()
      .filter((ex) => ex.sort_order != null && ex.order_id != null)
      .filter(
        (ex, index, self) =>
          index === self.findIndex((e) => e.exercise_name === ex.exercise_name)
      ) // unique by exercise_name
      .map((ex) => ({
        id: ex.order_id,
        user_id: ex.user_id,
        exercise_name: ex.exercise_name,
        sort_order: ex.sort_order,
      }));

    const response = { ...grouped, sortOrder: sortOrderArray };

    res.status(200).json(response);
  });
});

app.put("/api/update/tracked-exercise/:userId", (req, res) => {
  const userId = req.params.userId;
  const name = req.body.name;
  const newName = req.body.newName;
  const sqlUpdate =
    "UPDATE tracked_exercises SET exercise_name = ? WHERE user_id = ? AND exercise_name = ?";
  const sqlUpdate2 =
    "UPDATE tracked_exercises_order SET exercise_name = ? WHERE user_id = ? AND exercise_name = ?";

  db.query(sqlUpdate, [newName, userId, name], (err1, result1) => {
    if (err1) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error updating tracked exercise name:", err1);
    } else {
      db.query(sqlUpdate2, [newName, userId, name], (err2, result2) => {
        if (err2) {
          res.status(500).json({ error: "Internal Server Error" });
          console.error("Error updating tracked exercise order name:", err2);
        } else {
          res.status(200).json({ result1, result2 });
        }
      });
    }
  });
});

app.delete("/api/delete/tracked-exercise/:id", (req, res) => {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM tracked_exercises WHERE id = ?";

  db.query(sqlDelete, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error deleting exercise:", err);
    } else {
      res.status(204).send();
    }
  });
});

app.post("/api/insert/tracked-exercise-order/:userId", (req, res) => {
  const userId = req.params.userId;
  const name = req.body.name;
  const sortOrder = req.body.sortOrder;
  const sqlInsert =
    "INSERT INTO tracked_exercises_order (user_id, name, sort_order) VALUES (?, ?, ?)";

  db.query(sqlInsert, [userId, name, sortOrder], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log("Error creating tracked exercise order:", err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.put("/api/update/tracked-exercise-order/:id", (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const sortOrder = req.body.sortOrder;
  const sqlUpdate = `UPDATE tracked_exercises_order SET exercise_name = ?, sort_order = ? WHERE id = ?`;

  db.query(sqlUpdate, [name, sortOrder, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.log("Error updating tracked exercise order:", err);
    } else {
      res.status(200).json(result);
    }
  });
});

// app.get("/api/get/tracked-exercise-order/:userId", (req, res) => {
//   const userId = req.params.userId;
//   const sqlSelect =
//     "SELECT * FROM tracked_exercises_order WHERE user_id = ? ORDER BY sort_order";

//   db.query(sqlSelect, [userId], (err, result) => {
//     if (err) {
//       console.error("Error retrieving tracked exercise order:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     } else if (result.length === 0) {
//       res.status(404).json({ error: "Exercise order not found" });
//     } else {
//       res.status(200).json(result);
//     }
//   });
// });

app.delete("/api/delete/tracked-exercise-order/:id", (req, res) => {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM tracked_exercises_order WHERE id = ?";

  db.query(sqlDelete, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
      console.error("Error deleting tracked exercise order:", err);
    } else {
      res.status(204).send();
    }
  });
});

server.listen(3001, () => {
  console.log(`Server is up and running on port 3001`);
});
