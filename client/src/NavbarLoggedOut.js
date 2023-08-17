import React from "react";
import { Link } from "react-router-dom";

const NavbarLoggedOut = ({ currentPath }) => {
  return (
    <nav className="nav">
      <Link to="/" className={currentPath === "/" ? "active" : ""}>
        Home
      </Link>
      <Link to="/login" className={currentPath === "/login" ? "active" : ""}>
        Login
      </Link>
    </nav>
  );
};

export default NavbarLoggedOut;
