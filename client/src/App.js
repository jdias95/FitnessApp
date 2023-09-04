import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import NavbarLoggedIn from "./NavbarLoggedIn";
import NavbarLoggedOut from "./NavbarLoggedOut";
import Dashboard from "./Dashboard";
import Register from "./Register";
import Login from "./Login";
import Root from "./Root";
import ProfilePage from "./ProfilePage";
import ProfileForm from "./ProfileForm";
import RoutineFormModal from "./RoutineFormModal";
import Home from "./Home";
import "./App.css";
import Axios from "axios";
import WeightFormModal from "./WeightFormModal";

function App() {
  const [loginStatus, setLoginStatus] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileDisplay, setUserProfileDisplay] = useState(null);

  Axios.defaults.withCredentials = true;

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={
          <Root setLoginStatus={setLoginStatus} loginStatus={loginStatus} />
        }
      >
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
              setUserProfile={setUserProfile}
            />
          }
        />
        <Route
          path="profile"
          element={
            <ProfilePage
              loginStatus={loginStatus}
              userProfile={userProfile}
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
            />
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
          setLoginStatus("");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [setLoginStatus]);

  useEffect(() => {
    if (loginStatus) {
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
  }, [loginStatus]);

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
