import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

const ResetPassword = (props) => {
  const { email, apiURL } = props;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const resetPassword = () => {
    setMessage("");

    if (!password) {
      setMessage("Must enter new password");
      return;
    }
    if (password && !confirmPassword) {
      setMessage("Must confirm password");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords must match");
      return;
    }

    setMessage("");

    Axios.put(`${apiURL}/reset-password`, {
      email: email,
      password: password,
    })
      .then((response) => {
        setMessage("Password reset successfully");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error during password reset:", error);
      });
  };

  return (
    <div className="App home-container">
      <div className="register container">
        <div className="form">
          <h1>Reset Password</h1>
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => {
              if (e.target.value.length >= 100) {
                setPassword(e.target.value.slice(0, e.target.value.length - 1));
              } else {
                setPassword(e.target.value);
              }
            }}
          />
          <input
            type="password"
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => {
              if (e.target.value.length >= 100) {
                setConfirmPassword(
                  e.target.value.slice(0, e.target.value.length - 1)
                );
              } else {
                setConfirmPassword(e.target.value);
              }
            }}
          />
          {message && message !== "Password reset successfully" && (
            <p className="error-message2">{message}</p>
          )}
          {message === "Password reset successfully" && (
            <p className="message">{message}</p>
          )}
          <div className="button-container">
            <button className="auth-button" onClick={resetPassword}>
              {" "}
              Confirm{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
