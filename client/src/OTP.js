import React, { useState, useEffect, useRef } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const OTPClass = (props) => {
  const { OTP, email } = props;
  const [timerCount, setTimerCount] = useState(60);
  const [OTPInput, setOTPInput] = useState([0, 0, 0, 0]);
  const [message, setMessage] = useState("");
  const [disable, setDisable] = useState(true);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      localStorage.clear();
      navigate("/login");
    }
  }, [email, navigate]);

  const resendOTP = () => {
    setMessage("");

    if (disable) return;
    Axios.post("http://localhost:3001/api/send-recovery-email", {
      OTP: OTP,
      recipient_email: email,
    })
      .then(() => setDisable(true))
      .then(() =>
        setMessage(
          "A new one time password has successfully been sent to your email."
        )
      )
      .then(() => setTimerCount(60))
      .catch((error) => console.error(error));
  };

  const verifyOTP = () => {
    setMessage("");

    if (parseInt(OTPInput.join("")) === OTP) {
      navigate("/password-reset");
      return;
    } else {
      setMessage("Incorrect OTP");
      return;
    }
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value;

    if (value.match(/^\d$/)) {
      const newOTPInput = [...OTPInput];
      newOTPInput[index] = value;
      setOTPInput(newOTPInput);

      if (index < inputRefs.length - 1) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setTimerCount((lastTimerCount) => {
        lastTimerCount <= 1 && clearInterval(interval);
        if (lastTimerCount <= 1) setDisable(false);
        if (lastTimerCount <= 0) return lastTimerCount;
        return lastTimerCount - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [disable]);

  return (
    <div className="App home-container">
      <div className="register verification container">
        <div className="form">
          <h1>Verification</h1>
          <p id="v-p">We have sent a code to your email {email}</p>
          <div className="flex otp-container">
            {inputRefs.map((inputRef, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={inputRef}
                id="otp"
                onChange={(e) => handleInputChange(e, index)}
              />
            ))}
          </div>
          {message ===
            "A new one time password has successfully been sent to your email." && (
            <p className="message">{message}</p>
          )}
          {message === "Incorrect OTP" && (
            <p className="error-message3">{message}</p>
          )}
          <div className="button-container">
            <div>
              <p>Didn't recieve code?</p>
              <button
                style={{
                  color: disable ? "gray" : "",
                  cursor: disable ? "" : "pointer",
                }}
                onClick={resendOTP}
              >
                {disable ? `Resend OTP in ${timerCount}s` : "Resend OTP"}
              </button>
            </div>
            <button className="auth-button" onClick={verifyOTP}>
              {" "}
              Confirm{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPClass;
