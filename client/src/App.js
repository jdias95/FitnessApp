import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
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

function App() {
  const [loginStatus, setLoginStatus] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileDisplay, setUserProfileDisplay] = useState(null);
  const [previousWeight, setPreviousWeight] = useState({});
  const [weightData, setWeightData] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [trackedExercises, setTrackedExercises] = useState({});
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  Axios.defaults.withCredentials = true;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root setLoginStatus={setLoginStatus} />}>
        <Route index element={<Home setLoginStatus={setLoginStatus} />} />
        <Route
          path="register"
          element={<Register setLoginStatus={setLoginStatus} />}
        />
        <Route
          path="login"
          element={<Login setLoginStatus={setLoginStatus} />}
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
              trackedExercises={trackedExercises}
              setTrackedExercises={setTrackedExercises}
              weightData={weightData}
              setWeightData={setWeightData}
              formatDate={formatDate}
              setUserProfile={setUserProfile}
            />
          }
        />
        <Route
          path="profile"
          element={
            <ProfilePage
              loginStatus={loginStatus}
              userProfileDisplay={userProfileDisplay}
              setUserProfile={setUserProfile}
              setUserProfileDisplay={setUserProfileDisplay}
            />
          }
        />
        <Route
          path="profile-form"
          element={
            <ProfileForm
              loginStatus={loginStatus}
              userProfile={userProfile}
              setUserProfileDisplay={setUserProfileDisplay}
              previousWeight={previousWeight}
              setPreviousWeight={setPreviousWeight}
              formattedDate={formattedDate}
              setWeightData={setWeightData}
              weightData={weightData}
            />
          }
        />
        <Route path="logout" />
      </Route>
    )
  );

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(1));
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    Axios.get("http://localhost:3001/api/login")
      .then((response) => {
        if (response.data.loggedIn === true) {
          setLoginStatus(response.data.user);
        } else {
          localStorage.clear();
          setLoginStatus(false);
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
      setExercises({});
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
