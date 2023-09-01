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
              <h2>Weight:</h2>
              <p>{props.userProfileDisplay.weight}</p>
              <h2>Height:</h2>
              <p>{props.userProfileDisplay.height}</p>
              <h2>Age:</h2>
              <p>{props.userProfileDisplay.age}</p>
              <h2>Activity Level:</h2>
              <p>{props.userProfileDisplay.activity_level}</p>
              <h2>Gender:</h2>
              <p>{props.userProfileDisplay.gender}</p>
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
