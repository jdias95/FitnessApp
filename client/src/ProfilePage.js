import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProfilePage = (props) => {
  const { loginStatus, userProfile } = props;
  const [infoBool, setInfoBool] = useState(false);
  const [calorieBudget, setCalorieBudget] = useState(0);
  const weightGoalList = {
    imperial: {
      "-2": "Lose 0.5 pounds per week",
      "-4": "Lose 1 pound per week",
      "-6": "Lose 1.5 pounds per week",
      "-8": "Lose 2 pounds per week",
      0: "Maintain Weight",
      2: "Gain 0.5 pounds per week",
      4: "Gain 1 pound per week",
    },
    metric: {
      "-2": "Lose 0.25 kilograms per week",
      "-4": "Lose 0.5 kilogram per week",
      "-6": "Lose 0.75 kilograms per week",
      "-8": "Lose 1 kilograms per week",
      0: "Maintain Weight",
      2: "Gain 0.25 kilograms per week",
      4: "Gain 0.5 kilogram per week",
    },
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatus === false) {
      localStorage.clear();
      navigate("/login");
    }
  }, [loginStatus, navigate]);

  const activityLevelPoints = useMemo(() => {
    return {
      Sedentary: 1.2,
      "Lightly Active": 1.37,
      Active: 1.55,
      "Very Active": 1.725,
      "Extremely Active": 1.9,
    };
  }, []);

  useEffect(() => {
    if (userProfile) {
      if (
        userProfile.weight &&
        userProfile.height &&
        userProfile.age &&
        userProfile.activity_level &&
        userProfile.gender
      ) {
        setInfoBool(true);
      } else {
        setInfoBool(false);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const calorieBudgetCalculator = (weightGoal, gender) => {
      let weeklyCaloriesBurned;
      switch (gender) {
        case "Male":
          weeklyCaloriesBurned =
            caloriesBurnedMen(
              userProfile.weight,
              userProfile.height,
              userProfile.age,
              activityLevelPoints[userProfile.activity_level]
            ) * 7;
          break;
        case "Female":
          weeklyCaloriesBurned =
            caloriesBurnedWomen(
              userProfile.weight,
              userProfile.height,
              userProfile.age,
              activityLevelPoints[userProfile.activity_level]
            ) * 7;
          break;
        default:
          break;
      }

      let weeklyCalorieChange;
      switch (weightGoal) {
        case -2:
        case 2:
          weeklyCalorieChange = 0.5 * 3500;
          break;
        case -4:
        case 4:
          weeklyCalorieChange = 1 * 3500;
          break;
        case -6:
          weeklyCalorieChange = 1.5 * 3500;
          break;
        case -8:
          weeklyCalorieChange = 2 * 3500;
          break;
        case 0:
          weeklyCalorieChange = 0;
          break;
        default:
          break;
      }

      if (weightGoal >= 0) {
        return Math.floor((weeklyCaloriesBurned + weeklyCalorieChange) / 7);
      }
      if (weightGoal < 0) {
        return Math.floor((weeklyCaloriesBurned - weeklyCalorieChange) / 7);
      }
    };

    if (
      infoBool &&
      userProfile.weight_goal !== null &&
      userProfile.target_weight
    ) {
      setCalorieBudget(
        calorieBudgetCalculator(userProfile.weight_goal, userProfile.gender)
      );
    }
  }, [infoBool, userProfile, calorieBudget, activityLevelPoints]);

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(1));
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
        {userProfile && (
          <div>
            <h2>Profile</h2>
            {userProfile.measurement_type !== "metric" ? (
              <div>
                <div className="flex spec">
                  <label>Weight: </label>
                  <p className="item">
                    {userProfile.weight ? userProfile.weight : ""} lbs
                  </p>
                </div>
                <div className="flex spec">
                  <label>Height: </label>
                  <div className="flex">
                    <p className="item">
                      {userProfile.height
                        ? Math.floor(userProfile.height / 12)
                        : ""}{" "}
                      ft
                    </p>
                    <p className="item">
                      {userProfile.height ? userProfile.height % 12 : ""} in
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex spec">
                  <label>Weight: </label>
                  <p className="item">
                    {userProfile.weight
                      ? defaultConvertWeight(userProfile.weight)
                      : ""}{" "}
                    kg
                  </p>
                </div>
                <div className="flex spec">
                  <label>Height: </label>
                  <p className="item">
                    {userProfile.height
                      ? defaultConvertHeightMetric(userProfile.height)
                      : ""}{" "}
                    cm
                  </p>
                </div>
              </div>
            )}
            <div className="flex spec">
              <label>Age: </label>
              <p className="item">{userProfile.age ? userProfile.age : ""}</p>
            </div>
            <div className="flex spec">
              <label>Activity Level: </label>
              <p className="item">
                {userProfile.activity_level ? userProfile.activity_level : ""}
              </p>
            </div>
            <div className="flex spec">
              <label>Gender: </label>
              <p className="item">
                {userProfile.gender ? userProfile.gender : ""}
              </p>
            </div>
            <div className="flex spec">
              <label>Weekly Goal: </label>
              <p className="item">
                {userProfile.weight_goal !== null
                  ? weightGoalList[userProfile.measurement_type][
                      userProfile.weight_goal
                    ]
                  : ""}
              </p>
            </div>
            <div className="flex spec">
              <label>Target Weight: </label>
              {userProfile && userProfile.measurement_type !== "metric" ? (
                <p className="item">
                  {userProfile.target_weight ? userProfile.target_weight : ""}{" "}
                  lbs
                </p>
              ) : (
                <p className="item">
                  {userProfile.target_weight
                    ? defaultConvertWeight(userProfile.target_weight)
                    : ""}{" "}
                  kgs
                </p>
              )}
            </div>
            {infoBool && userProfile.gender === "Male" ? (
              <div className="flex spec">
                <label>Daily Calories Burned:</label>
                <p className="item">
                  {Math.floor(
                    caloriesBurnedMen(
                      userProfile.weight,
                      userProfile.height,
                      userProfile.age,
                      activityLevelPoints[userProfile.activity_level]
                    )
                  )}
                </p>
              </div>
            ) : infoBool && userProfile.gender === "Female" ? (
              <div className="flex spec">
                <label>Daily Calories Burned: </label>
                <p className="item">
                  {Math.floor(
                    caloriesBurnedWomen(
                      userProfile.weight,
                      userProfile.height,
                      userProfile.age,
                      activityLevelPoints[userProfile.activity_level]
                    )
                  )}
                </p>
              </div>
            ) : null}
            {calorieBudget && userProfile.weight_goal !== 0 ? (
              <div className="flex spec">
                <label>Calorie Budget: </label>
                <p className="item">{calorieBudget}</p>
              </div>
            ) : null}
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
