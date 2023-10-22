import React, { useState } from "react";
import Axios from "axios";

const RoutineFormModal = (props) => {
  const { loginStatus, onClose, routines, setRoutines } = props;
  const [nameReg, setNameReg] = useState("");

  const createRoutine = () => {
    Axios.post("http://localhost:3001/api/insert/routine", {
      userId: loginStatus.id,
      name: nameReg,
    })
      .then((response) => {
        setRoutines([
          ...routines,
          {
            id: response.data.insertId,
            user_id: loginStatus.id,
            name: nameReg,
          },
        ]);
        onClose();
      })
      .catch((error) => {
        console.error("Error creating routine:", error);
      });
  };

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
              maxLength="45"
              value={nameReg}
              onChange={(e) => {
                setNameReg(e.target.value);
              }}
            />
            <span className="modal-button-container">
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

export default RoutineFormModal;
