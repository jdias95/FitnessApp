import React, { useState, useEffect } from "react";
import Axios from "axios";

const RoutineForm = ({ loginStatus, onClose }) => {
  const [nameReg, setNameReg] = useState("");

  const createRoutine = () => {
    console.log(loginStatus);
    Axios.post("http://localhost:3001/api/insert/routine", {
      userId: loginStatus.id,
      name: nameReg,
    })
      .then((response) => {
        onClose();
      })
      .catch((error) => {
        console.error("Error creating routine:", error);
      });
  };

  useEffect(() => {
    console.log(nameReg);
  });

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1>Create Routine</h1>
        </div>
        <div className="modal-flex">
          <div className="modal-body">
            <input
              type="text"
              id="input"
              placeholder="Name"
              value={nameReg}
              onChange={(e) => {
                setNameReg(e.target.value);
              }}
            />
            <span>
              <button className="modal-button" onClick={createRoutine}>
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

export default RoutineForm;
