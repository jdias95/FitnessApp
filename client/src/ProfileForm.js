import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = (props) => {
  const {
    loginStatus,
    userProfile,
    setUserProfileDisplay,
    previousWeight,
    setPreviousWeight,
    formattedDate,
  } = props;
  const [weightReg, setWeightReg] = useState(
    userProfile && userProfile.weight ? userProfile.weight : 0
  );
  const [heightReg, setHeightReg] = useState(
    userProfile && userProfile.height ? userProfile.height : 0
  );
  const [feet, setFeet] = useState(
    userProfile && userProfile.height ? Math.floor(userProfile.height / 12) : 0
  );
  const [inches, setInches] = useState(
    userProfile && userProfile.height ? userProfile.height % 12 : 0
  );
  const [cm, setCm] = useState(
    userProfile && userProfile.height
      ? Math.floor(userProfile.height / 0.3937008)
      : 0
  );
  const [ageReg, setAgeReg] = useState(
    userProfile && userProfile.age ? userProfile.age : 0
  );
  const [activityLevelReg, setActivityLevelReg] = useState(
    userProfile && userProfile.activity_level ? userProfile.activity_level : ""
  );
  const [genderReg, setGenderReg] = useState(
    userProfile && userProfile.gender ? userProfile.gender : ""
  );
  const [measurementType, setMeasurementType] = useState(
    userProfile && userProfile.measurement_type
      ? userProfile.measurement_type
      : ""
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatus === false) {
      localStorage.clear();
      navigate("/login");
    }
  }, [loginStatus, navigate]);

  useEffect(() => {
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
  }, [setPreviousWeight]);

  useEffect(() => {
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
    return () => {
      localStorage.removeItem("profileFormData");
    };
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
    Axios.put(`http://localhost:3001/api/update/profile/${loginStatus.id}`, {
      weight: weightReg,
      height: heightReg,
      age: ageReg,
      activityLevel: activityLevelReg,
      gender: genderReg,
      measurementType: measurementType,
    })
      .then((response) => {
        setUserProfileDisplay({
          weight: weightReg,
          height: heightReg,
          age: ageReg,
          activityLevel: activityLevelReg,
          gender: genderReg,
          measurementType: measurementType,
        });
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });

    if (previousWeight.date === formattedDate) {
      Axios.put(`http://localhost:3001/api/update/weight/${loginStatus.id}`, {
        userId: loginStatus.id,
        weight: weightReg,
        date: formattedDate,
      }).catch((error) => {
        console.error("Error setting weight:", error);
      });
    } else if (previousWeight.date !== formattedDate) {
      Axios.post("http://localhost:3001/api/insert/weight", {
        userId: loginStatus.id,
        weight: weightReg,
        date: formattedDate,
      }).catch((error) => {
        console.error("Error setting weight:", error);
      });
    }
    setPreviousWeight({
      ...previousWeight,
      weight: weightReg,
      date: formattedDate,
    });
    navigate("/profile");
  };

  const convertWeight = (kgs) => {
    const lbs = kgs * 2.20462262185;
    return Number(lbs.toFixed(1));
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
    return Number(kgs.toFixed(1));
  };

  const defaultConvertHeightMetric = (inches) => {
    const cm = inches / 0.3937008;
    return Number(cm.toFixed(0));
  };

  const safeParseFloat = (str) => {
    try {
      const parsedValue = parseFloat(str);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        return parsedValue;
      } else {
        throw new Error("Value is not a valid number.");
      }
    } catch (error) {
      return 0;
    }
  };

  const safeParseInt = (str) => {
    try {
      const parsedValue = parseInt(str);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        return parsedValue;
      } else {
        throw new Error("Value is not a valid number.");
      }
    } catch (error) {
      return 0;
    }
  };

  return (
    <div className="App">
      <div className="profile container">
        {userProfile && (
          <div className="form">
            <h2>Profile</h2>
            <div className="spec">
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
            </div>
            {measurementType !== "metric" ? (
              <div>
                <div className="flex spec">
                  <label>Weight: </label>
                  <div className="flex">
                    <input
                      type="number"
                      step="0.1"
                      id="wide"
                      value={weightReg}
                      onChange={(e) => {
                        setWeightReg(safeParseFloat(e.target.value));
                      }}
                    />
                    <p>lbs</p>
                  </div>
                </div>
                <div className="flex spec">
                  <label>Height: </label>
                  <div className="flex">
                    <input
                      type="number"
                      id="wide"
                      value={feet}
                      onChange={(e) => {
                        const newFeet = safeParseInt(e.target.value);
                        const newHeight = convertHeightImperial(
                          newFeet,
                          inches
                        );
                        setFeet(newFeet);
                        setCm(
                          defaultConvertHeightMetric(newFeet * 12 + inches)
                        );
                        setHeightReg(newHeight);
                      }}
                    />
                    <label>ft </label>
                    <input
                      type="number"
                      id="wide"
                      value={inches}
                      onChange={(e) => {
                        const newInches = safeParseInt(e.target.value);
                        const newHeight = convertHeightImperial(
                          feet,
                          newInches
                        );
                        setInches(newInches);
                        setCm(
                          defaultConvertHeightMetric(feet * 12 + newInches)
                        );
                        setHeightReg(newHeight);
                      }}
                    />
                    <label>in</label>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex spec">
                  <label>Weight: </label>
                  <div className="flex">
                    <input
                      type="number"
                      step="0.1"
                      id="wide"
                      value={defaultConvertWeight(weightReg)}
                      onChange={(e) => {
                        setWeightReg(
                          convertWeight(safeParseFloat(e.target.value))
                        );
                      }}
                    />
                    <label>kg</label>
                  </div>
                </div>
                <div className="flex spec">
                  <label>Height: </label>
                  <div className="flex">
                    <input
                      type="number"
                      id="wide"
                      value={cm}
                      onChange={(e) => {
                        const newCm = safeParseInt(e.target.value);
                        const newHeight = convertHeightMetric(newCm);
                        setCm(newCm);
                        setFeet(Math.floor(convertHeightMetric(newCm) / 12));
                        setInches(convertHeightMetric(newCm) % 12);
                        setHeightReg(newHeight);
                      }}
                    />
                    <label>cm</label>
                  </div>
                </div>
              </div>
            )}
            <div>
              <div className="flex spec">
                <label>Age: </label>
                <div className="flex">
                  <input
                    type="number"
                    id="wide"
                    value={ageReg}
                    onChange={(e) => {
                      setAgeReg(safeParseInt(e.target.value));
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex spec">
                  <label>Activity Level: </label>
                  <div className="flex">
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
                </div>
              </div>
            </div>
            <div>
              <div className="flex spec">
                <label>Gender: </label>
                <div className="flex">
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
              </div>
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
