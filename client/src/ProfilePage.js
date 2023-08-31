import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";

const ProfilePage = (props) => {
  const [userProfile, setUserProfile] = useState(null);
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
          const userProfileWithNA = Object.keys(response.data).reduce(
            (acc, key) => {
              acc[key] =
                response.data[key] === null ? "N/A" : response.data[key];
              return acc;
            },
            {}
          );
          setUserProfile(userProfileWithNA);
        })
        .catch((error) => {
          console.error("Error fetching profile data:", error);
        });
    }
  }, [props.loginStatus]);

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
        <div>
          {!userProfile ? (
            <div>
              <h1>Profile</h1>
              <h2>Weight:</h2>
              <p>N/A</p>
              <h2>Height:</h2>
              <p>N/A</p>
              <h2>Age:</h2>
              <p>N/A</p>
              <h2>Activity Level:</h2>
              <p>N/A</p>
              <h2>Gender:</h2>
              <p>N/A</p>
            </div>
          ) : (
            userProfile && (
              <div>
                <h1>Profile</h1>
                <h2>Weight:</h2>
                <p>{userProfile.weight}</p>
                <h2>Height:</h2>
                <p>{userProfile.height}</p>
                <h2>Age:</h2>
                <p>{userProfile.age}</p>
                <h2>Activity Level:</h2>
                <p>{userProfile.activity_level}</p>
                <h2>Gender:</h2>
                <p>{userProfile.gender}</p>
              </div>
            )
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
