import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = (props) => {
  const [weightReg, setWeightReg] = useState(
    props.userProfile && props.userProfile.weight ? props.userProfile.weight : 0
  );
  const [heightReg, setHeightReg] = useState(
    props.userProfile && props.userProfile.height ? props.userProfile.height : 0
  );
  const [feet, setFeet] = useState(
    props.userProfile && props.userProfile.height
      ? Math.floor(props.userProfile.height / 12)
      : 0
  );
  const [inches, setInches] = useState(
    props.userProfile && props.userProfile.height
      ? props.userProfile.height % 12
      : 0
  );
  const [cm, setCm] = useState(
    props.userProfile && props.userProfile.height
      ? Math.floor(props.userProfile.height / 0.3937008)
      : 0
  );
  const [ageReg, setAgeReg] = useState(
    props.userProfile && props.userProfile.age ? props.userProfile.age : 0
  );
  const [activityLevelReg, setActivityLevelReg] = useState(
    props.userProfile && props.userProfile.activity_level
      ? props.userProfile.activity_level
      : ""
  );
  const [genderReg, setGenderReg] = useState(
    props.userProfile && props.userProfile.gender
      ? props.userProfile.gender
      : ""
  );
  const [measurementType, setMeasurementType] = useState(
    props.userProfile && props.userProfile.measurement_type
      ? props.userProfile.measurement_type
      : ""
  );
  const navigate = useNavigate();

  useEffect(() => {
    // Load data from local storage if available
    const savedFormData = JSON.parse(localStorage.getItem("profileFormData"));
    if (savedFormData) {
      setWeightReg(savedFormData.weight);
      setHeightReg(savedFormData.height);
      setAgeReg(savedFormData.age);
      setActivityLevelReg(savedFormData.activity_level);
      setGenderReg(savedFormData.gender);
      setMeasurementType(savedFormData.measurement_type);
      setFeet(savedFormData.feet);
      setInches(savedFormData.inches);
      setCm(savedFormData.cm);
    }
  }, []);

  useEffect(() => {
    // Save data to local storage whenever the state changes
    localStorage.setItem(
      "profileFormData",
      JSON.stringify({
        weight: weightReg,
        height: heightReg,
        age: ageReg,
        activity_level: activityLevelReg,
        gender: genderReg,
        measurement_type: measurementType,
        feet: feet,
        inches: inches,
        cm: cm,
      })
    );
  }, [
    weightReg,
    heightReg,
    ageReg,
    activityLevelReg,
    genderReg,
    measurementType,
    feet,
    inches,
    cm,
  ]);

  const profileUpdate = () => {
    Axios.put(
      `http://localhost:3001/api/update/profile/${props.loginStatus.id}`,
      {
        weight: weightReg,
        height: heightReg,
        age: ageReg,
        activityLevel: activityLevelReg,
        gender: genderReg,
        measurementType: measurementType,
      }
    )
      .then((response) => {
        console.log(response.data);
        props.setUserProfileDisplay(response.data);
        navigate("/profile");
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
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

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(2));
  };

  const defaultConvertHeightMetric = (inches) => {
    const cm = inches / 0.3937008;
    return Number(cm.toFixed(0));
  };

  return (
    <div className="App">
      <div className="profile container">
        {props.userProfile && (
          <div className="form">
            <h1>Profile</h1>
            <select
              name="measurementType"
              id="input"
              value={measurementType}
              onChange={(e) => {
                setMeasurementType(e.target.value);
              }}
            >
              <option value="imperial">Imperial</option>
              <option value="metric">Metric</option>
            </select>
            {measurementType === "imperial" ? (
              <div>
                <label>Weight: </label>
                <input
                  type="number"
                  step="0.01"
                  id="input"
                  value={weightReg}
                  onChange={(e) => {
                    setWeightReg(parseFloat(e.target.value));
                  }}
                />
                <label>lbs</label>
                <br></br>
                <label>Height: </label>
                <input
                  type="number"
                  id="input"
                  value={feet}
                  onChange={(e) => {
                    const newFeet = parseInt(e.target.value);
                    const newHeight = convertHeightImperial(newFeet, inches);
                    setFeet(newFeet);
                    setCm(defaultConvertHeightMetric(newFeet * 12 + inches));
                    setHeightReg(newHeight);
                  }}
                />
                <label> ft </label>
                <input
                  type="number"
                  id="input"
                  value={inches}
                  onChange={(e) => {
                    const newInches = parseInt(e.target.value);
                    const newHeight = convertHeightImperial(feet, newInches);
                    setInches(newInches);
                    setCm(defaultConvertHeightMetric(feet * 12 + newInches));
                    setHeightReg(newHeight);
                  }}
                />
                <label> in</label>
              </div>
            ) : (
              <div>
                <label>Weight: </label>
                <input
                  type="number"
                  step="0.01"
                  id="input"
                  value={defaultConvertWeight(weightReg)}
                  onChange={(e) => {
                    setWeightReg(convertWeight(parseFloat(e.target.value)));
                  }}
                />
                <label> kg</label>
                <br></br>
                <label>Height: </label>
                <input
                  type="number"
                  id="input"
                  value={cm}
                  onChange={(e) => {
                    const newCm = parseInt(e.target.value);
                    const newHeight = convertHeightMetric(newCm);
                    setCm(newCm);
                    setFeet(Math.floor(convertHeightMetric(newCm) / 12));
                    setInches(convertHeightMetric(newCm) % 12);
                    setHeightReg(newHeight);
                    console.log(newCm, newHeight, cm, heightReg);
                  }}
                />
                <label> cm</label>
              </div>
            )}
            <div>
              <label>Age: </label>
              <input
                type="number"
                id="input"
                value={ageReg}
                onChange={(e) => {
                  setAgeReg(parseInt(e.target.value));
                }}
              />
            </div>
            <div>
              <label>Activity Level: </label>
              <select
                name="activityLevel"
                id="input"
                value={activityLevelReg}
                onChange={(e) => {
                  setActivityLevelReg(e.target.value);
                }}
              >
                <option value="">Please Select</option>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Active">Active</option>
                <option value="Very Active">Very Active</option>
              </select>
            </div>
            <div>
              <label>Gender: </label>
              <select
                name="gender"
                id="input"
                value={genderReg}
                onChange={(e) => {
                  setGenderReg(e.target.value);
                }}
              >
                <option value="">Please Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="button-container">
              <button onClick={profileUpdate}>Confirm</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
