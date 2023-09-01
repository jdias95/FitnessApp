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

function App(props) {
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
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route
          path="login"
          element={<Login setLoginStatus={setLoginStatus} />}
        />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="profile"
          element={
            <ProfilePage
              loginStatus={loginStatus}
              userProfile={userProfile}
              userProfileDisplay={userProfileDisplay}
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

  // useEffect(() => {
  //   if (loginStatus) {
  //     Axios.get(`http://localhost:3001/api/get/profile/${loginStatus.id}`)
  //       .then((response) => {
  //         setUserProfile(response.data);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching profile data:", error);
  //       });
  //   }
  // }, [loginStatus]);

  useEffect(() => {
    if (loginStatus) {
      Axios.get(`http://localhost:3001/api/get/profile/${loginStatus.id}`)
        .then((response) => {
          const userProfileWithNA = Object.keys(response.data).reduce(
            (acc, key) => {
              acc[key] =
                response.data[key] === 0 || response.data[key] === ""
                  ? "N/A"
                  : response.data[key];
              return acc;
            },
            {}
          );
          setUserProfile(response.data);
          setUserProfileDisplay(userProfileWithNA);
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
                  const userProfileWithNA = Object.keys(response.data).reduce(
                    (acc, key) => {
                      acc[key] =
                        response.data[key] === 0 || response.data[key] === ""
                          ? "N/A"
                          : response.data[key];
                      return acc;
                    },
                    {}
                  );
                  setUserProfile(response.data);
                  setUserProfileDisplay(userProfileWithNA);
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
        });
    }
  }, [loginStatus]);

  useEffect(() => {
    console.log(userProfile);
    console.log(userProfileDisplay);
  });

  return (
    <div className="App">
      <RouterProvider router={router}>
        {loginStatus ? <NavbarLoggedIn /> : <NavbarLoggedOut />}
      </RouterProvider>
    </div>
  );
}

export default App;
