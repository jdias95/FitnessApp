import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
  const { loginStatus, setLoginStatus, setOTP, email, setEmail, apiURL } =
    props;
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [nav, setNav] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatus) {
      Axios.delete(`${apiURL}/api/logout`).then((response) => {
        if (response.status === 200) {
          setLoginStatus("");
          localStorage.clear();
        }
      });
    }
  }, [setLoginStatus, loginStatus]);

  useEffect(() => {
    if (nav) {
      navigate("/otp");
    }
  }, [nav, navigate]);

  const isEmailValid = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const login = () => {
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter login information");
      return;
    }

    Axios.post(`${apiURL}/api/login`, {
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
          setEmail("");
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
      });
  };

  const navigateToOTP = () => {
    setLoginError("");

    if (!email) {
      setLoginError("Please enter email");
      return;
    }
    if (!isEmailValid(email)) {
      setLoginError("Invalid email format");
      return;
    }
    if (email) {
      const OTP = Math.floor(Math.random() * 9000 + 1000);
      setOTP(OTP);

      Axios.post(`${apiURL}/api/send-recovery-email`, {
        OTP: OTP,
        recipient_email: email,
      })
        .then((response) => {
          if (response.data.message) {
            setLoginError(response.data.message);
            return;
          } else {
            setNav(true);
          }
        })
        .catch((error) => console.error(error));
      return;
    }
  };

  return (
    <div className="App home-container">
      <div className="login container">
        <div className="form">
          <h1>Login</h1>
          <div className="flex-column auth-flex-end">
            <input
              type="text"
              value={email}
              placeholder="Email"
              maxLength="100"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <input
              type="password"
              value={password}
              placeholder="Password"
              maxLength="100"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <button className="forgot-password" onClick={navigateToOTP}>
              Forgot Password?
            </button>
          </div>
          {loginError && <p className="error-message2">{loginError}</p>}
          <div className="button-container">
            <button className="auth-button" onClick={login}>
              {" "}
              Log In{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
