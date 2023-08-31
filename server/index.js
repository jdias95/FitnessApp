const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const app = express();
require("dotenv").config();

process.env.CI = false;

const saltRounds = 10;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
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
    cookie: {
      expires: 60 * 60 * 24 * 1000,
    },
  })
);

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "fitnessapp",
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
        console.log("Error executing SQL query:", err);
        return res.status(500).json({ message: "Error during registration" });
      }
      console.log("Registration successful:", result);
      res.status(200).json({ messagea: "Registration successful" });
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
          res.send({ message: "Wrong email/password combination!" });
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
        expires: 60 * 60 * 24 * 1000,
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

  const sqlInsert =
    "INSERT INTO user_profiles (user_id, weight, height, age, activity_level, gender) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sqlInsert,
    [userId, weight, height, age, activityLevel, gender],
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

app.get("/api/get", (req, res) => {
  const sqlSelect = "SELECT * FROM movie_reviews";
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.post("/api/insert", (req, res) => {
  const movieName = req.body.movieName;
  const movieReview = req.body.movieReview;

  const sqlInsert =
    "INSERT INTO movie_reviews (movieName, movieReview) VALUES (?, ?)";
  db.query(sqlInsert, [movieName, movieReview], (err, result) => {
    console.log(result);
  });
});

app.delete("/api/delete/:movieName", (req, res) => {
  const name = req.params.movieName;
  const sqlDelete = "DELETE FROM movie_reviews WHERE movieName = ?";

  db.query(sqlDelete, name, (err, result) => {
    if (err) console.log(err);
  });
});

app.put("/api/update", (req, res) => {
  const name = req.body.movieName;
  const review = req.body.movieReview;
  const sqlUpdate =
    "UPDATE movie_reviews SET movieReview = ? WHERE movieName = ?";

  db.query(sqlUpdate, [review, name], (err, result) => {
    if (err) console.log(err);
  });
});

app.listen(3001, () => {
  console.log("running on port 3001");
});
