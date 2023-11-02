import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = (props) => {
  const {
    loginStatus,
    userProfile,
    setUserProfile,
    previousWeight,
    setPreviousWeight,
    formattedDate,
    setWeightData,
    weightData,
    convertWeight,
    defaultConvertWeight,
    safeParseFloat,
    defaultConvertHeightMetric,
    apiURL,
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
  const [weightGoalReg, setWeightGoalReg] = useState(
    userProfile && userProfile.weight_goal ? userProfile.weight_goal : 0
  );
  const [targetWeightReg, setTargetWeightReg] = useState(
    userProfile && userProfile.target_weight ? userProfile.target_weight : 0
  );
  const navigate = useNavigate();

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
      setWeightGoalReg(savedFormData.weight_goal);
      setTargetWeightReg(savedFormData.target_weight);
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
        weight_goal: weightGoalReg,
        target_weight: targetWeightReg,
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
    weightGoalReg,
    targetWeightReg,
  ]);

  const profileUpdate = () => {
    Axios.put(`${apiURL}/api/update/profile/${loginStatus.id}`, {
      weight: weightReg,
      height: heightReg,
      age: ageReg,
      activityLevel: activityLevelReg,
      gender: genderReg,
      measurementType: measurementType,
      weightGoal: weightGoalReg,
      targetWeight: targetWeightReg,
    })
      .then(() => {
        setUserProfile({
          weight: weightReg,
          height: heightReg,
          age: ageReg,
          activity_level: activityLevelReg,
          gender: genderReg,
          measurement_type: measurementType,
          weight_goal: weightGoalReg,
          target_weight: targetWeightReg,
        });
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });

    if (
      previousWeight.date &&
      previousWeight.date.slice(0, 10) === formattedDate.slice(0, 10)
    ) {
      Axios.put(`${apiURL}/api/update/weight/${loginStatus.id}`, {
        userId: loginStatus.id,
        weight: weightReg,
        date: formattedDate.slice(0, 10),
      })
        .then(() => {
          const updatedWeightData = [...weightData];

          updatedWeightData[updatedWeightData.length - 1] = {
            weight: weightReg,
            date: updatedWeightData[updatedWeightData.length - 1].date,
          };

          setWeightData(updatedWeightData);
        })
        .catch((error) => {
          console.error("Error setting weight:", error);
        });
    } else {
      Axios.post(`${apiURL}/api/insert/weight`, {
        userId: loginStatus.id,
        weight: weightReg,
        date: formattedDate,
      })
        .then(
          setWeightData([
            ...weightData,
            {
              weight: weightReg,
              date: formattedDate,
            },
          ])
        )
        .catch((error) => {
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

  useEffect(() => {
    if (weightGoalReg === 0) {
      setTargetWeightReg(0);
    }
  }, [weightGoalReg]);

  const convertHeightMetric = (cm) => {
    const inches = cm * 0.3937008;
    return Number(inches.toFixed(0));
  };

  const convertHeightImperial = (ft, inches) => {
    const newInches = ft * 12 + inches;
    return newInches;
  };

  const safeParseInt = (str) => {
    try {
      const parsedValue = parseInt(str);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        if (str.length >= 3) {
          return parseInt(str.slice(0, 2));
        }
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
      <div className="flex-center">
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
                        placeholder="0"
                        min="0"
                        max="1000"
                        maxLength="4"
                        value={!weightReg ? "" : weightReg}
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
                        placeholder="0"
                        min="0"
                        max="10"
                        maxLength="2"
                        value={!feet ? "" : feet}
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
                        placeholder="0"
                        min="0"
                        max="12"
                        maxLength="2"
                        value={!inches ? "" : inches}
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
                        placeholder="0"
                        min="0"
                        max="500"
                        maxLength="3"
                        value={
                          !weightReg ? "" : defaultConvertWeight(weightReg)
                        }
                        onChange={(e) => {
                          setWeightReg(
                            convertWeight(safeParseFloat(e.target.value))
                          );
                        }}
                      />
                      <label>kgs</label>
                    </div>
                  </div>
                  <div className="flex spec">
                    <label>Height: </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="wide"
                        placeholder="0"
                        min="0"
                        max="500"
                        maxLength="3"
                        value={!cm ? "" : cm}
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
                      placeholder="0"
                      min="0"
                      max="100"
                      maxLength="3"
                      value={!ageReg ? "" : ageReg}
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
                        <option value="Extremely Active">
                          Extremely Active
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex spec">
                  <label>Gender: </label>
                  <div className="flex">
                    <select
                      name="gender"
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
                <div className="flex spec">
                  <label>Weekly Goal: </label>
                  {measurementType !== "metric" ? (
                    <div className="flex">
                      <select
                        value={weightGoalReg}
                        onChange={(e) => {
                          setWeightGoalReg(parseInt(e.target.value));
                        }}
                      >
                        <option value={-8}>Lose 2 pounds per week</option>
                        <option value={-6}>Lose 1.5 pounds per week</option>
                        <option value={-4}>Lose 1 pound per week</option>
                        <option value={-2}>Lose 0.5 pounds per week</option>
                        <option value={0}>Maintain Weight</option>
                        <option value={2}>Gain 0.5 pounds per week</option>
                        <option value={4}>Gain 1 pound per week</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex">
                      <select
                        value={weightGoalReg}
                        onChange={(e) => {
                          setWeightGoalReg(parseInt(e.target.value));
                        }}
                      >
                        <option value={-8}>Lose 1 kiliogram per week</option>
                        <option value={-6}>
                          Lose 0.75 kiliograms per week
                        </option>
                        <option value={-4}>Lose 0.5 kilograms per week</option>
                        <option value={-2}>
                          Lose 0.25 kiliograms per week
                        </option>
                        <option value={0}>Maintain Weight</option>
                        <option value={2}>Gain 0.25 kiliograms per week</option>
                        <option value={4}>Gain 0.5 kilograms per week</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex spec">
                  <label>Target Weight: </label>
                  {measurementType !== "metric" ? (
                    <div>
                      {weightGoalReg ? (
                        <div className="flex">
                          <input
                            type="number"
                            step="0.1"
                            id="wide"
                            placeholder="0"
                            min="0"
                            max="1000"
                            maxLength="4"
                            value={!targetWeightReg ? "" : targetWeightReg}
                            onChange={(e) => {
                              setTargetWeightReg(
                                safeParseFloat(e.target.value)
                              );
                            }}
                          />
                          <p>lbs</p>
                        </div>
                      ) : (
                        <div className="flex">
                          <input type="number" value="" id="wide" disabled />
                          <p>lbs</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {weightGoalReg ? (
                        <div className="flex">
                          <input
                            type="number"
                            step="0.1"
                            id="wide"
                            placeholder="0"
                            min="0"
                            max="500"
                            maxLength="3"
                            value={
                              !targetWeightReg
                                ? ""
                                : defaultConvertWeight(targetWeightReg)
                            }
                            onChange={(e) => {
                              setTargetWeightReg(
                                convertWeight(safeParseFloat(e.target.value))
                              );
                            }}
                          />
                          <p>kgs</p>
                        </div>
                      ) : (
                        <div className="flex">
                          <input type="number" value="" id="wide" disabled />
                          <p>kgs</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="button-container">
                <button onClick={profileUpdate}>Confirm</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
