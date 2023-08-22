import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

const Logout = ({ setIsLoggedIn, setUser, setEmail, setPassword }) => {
  const navigate = useNavigate();

  useEffect(() => {
    Axios.delete("http://localhost:3001/api/logout").then(() => {
      setEmail("");
      setPassword("");
      setIsLoggedIn(false);
      setUser({});
      localStorage.clear();
      navigate("/");
    });
  }, [setIsLoggedIn, setEmail, setPassword, setUser, navigate]);

  return (
    <div className="App">
      <h1>Logging Out...</h1>
    </div>
  );
};

export default Logout;
