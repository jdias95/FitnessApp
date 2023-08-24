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
import Logout from "./Logout";
import Profile from "./Profile";
import Home from "./Home";
import Data from "./Data";
import "./App.css";
import Axios from "axios";

function App() {
  const [loginStatus, setLoginStatus] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<Root isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
      >
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route
          path="login"
          element={
            <Login
              setIsLoggedIn={setIsLoggedIn}
              setLoginStatus={setLoginStatus}
            />
          }
        />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route
          path="logout"
          element={<Logout setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
        />
        <Route path="data" element={<Data />} />
      </Route>
    )
  );

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    console.log(loggedInUser);
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
      setIsLoggedIn(true);
    }
  }, [setUser, setIsLoggedIn]);

  return (
    <div className="App">
      <RouterProvider router={router}>
        {isLoggedIn ? <NavbarLoggedIn /> : <NavbarLoggedOut />}
      </RouterProvider>
    </div>
  );
}

const Root = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  const logout = () => {
    Axios.delete("http://localhost:3001/api/logout").then((response) => {
      if (response.status === 200) {
        setIsLoggedIn(false);
        localStorage.clear();
        navigate("/");
      }
    });
  };

  return (
    <>
      <div className="nav">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/logout" onClick={logout}>
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>

      <div>
        <Outlet />
      </div>
    </>
  );
};

export default App;
