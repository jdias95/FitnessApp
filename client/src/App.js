import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import NavbarLoggedIn from "./NavbarLoggedIn";
import NavbarLoggedOut from "./NavbarLoggedOut";
import Dashboard from "./Dashboard";
import Register from "./Register";
import Login from "./Login";
import Root from "./Root";
import ProfilePage from "./ProfilePage";
import ProfileForm from "./ProfileForm";
import Home from "./Home";
import "./App.css";
import Axios from "axios";
import OTPClass from "./OTP";
import ResetPassword from "./ResetPassword";

function App() {
  const [email, setEmail] = useState("");
  const [OTP, setOTP] = useState(0);
  const [loginStatus, setLoginStatus] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [previousWeight, setPreviousWeight] = useState({});
  const [weightData, setWeightData] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [trackedExercises, setTrackedExercises] = useState({});
  const [routineExercises, setRoutineExercises] = useState({});
  const [openMenus, setOpenMenus] = useState({});
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const time = String(
    `${String(currentDate.getHours()).padStart(2, "0")}:${String(
      currentDate.getMinutes()
    ).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`
  );
  const formattedDate = `${year}-${month}-${day}T${time}`;
  const applicationMode = "Development";
  const apiURL =
    applicationMode === "Development"
      ? "http://localhost:3001"
      : "https://api.wegojim.net";

  const convertWeight = (kgs) => {
    const lbs = kgs * 2.20462262185;
    return Number(lbs.toFixed(1));
  };

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(1));
  };

  const defaultConvertHeightMetric = (inches) => {
    const cm = inches / 0.3937008;
    return Number(cm.toFixed(0));
  };

  const safeParseFloat = (str) => {
    try {
      const parsedValue = parseFloat(str);
      const hasMultipleDigitsAfterDecimal = /(\.\d*)\d{2,}/.test(str);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        if (str.length >= 6 || hasMultipleDigitsAfterDecimal) {
          return parseFloat(str.slice(0, str.length - 1));
        }
        return parsedValue;
      } else {
        throw new Error("Value is not a valid number.");
      }
    } catch (error) {
      return "";
    }
  };

  Axios.defaults.withCredentials = true;

  const RerouteOTP = ({ children }) => {
    if (!email) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  const RerouteHome = ({ children }) => {
    if (localStorage.getItem("authToken")) {
      return <Navigate to="/dashboard" replace />;
    }

    localStorage.clear();
    return children;
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<Root setLoginStatus={setLoginStatus} apiURL={apiURL} />}
      >
        <Route
          index
          element={
            <RerouteHome>
              <Home />
            </RerouteHome>
          }
        />
        <Route
          path="register"
          element={
            <Register
              loginStatus={loginStatus}
              setLoginStatus={setLoginStatus}
              apiURL={apiURL}
            />
          }
        />
        <Route
          path="login"
          element={
            <Login
              loginStatus={loginStatus}
              setLoginStatus={setLoginStatus}
              setOTP={setOTP}
              email={email}
              setEmail={setEmail}
              apiURL={apiURL}
            />
          }
        />
        <Route
          path="otp"
          element={
            <RerouteOTP>
              <OTPClass OTP={OTP} email={email} apiURL={apiURL} />
            </RerouteOTP>
          }
        />
        <Route
          path="password-reset"
          element={
            <RerouteOTP>
              <ResetPassword email={email} apiURL={apiURL} />
            </RerouteOTP>
          }
        />
        <Route
          path="dashboard"
          element={
            <Dashboard
              loginStatus={loginStatus}
              userProfile={userProfile}
              previousWeight={previousWeight}
              setPreviousWeight={setPreviousWeight}
              formattedDate={formattedDate}
              routines={routines}
              setRoutines={setRoutines}
              exercises={exercises}
              setExercises={setExercises}
              trackedExercises={trackedExercises}
              setTrackedExercises={setTrackedExercises}
              weightData={weightData}
              setWeightData={setWeightData}
              setUserProfile={setUserProfile}
              convertWeight={convertWeight}
              defaultConvertWeight={defaultConvertWeight}
              safeParseFloat={safeParseFloat}
              openMenus={openMenus}
              setOpenMenus={setOpenMenus}
              routineExercises={routineExercises}
              setRoutineExercises={setRoutineExercises}
              apiURL={apiURL}
            />
          }
        />
        <Route
          path="profile"
          element={
            <ProfilePage
              setUserProfile={setUserProfile}
              userProfile={userProfile}
              defaultConvertWeight={defaultConvertWeight}
              defaultConvertHeightMetric={defaultConvertHeightMetric}
            />
          }
        />
        <Route
          path="profile-form"
          element={
            <ProfileForm
              loginStatus={loginStatus}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              previousWeight={previousWeight}
              setPreviousWeight={setPreviousWeight}
              formattedDate={formattedDate}
              setWeightData={setWeightData}
              weightData={weightData}
              convertWeight={convertWeight}
              defaultConvertWeight={defaultConvertWeight}
              safeParseFloat={safeParseFloat}
              defaultConvertHeightMetric={defaultConvertHeightMetric}
              apiURL={apiURL}
            />
          }
        />
        <Route path="logout" apiURL={apiURL} />
      </Route>
    )
  );

  useEffect(() => {
    Axios.get(`${apiURL}/api/login`)
      .then((response) => {
        if (response.data.loggedIn === true) {
          setLoginStatus(response.data.user);
        } else {
          localStorage.clear();
          setLoginStatus("");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [setLoginStatus, apiURL]);

  useEffect(() => {
    if (loginStatus) {
      Axios.get(`${apiURL}/api/get/routines/${loginStatus.id}`)
        .then((response) => {
          if (response.data.length > 0) {
            setRoutines(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching routines:", error);
        });

      Axios.get(`${apiURL}/api/get/tracked-exercises/${loginStatus.id}`)
        .then((response) => {
          if (response.data.length > 0) {
            const groupedExercises = {};
            let trackedExerciseOrder = [];

            response.data.forEach((exercise) => {
              const exerciseName = exercise.name;

              if (!groupedExercises[exerciseName]) {
                groupedExercises[exerciseName] = [];
              }

              groupedExercises[exerciseName].push(exercise);
            });

            Axios.get(
              `${apiURL}/api/get/tracked-exercise-order/${loginStatus.id}`
            )
              .then((response) => {
                if (response.data.length > 0) {
                  response.data.forEach((exerciseType) => {
                    const exercise = {
                      id: exerciseType.id,
                      name: exerciseType.name,
                      sort_order: exerciseType.sort_order,
                    };
                    trackedExerciseOrder.push(exercise);
                  });
                  groupedExercises["sortOrder"] = trackedExerciseOrder;
                }
              })
              .catch((error) => {
                console.error(error);
              });

            setTrackedExercises(groupedExercises);
          }
        })
        .catch((error) => {
          console.error("Error fetching exercises:", error);
        });

      Axios.get(`${apiURL}/api/get/exercises/${loginStatus.id}`)
        .then((response) => {
          if (response.data.length > 0) {
            setExercises(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching exercises:", error);
        });

      Axios.get(`${apiURL}/api/get/profile/${loginStatus.id}`)
        .then((response) => {
          setUserProfile(response.data);
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            const newProfile = {
              weight: 0,
              height: 0,
              age: 0,
              activityLevel: "",
              gender: "",
              measurementType: "imperial",
              weightGoal: 0,
              targetWeight: 0,
            };

            Axios.post(`${apiURL}/api/insert/profile`, {
              userId: loginStatus.id,
              ...newProfile,
            }).then(() => {
              Axios.get(`${apiURL}/api/get/profile/${loginStatus.id}`)
                .then((response) => {
                  setUserProfile(response.data);
                })
                .catch((error) => {
                  console.error(
                    "Error fetching newly created profile data:",
                    error
                  );
                });
            });
          } else {
            console.error("Error fetching profile data:", error);
          }
          console.log(error);
        });
    } else {
      setUserProfile(null);
      setRoutines([]);
      setExercises([]);
      setTrackedExercises({});
    }
  }, [loginStatus, apiURL]);

  useEffect(() => {
    if (loginStatus) {
      Axios.get(`${apiURL}/api/get/weight/${loginStatus.id}`)
        .then((response) => {
          setPreviousWeight(response.data[response.data.length - 1]);
          setWeightData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching weight data:", error);
        });
    } else {
      setPreviousWeight({});
      setWeightData([]);
    }
  }, [loginStatus, setPreviousWeight, userProfile, apiURL]);

  return (
    <div className="App">
      <RouterProvider router={router}>
        {localStorage.getItem("authToken") ? (
          <NavbarLoggedIn />
        ) : (
          <NavbarLoggedOut />
        )}
      </RouterProvider>
    </div>
  );
}

export default App;
