import React, { useState } from "react";
import Axios from "axios";

const UpdateRoutineModal = (props) => {
  const { onClose, setRoutines, routines, selectedRoutine } = props;
  const [nameReg, setNameReg] = useState(selectedRoutine.name);

  const updateRoutine = (id) => {
    Axios.put(`http://localhost:3001/api/update/routine/${id}`, {
      name: nameReg,
    })
      .then((response) => {
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
