import React, { useState } from "react";
import Axios from "axios";

const UpdateTrackedExerciseNameModal = (props) => {
  const { onClose, loginStatus, selectedExercise, apiURL } = props;
  const [nameReg, setNameReg] = useState(selectedExercise);

  const updateTrackedExerciseName = () => {
    Axios.put(`${apiURL}/api/update/tracked-exercise/${loginStatus.id}`, {
      name: selectedExercise,
      newName: nameReg,
    })
      .then(() => {
        // const updatedRoutines = routines.map((routine) => {
        //   if (routine.id === id) {
        //     return { ...routine, name: nameReg };
        //   }
        //   return routine;
        // });
        // setRoutines(updatedRoutines);
        onClose();
      })
      .catch((error) => {
        console.error("Error updating tracked exercise name:", error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="modal-body">
            <div className="flex">
              <label className="flex-input">Name: </label>
              <input
                type="text"
                id="wider"
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
                onClick={() => updateTrackedExerciseName()}
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

export default UpdateTrackedExerciseNameModal;
