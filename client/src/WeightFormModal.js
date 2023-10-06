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
    }).catch((error) => {
      console.error("Error updating weight:", error);
    });

    if (previousWeight.date === formattedDate) {
      Axios.put(`http://localhost:3001/api/update/weight/${loginStatus.id}`, {
        userId: loginStatus.id,
        weight: weightReg,
        date: formattedDate,
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

  const convertWeight = (kgs) => {
    const lbs = kgs * 2.20462262185;
    return Number(lbs.toFixed(1));
  };

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(1));
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
                    value={weightReg}
                    onChange={(e) => {
                      setWeightReg(safeParseFloat(e.target.value));
                    }}
                  />
                  <label>lbs</label>
                  {/* {console.log(previousWeight)} */}
                </div>
              ) : (
                <div>
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
