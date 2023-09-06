import React from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import Axios from "axios";

const Root = (props) => {
  const { setLoginStatus } = props;
  const navigate = useNavigate();

  const logout = () => {
    Axios.delete("http://localhost:3001/api/logout").then((response) => {
      if (response.status === 200) {
        setLoginStatus("");
        localStorage.clear();
        navigate("/");
      }
    });
  };

  return (
    <>
      <div className="nav">
        {localStorage.getItem("authToken") ? (
          <>
            <h1 className="name">
              Hello {JSON.parse(localStorage.getItem("authToken")).firstName}
            </h1>
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
