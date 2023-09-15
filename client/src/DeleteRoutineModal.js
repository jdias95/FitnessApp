import React from "react";
import Axios from "axios";

const DeleteRoutineModal = (props) => {
  const { onClose, setRoutines, routines, selectedRoutine } = props;

  const deleteRoutine = (id) => {
    Axios.delete(`http://localhost:3001/api/delete/routine/${id}`)
      .then((response) => {
        const updatedRoutines = routines.filter((routine) => routine.id !== id);
        setRoutines(updatedRoutines);
        onClose();
      })
      .catch((error) => {
        console.error("Error deleting routine:", error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="modal-body">
            <p>Are you sure you want to delete {selectedRoutine.name}?</p>
            <span className="modal-button-container">
              <button
                className="modal-button"
                onClick={() => deleteRoutine(selectedRoutine.id)}
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

export default DeleteRoutineModal;
