import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = (props) => {
  const { loginStatus, setLoginStatus } = props;
  const [emailReg, setEmailReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [firstNameReg, setFirstNameReg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatus) {
      Axios.delete("http://localhost:3001/api/logout").then((response) => {
        if (response.status === 200) {
          setLoginStatus("");
          localStorage.clear();
        }
      });
    }
  }, [setLoginStatus, loginStatus]);

  const isEmailValid = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const register = () => {
    setEmailError("");
    setPasswordError("");
    setFirstNameError("");

    if (!emailReg) {
      setEmailError("Must enter email");
      return;
    } else if (!isEmailValid(emailReg)) {
      setEmailError("Invalid email format");
      return;
    } else if (!passwordReg) {
      setPasswordError("Must enter password");
      return;
    } else if (!firstNameReg) {
      setFirstNameError("Must enter name");
      return;
    }

    setEmailError("");
    setPasswordError("");
    setFirstNameError("");

    Axios.post("http://localhost:3001/api/register", {
      email: emailReg,
      password: passwordReg,
      firstName: firstNameReg,
    })
      .then((response) => {
        console.log("Server response:", response.data);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error registering", error);
      });
  };

  return (
    <div className="App home-container">
      <div className="register container">
        <div className="form">
          <h1>Register</h1>
          <div className="flex">
            <input
              type="text"
              value={emailReg}
              placeholder="Email"
              maxLength="100"
              onChange={(e) => {
                setEmailReg(e.target.value);
              }}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
          <div className="flex">
            <input
              type="password"
              value={passwordReg}
              placeholder="Password"
              maxLength="100"
              onChange={(e) => {
                setPasswordReg(e.target.value);
              }}
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
          <div className="flex">
            <input
              type="text"
              value={firstNameReg}
              placeholder="First Name"
              maxLength="50"
              onChange={(e) => {
                setFirstNameReg(e.target.value);
              }}
            />
            {firstNameError && (
              <p className="error-message">{firstNameError}</p>
            )}
          </div>
          <div className="button-container">
            <button className="auth-button" onClick={register}>
              {" "}
              Register{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
