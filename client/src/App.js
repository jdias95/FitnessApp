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
import moment from "moment";
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

  const ProtectedRoute = ({ children }) => {
    if (!localStorage.getItem("authToken")) {
      localStorage.clear();
      return <Navigate to="/" replace />;
    }

    return children;
  };

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

    return children;
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root setLoginStatus={setLoginStatus} />}>
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
            />
          }
        />
        <Route
          path="otp"
          element={
            <RerouteOTP>
              <OTPClass OTP={OTP} email={email} />
            </RerouteOTP>
          }
        />
        <Route
          path="password-reset"
          element={
            <RerouteOTP>
              <ResetPassword email={email} />
            </RerouteOTP>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                loginStatus={loginStatus}
                userProfile={userProfile}
                previousWeight={previousWeight}
                setPreviousWeight={setPreviousWeight}
                formattedDate={formattedDate}
                routines={routines}
                setRoutines={setRoutines}
                exercises={exercises}
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
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage
                setUserProfile={setUserProfile}
                userProfile={userProfile}
                defaultConvertWeight={defaultConvertWeight}
                defaultConvertHeightMetric={defaultConvertHeightMetric}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile-form"
          element={
            <ProtectedRoute>
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
              />
            </ProtectedRoute>
          }
        />
        <Route path="logout" />
      </Route>
    )
  );

  useEffect(() => {
    Axios.get("http://localhost:3001/api/login")
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
  }, [setLoginStatus]);

  useEffect(() => {
    if (loginStatus) {
      Axios.get(`http://localhost:3001/api/get/routines/${loginStatus.id}`)
        .then((response) => {
          if (response.data.length > 0) {
            setRoutines(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching routines:", error);
        });

      Axios.get(
        `http://localhost:3001/api/get/tracked-exercises/${loginStatus.id}`
      )
        .then((response) => {
          if (response.data.length > 0) {
            const groupedExercises = {};

            response.data.forEach((exercise) => {
              const exerciseName = exercise.name;

              if (!groupedExercises[exerciseName]) {
                groupedExercises[exerciseName] = [];
              }

              groupedExercises[exerciseName].push(exercise);
            });

            setTrackedExercises(groupedExercises);
          }
        })
        .catch((error) => {
          console.error("Error fetching exercises:", error);
        });

      Axios.get(`http://localhost:3001/api/get/exercises/${loginStatus.id}`)
        .then((response) => {
          if (response.data.length > 0) {
            setExercises(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching exercises:", error);
        });

      Axios.get(`http://localhost:3001/api/get/profile/${loginStatus.id}`)
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

            Axios.post("http://localhost:3001/api/insert/profile", {
              userId: loginStatus.id,
              ...newProfile,
            }).then(() => {
              Axios.get(
                `http://localhost:3001/api/get/profile/${loginStatus.id}`
              )
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
  }, [loginStatus]);

  useEffect(() => {
    if (loginStatus) {
      Axios.get(`http://localhost:3001/api/get/weight/${loginStatus.id}`)
        .then((response) => {
          const weightData = response.data;
          const mostRecentWeight = weightData[weightData.length - 1];
          const formattedDate = mostRecentWeight.date.slice(0, 10);
          setPreviousWeight({ ...mostRecentWeight, date: formattedDate });

          let transformedData = [];

          if (userProfile && userProfile.measurement_type === "metric") {
            transformedData = response.data.map((item) => ({
              weight: defaultConvertWeight(item.weight),
              date: moment(item.date).format("YYYY-MM-DD"),
            }));
          } else {
            transformedData = response.data.map((item) => ({
              weight: item.weight,
              date: moment(item.date).format("YYYY-MM-DD"),
            }));
          }

          const startDate = new Date(response.data[0].date);
          const endDate = new Date(
            response.data[response.data.length - 1].date
          );

          const dateRange = [];
          for (
            let currentDate = startDate;
            currentDate <= endDate;
            currentDate.setDate(currentDate.getDate() + 1)
          ) {
            dateRange.push(new Date(currentDate));
          }

          const formattedDateRange = dateRange.map((date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            return `${year}-${month}-${day}`;
          });

          const newData = formattedDateRange.map((date) => {
            const existingData = transformedData.find(
              (item) => item.date === date
            );
            return existingData ? existingData : { weight: null, date };
          });
          setWeightData(newData);
        })
        .catch((error) => {
          console.error("Error fetching weight data:", error);
        });
    } else {
      setPreviousWeight({});
      setWeightData([]);
    }
  }, [loginStatus, setPreviousWeight, userProfile]);

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
