import React from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import Axios from "axios";

const Root = (props) => {
  const { setLoginStatus, apiURL, setShowWalkthroughModal } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    Axios.delete(`${apiURL}/logout`).then((response) => {
      if (response.status === 200) {
        setLoginStatus("");
        localStorage.clear();
        navigate("/");
      }
    });
  };

  return (
    <>
      <div className="nav space-between">
        <img
          className="walkthrough-img"
          src={process.env.PUBLIC_URL + "/walkthrough.png"}
          onClick={() => {
            setShowWalkthroughModal(true);
          }}
          alt="walkthrough"
        />
        {localStorage.getItem("authToken") ? (
          <>
            <h1 className="name">
              Hello, {JSON.parse(localStorage.getItem("authToken")).firstName}!
            </h1>
            <div>
              <Link
                className={location.pathname === "/dashboard" ? "active" : ""}
                to="/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className={location.pathname === "/profile" ? "active" : ""}
                to="/profile"
              >
                Profile
              </Link>
              <Link to="/logout" onClick={logout}>
                Logout
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <Link
                className={location.pathname === "/login" ? "active" : ""}
                to="/login"
              >
                Login
              </Link>
              <Link
                className={location.pathname === "/register" ? "active" : ""}
                to="/register"
              >
                Register
              </Link>
            </div>
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
