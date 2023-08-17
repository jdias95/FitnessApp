import React from "react";
import { Link } from "react-router-dom";

const NavbarLoggedIn = ({ currentPath }) => {
  return (
    <nav className="nav">
      <Link to="/" className={currentPath === "/" ? "active" : ""}>
        Home
      </Link>
      <Link
        to="/dashboard"
        className={currentPath === "/dashboard" ? "active" : ""}
      >
        Dashboard
      </Link>
      <Link
        to="/profile"
        className={currentPath === "/profile" ? "active" : ""}
      >
        Profile
      </Link>
      <Link to="/logout" className={currentPath === "/logout" ? "logout" : ""}>
        Logout
      </Link>
    </nav>
  );
};

export default NavbarLoggedIn;
