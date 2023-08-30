import React, { useState, useEffect } from "react";
import Axios from "axios";

const Profile = () => {
  const [userIdReg, setUserIdReg] = useState(0);
  const [weightReg, setWeightReg] = useState(0);
  const [heightReg, setHeightReg] = useState(0);
  const [feet, setFeet] = useState(0);
  const [inches, setInches] = useState(0);
  const [ageReg, setAgeReg] = useState(0);
  const [activityLevelReg, setActivityLevelReg] = useState("");
  const [genderReg, setGenderReg] = useState("");
  const [measuremantType, setMeasuremantType] = useState("Imperial");

  useEffect(() => {
    Axios.get("http://localhost:3001/api/login").then((response) => {
      if (response.data.loggedIn) {
        setUserIdReg(response.data.user.id);
      } else {
        setUserIdReg(0);
      }
    });
  }, []);

  const profile = () => {
    console.log(
      userIdReg,
      weightReg,
      heightReg,
      ageReg,
      activityLevelReg,
      genderReg
    );
    Axios.post("http://localhost:3001/api/insert/profile", {
      userId: userIdReg,
      weight: weightReg,
      height: heightReg,
      age: ageReg,
      activityLevel: activityLevelReg,
      gender: genderReg,
    }).then((response) => {
      console.log(response.data);
    });
  };

  const convertWeight = (kgs) => {
    const lbs = kgs * 2.20462262185;
    return Number(lbs.toFixed(2));
  };

  const convertHeightMetric = (cm) => {
    const inches = cm * 0.3937008;
    return Number(inches.toFixed(0));
  };

  const convertHeightImperial = (ft, inches) => {
    const newInches = ft * 12 + inches;
    return newInches;
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
        <div className="form">
          <h1>Profile</h1>
          {measuremantType == "Imperial" ? (
            <div className="height-imperial-container">
              <label>Weight:</label>
              <input
                type="number"
                onChange={(e) => {
                  setWeightReg(parseInt(e.target.value));
                }}
              />
              <label>lbs</label>
              <br></br>
              <label>Height:</label>
              <input
                type="number"
                onChange={(e) => {
                  setFeet(parseInt(e.target.value));
                  setHeightReg((prevHeight) =>
                    convertHeightImperial(parseInt(e.target.value), inches)
                  );
                }}
              />
              <label>ft</label>
              <input
                type="number"
                onChange={(e) => {
                  setInches(parseInt(e.target.value));
                  setHeightReg((prevHeight) =>
                    convertHeightImperial(feet, parseInt(e.target.value))
                  );
                }}
              />
              <label>in</label>
            </div>
          ) : (
            <div>
              <label>Weight:</label>
              <input
                type="number"
                onChange={(e) => {
                  setWeightReg(convertWeight(parseInt(e.target.value)));
                }}
              />
              <label>kgs</label>
              <br></br>
              <label>Height:</label>
              <input
                type="number"
                onChange={(e) => {
                  setHeightReg(convertHeightMetric(parseInt(e.target.value)));
                }}
              />
              <label>cm</label>
              {console.log(weightReg, heightReg)}
            </div>
          )}

          <select
            name="measuremantType"
            id="measuremant-type"
            onChange={(e) => {
              setMeasuremantType(e.target.value);
            }}
          >
            <option value="Imperial">Imperial</option>
            <option value="Metric">Metric</option>
          </select>
          <label>Age:</label>
          <input
            type="number"
            onChange={(e) => {
              setAgeReg(parseInt(e.target.value));
            }}
          />
          <label>Activity Level:</label>
          <select
            name="activityLevel"
            id="activity-level"
            onChange={(e) => {
              setActivityLevelReg(e.target.value);
            }}
          >
            <option value="">Please Select</option>
            <option value="sedentary">Sedentary</option>
            <option value="lightly active">Lightly Active</option>
            <option value="active">Active</option>
            <option value="very active">Very Active</option>
          </select>
          <label>Gender:</label>
          <select
            name="gender"
            id="gender"
            onChange={(e) => {
              setGenderReg(e.target.value);
            }}
          >
            <option value="">Please Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <div className="button-container">
            <button onClick={profile}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
