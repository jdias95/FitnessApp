import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Link,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import NavbarLoggedIn from "./NavbarLoggedIn";
import NavbarLoggedOut from "./NavbarLoggedOut";
import Dashboard from "./Dashboard";
import Register from "./Register";
import Login from "./Login";
import Root from "./Root";
import Profile from "./Profile";
import Home from "./Home";
import Data from "./Data";
import "./App.css";
import Axios from "axios";

function App() {
  const [loginStatus, setLoginStatus] = useState("");

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
        <Route path="profile" element={<Profile />} />
        <Route path="logout" />
        <Route path="data" element={<Data />} />
      </Route>
    )
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get("http://localhost:3001/api/login");

        if (response.data.loggedIn === true) {
          setLoginStatus(response.data.user.email);
        } else {
          setLoginStatus("");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [setLoginStatus]);

  return (
    <div className="App">
      <RouterProvider router={router}>
        {loginStatus ? <NavbarLoggedIn /> : <NavbarLoggedOut />}
      </RouterProvider>
    </div>
  );
}

export default App;
