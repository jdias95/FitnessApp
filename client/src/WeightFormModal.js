import React, { useState, useEffect } from "react";
import Axios from "axios";

const WeightFormModal = ({
  setUserProfile,
  userProfile,
  loginStatus,
  onClose,
}) => {
  const [weightReg, setWeightReg] = useState(
    userProfile && userProfile.weight ? userProfile.weight : 0
  );
  const [dateReg, setDateReg] = useState(new Date());
  const formattedDate = dateReg.toISOString().split("T")[0];
  const monthNames = [
    "Jan",
    "Feb",
    "March",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const setWeight = () => {
    Axios.put(`http://localhost:3001/api/update/profile/${loginStatus.id}`, {
      userId: loginStatus.id,
      weight: weightReg,
      height: userProfile.height,
      age: userProfile.age,
      activityLevel: userProfile.activity_level,
      gender: userProfile.gender,
      measurementType: userProfile.measurement_type,
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error updating weight:", error);
      });
    Axios.post("http://localhost:3001/api/insert/weight", {
      userId: loginStatus.id,
      weight: weightReg,
      date: formattedDate,
    })
      .then((response) => {
        onClose();
      })
      .catch((error) => {
        console.error("Error setting:", error);
      });
  };

  const safeParseFloat = (str) => {
    try {
      const parsedValue = parseFloat(str);
      if (!isNaN(parsedValue)) {
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
      <div className="modal-content">
        <div className="modal-header">
          <h1>Weight</h1>
        </div>
        <div className="modal-flex">
          <div className="modal-body">
            <span>
              <input
                type="number"
                step="0.1"
                id="input"
                value={weightReg}
                onChange={(e) => {
                  setWeightReg(safeParseFloat(e.target.value));
                }}
              />
              <label>lbs</label>
            </span>
            <span>
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
    </div>
  );
};

export default WeightFormModal;
