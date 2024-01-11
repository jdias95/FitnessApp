import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = (props) => {
  const { loginStatus, setLoginStatus, apiURL } = props;
  const [emailReg, setEmailReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [confirmPasswordReg, setConfirmPasswordReg] = useState("");
  const [firstNameReg, setFirstNameReg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
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
  }, [setLoginStatus, loginStatus, apiURL]);

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
    } else if (confirmPasswordReg !== passwordReg) {
      setPasswordError("Passwords must be the same");
      return;
    } else if (!firstNameReg) {
      setFirstNameError("Must enter name");
      return;
    }

    setEmailError("");
    setPasswordError("");
    setFirstNameError("");

    Axios.post(`${apiURL}/api/register`, {
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
          </div>
          {emailError && <p className="error-message">{emailError}</p>}
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
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
          <div>
            <input
              type="password"
              value={confirmPasswordReg}
              placeholder="Confirm Password"
              maxLength="100"
              onChange={(e) => {
                setConfirmPasswordReg(e.target.value);
              }}
            />
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
          </div>
          {firstNameError && <p className="error-message">{firstNameError}</p>}
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
