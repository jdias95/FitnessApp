import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = (props) => {
  const { setLoginStatus } = props;
  const [emailReg, setEmailReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [firstNameReg, setFirstNameReg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Axios.delete("http://localhost:3001/api/logout").then((response) => {
      if (response.status === 200) {
        setLoginStatus("");
        localStorage.clear();
      }
    });
  }, [setLoginStatus]);

  const register = () => {
    Axios.post("http://localhost:3001/api/register", {
      email: emailReg,
      password: passwordReg,
      firstName: firstNameReg,
    }).then((response) => {
      console.log("Server respons:", response.data);
      navigate("/login");
    });
  };
  return (
    <div className="App">
      <div className="register container">
        <div className="form">
          <h1>Registration</h1>
          <label>Email:</label>
          <input
            type="text"
            onChange={(e) => {
              setEmailReg(e.target.value);
            }}
          />
          <label>Password:</label>
          <input
            type="password"
            onChange={(e) => {
              setPasswordReg(e.target.value);
            }}
          />
          <label>First Name:</label>
          <input
            type="text"
            onChange={(e) => {
              setFirstNameReg(e.target.value);
            }}
          />
          <div className="button-container">
            <button onClick={register}> Register </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
