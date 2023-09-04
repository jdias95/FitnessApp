import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Axios.delete("http://localhost:3001/api/logout").then((response) => {
      if (response.status === 200) {
        props.setLoginStatus("");
        localStorage.clear();
      }
    });
  }, [props]);

  const login = () => {
    Axios.post("http://localhost:3001/api/login", {
      email: email,
      password: password,
    })
      .then((response) => {
        console.log(response.data);
        if (response.data.message) {
          props.setLoginStatus(response.data.message);
        } else {
          localStorage.setItem("authToken", response.data[0].first_name);
          props.setLoginStatus(response.data[0]);
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
      });
  };

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
        </div>
      </div>
    </div>
  );
};

export default Login;
