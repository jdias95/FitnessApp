import React from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import Axios from "axios";

const Root = (props) => {
  const navigate = useNavigate();

  const logout = () => {
    Axios.delete("http://localhost:3001/api/logout").then((response) => {
      if (response.status === 200) {
        props.setLoginStatus("");
        navigate("/");
      }
    });
  };

  return (
    <>
      <div className="nav">
        {props.loginStatus ? (
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

export default Root;
