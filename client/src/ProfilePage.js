import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";

const ProfilePage = (props) => {
  const activityLevelPoints = {
    sedentary: 1.2,
    "lightly active": 1.37,
    active: 1.55,
    "very active": 1.725,
  };

  useEffect(() => {
    if (props.loginStatus) {
      Axios.get(`http://localhost:3001/api/get/profile/${props.loginStatus.id}`)
        .then((response) => {
          props.setUserProfileDisplay(response.data);
        })
        .catch((error) => {
          console.error("Error fetching profile data:", error);
        });
    }
  }, [props.loginStatus]);

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(2));
  };

  const defaultConvertHeightMetric = (inches) => {
    const cm = inches / 0.3937008;
    return Number(cm.toFixed(0));
  };

  const defaultConvertHeightImperial = (inches) => {
    const ft = Math.floor(inches / 12);
    const newInches = inches % 12;
    return [ft, newInches];
  };

  const caloriesBurnedMen = (weight, height, age, activityLevel) => {
    const bmr = 66 + 6.2 * weight + 12.7 * height - 6.76 * age;
    const total = bmr * activityLevel;
    return total;
  };

  const caloriesBurnedWomen = (weight, height, age, activityLevel) => {
    const bmr = 655.1 + 4.35 * weight + 4.7 * height - 4.7 * age;
    const total = bmr * activityLevel;
    return total;
  };

  useEffect(() => {
    console.log(props.userProfileDisplay);
  });

  return (
    <div className="App">
      <div className="profile container">
        <div>
          {props.userProfileDisplay && (
            <div>
              {console.log(props.userProfileDisplay)}
              <h1>Profile</h1>
              {props.userProfileDisplay.measurement_type === "imperial" ? (
                <div>
                  <h2>Weight:</h2>
                  <p>{props.userProfileDisplay.weight} lbs</p>
                  <h2>Height:</h2>
                  <p>
                    {
                      defaultConvertHeightImperial(
                        props.userProfileDisplay.height
                      )[0]
                    }{" "}
                    ft
                  </p>
                  <p>
                    {
                      defaultConvertHeightImperial(
                        props.userProfileDisplay.height
                      )[1]
                    }{" "}
                    in
                  </p>
                </div>
              ) : (
                <div>
                  <h2>Weight:</h2>
                  <p>
                    {defaultConvertWeight(props.userProfileDisplay.weight)} kg
                  </p>
                  <h2>Height:</h2>
                  <p>
                    {defaultConvertHeightMetric(
                      props.userProfileDisplay.height
                    )}{" "}
                    cm
                  </p>
                </div>
              )}
              <h2>Age:</h2>
              <p>{props.userProfileDisplay.age}</p>
              <h2>Activity Level:</h2>
              <p>
                {props.userProfileDisplay.activity_level
                  .charAt(0)
                  .toUpperCase() +
                  props.userProfileDisplay.activity_level.slice(1)}
              </p>
              <h2>Gender:</h2>
              <p>
                {props.userProfileDisplay.gender.charAt(0).toUpperCase() +
                  props.userProfileDisplay.gender.slice(1)}
              </p>
            </div>
          )}
          <Link to="/profile-form">
            <div className="button-container">
              <button>Edit Profile</button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
