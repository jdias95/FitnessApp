import React, { useState } from "react";
import Axios from "axios";

const UpdateRoutineModal = (props) => {
  const { onClose, setRoutines, routines, selectedRoutine, apiURL } = props;
  const [nameReg, setNameReg] = useState(selectedRoutine.name);

  const updateRoutine = (id) => {
    Axios.put(`${apiURL}/update/routine/${id}`, {
      name: nameReg,
    })
      .then(() => {
        const updatedRoutines = routines.map((routine) => {
          if (routine.id === id) {
            return { ...routine, name: nameReg };
          }
          return routine;
        });
        setRoutines(updatedRoutines);
        onClose();
      })
      .catch((error) => {
        console.error("Error updating routine:", error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="modal-body">
            <div className="flex">
              <label className="flex-input">Name:&nbsp;</label>
              <input
                type="text"
                id="wider"
                placeholder="Ex: Push, Lower Body, etc."
                maxLength="45"
                value={nameReg}
                onChange={(e) => {
                  setNameReg(e.target.value);
                }}
              />
            </div>
            <span className="modal-button-container">
              <button
                className="modal-button"
                onClick={() => updateRoutine(selectedRoutine.id)}
              >
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

export default UpdateRoutineModal;
