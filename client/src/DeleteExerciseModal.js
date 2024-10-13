import React from "react";
import Axios from "axios";

const DeleteExerciseModal = (props) => {
  const {
    onClose,
    selectedExercise,
    selectedRoutine,
    setRoutineExercises,
    apiURL,
  } = props;

  const deleteExercise = (id) => {
    Axios.delete(`${apiURL}/delete/exercise/${id}`)
      .then(() => {
        setRoutineExercises((prevRoutineExercises) => {
          const updatedRoutineExercises = [
            ...prevRoutineExercises[selectedRoutine.id],
          ];

          const indexToDelete = updatedRoutineExercises.findIndex(
            (exercise) => exercise.id === id
          );
          if (indexToDelete !== -1) {
            updatedRoutineExercises.splice(indexToDelete, 1);
          }

          return {
            ...prevRoutineExercises,
            [selectedRoutine.id]: updatedRoutineExercises,
          };
        });
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
            <p>Are you sure you want to delete {selectedExercise.name}?</p>
            <span className="modal-button-container">
              <button
                className="modal-button"
                onClick={() => deleteExercise(selectedExercise.id)}
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

export default DeleteExerciseModal;
