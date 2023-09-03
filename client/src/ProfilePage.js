import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";

const ProfilePage = (props) => {
  const [infoBool, setInfoBool] = useState(false);
  const activityLevelPoints = {
    Sedentary: 1.2,
    "Lightly Active": 1.37,
    Active: 1.55,
    "Very Active": 1.725,
  };

  useEffect(() => {
    const { loginStatus, setUserProfile, setUserProfileDisplay } = props;

    if (loginStatus) {
      Axios.get(`http://localhost:3001/api/get/profile/${loginStatus.id}`)
        .then((response) => {
          const userProfileWithNA = Object.keys(response.data).reduce(
            (acc, key) => {
              acc[key] =
                response.data[key] === 0 ||
                response.data[key] === "" ||
                response.data[key] === null
                  ? "N/A"
                  : response.data[key];
              return acc;
            },
            {}
          );
          setUserProfile(response.data);
          setUserProfileDisplay(userProfileWithNA);
        })
        .catch((error) => {
          console.error("Error fetching profile data:", error);
        });
    }
  }, [props]);

  useEffect(() => {
    if (props.userProfileDisplay) {
      const allValuesAreProper = Object.values(props.userProfileDisplay).every(
        (value) => value !== "N/A"
      );

      if (allValuesAreProper) {
        setInfoBool(true);
      } else {
        setInfoBool(false);
      }
    }
  }, [props.userProfileDisplay]);

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(2));
  };

  const defaultConvertHeightMetric = (inches) => {
    const cm = inches / 0.3937008;
    return Number(cm.toFixed(0));
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

  return (
    <div className="App">
      <div className="profile container">
        {props.userProfileDisplay && (
          <div>
            <h2>Profile</h2>
            {props.userProfileDisplay.measurement_type === "imperial" ? (
              <div>
                {props.userProfileDisplay.weight === "N/A" ? (
                  <div className="flex">
                    <label>Weight: </label>
                    <p className="item">N/A</p>
                  </div>
                ) : (
                  <div className="flex">
                    <label>Weight: </label>
                    <p className="item">
                      {props.userProfileDisplay.weight} lbs
                    </p>
                  </div>
                )}
                {props.userProfileDisplay.height === "N/A" ? (
                  <div className="flex">
                    <label>Height: </label>
                    <p className="item">N/A</p>
                  </div>
                ) : (
                  <div className="flex">
                    <label>Height: </label>
                    <p className="item">
                      {Math.floor(props.userProfileDisplay.height / 12)} ft
                    </p>
                    <p className="item">
                      {props.userProfileDisplay.height % 12} in
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {props.userProfileDisplay.weight === "N/A" ? (
                  <div className="flex">
                    <label>Weight: </label>
                    <p className="item">N/A</p>
                  </div>
                ) : (
                  <div className="flex">
                    <label>Weight: </label>
                    <p className="item">
                      {defaultConvertWeight(props.userProfileDisplay.weight)} kg
                    </p>
                  </div>
                )}
                {props.userProfileDisplay.height === "N/A" ? (
                  <div className="flex">
                    <label>Height: </label>
                    <p className="item">N/A</p>
                  </div>
                ) : (
                  <div className="flex">
                    <label>Height: </label>
                    <p className="item">
                      {defaultConvertHeightMetric(
                        props.userProfileDisplay.height
                      )}{" "}
                      cm
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="flex">
              <label>Age: </label>
              <p className="item">{props.userProfileDisplay.age}</p>
            </div>
            <div className="flex">
              <label>Activity Level: </label>
              <p className="item">{props.userProfileDisplay.activity_level}</p>
            </div>
            <div className="flex">
              <label>Gender: </label>
              <p className="item">{props.userProfileDisplay.gender}</p>
            </div>
            {infoBool && props.userProfileDisplay.gender === "Male" ? (
              <div className="flex">
                <label>Estimated Daily Calories Burned:</label>
                <p className="item">
                  {Math.floor(
                    caloriesBurnedMen(
                      props.userProfileDisplay.weight,
                      props.userProfileDisplay.height,
                      props.userProfileDisplay.age,
                      activityLevelPoints[
                        props.userProfileDisplay.activity_level
                      ]
                    )
                  )}
                </p>
              </div>
            ) : infoBool && props.userProfileDisplay.gender === "Female" ? (
              <div className="flex">
                <label>Estimated Daily Calories Burned: </label>
                <p className="item">
                  {Math.floor(
                    caloriesBurnedWomen(
                      props.userProfileDisplay.weight,
                      props.userProfileDisplay.height,
                      props.userProfileDisplay.age,
                      activityLevelPoints[
                        props.userProfileDisplay.activity_level
                      ]
                    )
                  )}
                </p>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        )}

        <Link to="/profile-form">
          <div className="button-container">
            <button>Edit Profile</button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
