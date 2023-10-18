import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
  const { setLoginStatus } = props;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Axios.delete("http://localhost:3001/api/logout").then((response) => {
      if (response.status === 200) {
        setLoginStatus("");
        localStorage.clear();
      }
    });
  }, [setLoginStatus]);

  const login = () => {
    setLoginError("");

    if (!email || !password) {
      setLoginError("Must enter login information");
      return;
    }

    Axios.post("http://localhost:3001/api/login", {
      email: email,
      password: password,
    })
      .then((response) => {
        if (response.data.message) {
          setLoginError(response.data.message);
          return;
        } else {
          localStorage.setItem(
            "authToken",
            JSON.stringify({
              firstName: response.data[0].first_name,
            })
          );
          setLoginStatus(response.data[0]);
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
      });
  };

  return (
    <div className="App home-container">
      <div className="login container">
        <div className="form">
          <h1>Login</h1>
          <label>Email: </label>
          <input
            type="text"
            value={email}
            onChange={(e) => {
              if (e.target.value.length >= 100) {
                setEmail(e.target.value.slice(0, e.target.value.length - 1));
              } else {
                setEmail(e.target.value);
              }
            }}
          />
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              if (e.target.value.length >= 100) {
                setPassword(e.target.value.slice(0, e.target.value.length - 1));
              } else {
                setPassword(e.target.value);
              }
            }}
          />
          {loginError && <p className="error-message2">{loginError}</p>}
          <div className="button-container">
            <button onClick={login}> Login </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
