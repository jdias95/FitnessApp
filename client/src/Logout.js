import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

const Logout = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    Axios.delete("http://localhost:3001/api/logout").then(() => {
      setIsLoggedIn(false);
      navigate("/");
    });
  }, [setIsLoggedIn]);

  return (
    <div className="App">
      <h1>Logging Out...</h1>
    </div>
  );
};

export default Logout;
