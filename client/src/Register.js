import React, { useState } from "react";
import Axios from "axios";

const Register = () => {
  const [emailReg, setEmailReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [firstNameReg, setFirstNameReg] = useState("");

  Axios.defaults.withCredentials = true;

  const register = () => {
    Axios.post("http://localhost:3001/api/register", {
      email: emailReg,
      password: passwordReg,
      firstName: firstNameReg,
    }).then((response) => {
      console.log(response.data);
    });
  };
  return (
    <div className="App">
      <div className="registration">
        <h1>Registration</h1>
        <label>Email</label>
        <input
          type="text"
          onChange={(e) => {
            setEmailReg(e.target.value);
          }}
        />
        <label>Password</label>
        <input
          type="password"
          onChange={(e) => {
            setPasswordReg(e.target.value);
          }}
        />
        <label>First Name</label>
        <input
          type="text"
          onChange={(e) => {
            setFirstNameReg(e.target.value);
          }}
        />
        <button onClick={register}> Register </button>
      </div>
    </div>
  );
};

export default Register;
