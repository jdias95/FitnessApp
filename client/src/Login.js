import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");

  Axios.defaults.withCredentials = true;

  const login = () => {
    Axios.post("http://localhost:3001/api/login", {
      email: email,
      password: password,
    }).then((response) => {
      if (response.data.message) {
        setLoginStatus(response.data.message);
      } else {
        setLoginStatus(response.data[0].email);
        setIsLoggedIn(true);
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/dashboard");
      }
    });
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/api/login").then((response) => {
      if (response.data.loggedIn === true) {
        setIsLoggedIn(true);
        setLoginStatus(response.data.user[0].email);
      } else {
        setIsLoggedIn(false);
        setLoginStatus("");
      }
    });
  }, [setIsLoggedIn]);

  return (
    <div className="App">
      <div className="login container">
        <div className="form">
          <h1>Login</h1>
          <label>Email: </label>
          <input
            type="text"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <label>Password: </label>
          <input
            type="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <div className="button-container">
            <button onClick={login}> Login </button>
          </div>
          <h1>{loginStatus}</h1>
        </div>
      </div>
    </div>
  );
};

export default Login;
