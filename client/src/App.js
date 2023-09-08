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

function App() {
  const [loginStatus, setLoginStatus] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileDisplay, setUserProfileDisplay] = useState(null);
  const [previousWeight, setPreviousWeight] = useState({});
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
            />
          }
        />
        <Route path="logout" />
      </Route>
    )
  );

  useEffect(() => {
    const storedData = localStorage.getItem("authToken");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const currentTime = new Date().getTime();

      if (
        parsedData.expirationTime &&
        currentTime >= parsedData.expirationTime
      ) {
        localStorage.clear();
      }
    }
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
      Axios.get(`http://localhost:3001/api/get/weight/${loginStatus.id}`)
        .then((response) => {
          const weightData = response.data;
          const mostRecentWeight = weightData[weightData.length - 1];
          const formattedDate = mostRecentWeight.date.slice(0, 10);
          setPreviousWeight({ ...mostRecentWeight, date: formattedDate });

          localStorage.setItem(
            "previousWeight",
            JSON.stringify({
              previousWeight: { ...mostRecentWeight, date: formattedDate },
            })
          );
        })
        .catch((error) => {
          console.error("Error fetching weight data:", error);
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
    }
  }, [loginStatus, setPreviousWeight]);

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
