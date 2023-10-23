import React, { useState } from "react";
import Axios from "axios";

const WeightFormModal = (props) => {
  const {
    loginStatus,
    userProfile,
    onClose,
    previousWeight,
    setPreviousWeight,
    formattedDate,
    setWeightData,
    weightData,
    setUserProfile,
    convertWeight,
    defaultConvertWeight,
    safeParseFloat,
  } = props;
  const [weightReg, setWeightReg] = useState(
    previousWeight ? previousWeight.weight : 0
  );

  const setWeight = () => {
    Axios.put(`http://localhost:3001/api/update/profile/${loginStatus.id}`, {
      userId: loginStatus.id,
      weight: weightReg,
      height: userProfile.height,
      age: userProfile.age,
      activityLevel: userProfile.activity_level,
      gender: userProfile.gender,
      measurementType: userProfile.measurement_type,
      weightGoal: userProfile.weight_goal,
      targetWeight: userProfile.target_weight,
    }).catch((error) => {
      console.error("Error updating weight:", error);
    });

    if (
      previousWeight.date &&
      previousWeight.date.slice(0, 10) === formattedDate.slice(0, 10)
    ) {
      Axios.put(`http://localhost:3001/api/update/weight/${loginStatus.id}`, {
        userId: loginStatus.id,
        weight: weightReg,
        date: formattedDate.slice(0, 10),
      })
        .then((response) => {
          const updatedWeightData = [...weightData];

          if (userProfile && userProfile.measurement_type !== "metric") {
            updatedWeightData[updatedWeightData.length - 1] = {
              weight: weightReg,
              date: updatedWeightData[updatedWeightData.length - 1].date,
            };
          } else {
            updatedWeightData[updatedWeightData.length - 1] = {
              weight: defaultConvertWeight(weightReg),
              date: updatedWeightData[updatedWeightData.length - 1].date,
            };
          }

          setWeightData(updatedWeightData);

          setPreviousWeight({
            ...previousWeight,
            weight: weightReg,
            date: formattedDate,
          });
          setUserProfile((prevUserProfile) => ({
            ...prevUserProfile,
            weight: weightReg,
          }));

          onClose();
        })
        .catch((error) => {
          console.error("Error setting weight:", error);
        });
    } else {
      Axios.post("http://localhost:3001/api/insert/weight", {
        userId: loginStatus.id,
        weight: weightReg,
        date: formattedDate,
      })
        .then((response) => {
          if (userProfile && userProfile.measurement_type !== "metric") {
            setWeightData([
              ...weightData,
              {
                weight: weightReg,
                date: formattedDate,
              },
            ]);
          } else {
            setWeightData([
              ...weightData,
              {
                weight: defaultConvertWeight(weightReg),
                date: formattedDate,
              },
            ]);
          }

          setPreviousWeight({
            ...previousWeight,
            weight: weightReg,
            date: formattedDate,
          });
          setUserProfile((prevUserProfile) => ({
            ...prevUserProfile,
            weight: weightReg,
          }));

          onClose();
        })
        .catch((error) => {
          console.error("Error setting weight:", error);
        });
    }
  };

  return (
    <div className="modal">
      {userProfile && (
        <div className="modal-content">
          <div className="modal-header">
            <h1>Weight</h1>
          </div>
          <div className="modal-flex">
            <div className="modal-body">
              {userProfile.measurement_type !== "metric" ? (
                <div>
                  <input
                    type="number"
                    step="0.1"
                    id="wide"
                    maxLength="5"
                    value={weightReg}
                    onChange={(e) => {
                      setWeightReg(safeParseFloat(e.target.value));
                    }}
                  />
                  <label>lbs</label>
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    step="0.1"
                    id="wide"
                    maxLength="5"
                    value={defaultConvertWeight(weightReg)}
                    onChange={(e) => {
                      setWeightReg(
                        convertWeight(safeParseFloat(e.target.value))
                      );
                    }}
                  />
                  <label>kgs</label>
                </div>
              )}
              <span className="modal-button-container">
                <button className="modal-button" onClick={setWeight}>
                  Confirm
                </button>
                <button className="modal-button" onClick={onClose}>
                  Cancel
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightFormModal;
