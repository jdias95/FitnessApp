import React from "react";
import Axios from "axios";

const DeleteTrackedExerciseModal = (props) => {
  const { onClose, selectedExercise, setTrackedExercises } = props;

  const deleteExercise = (id) => {
    Axios.delete(`http://localhost:3001/api/delete/tracked-exercise/${id}`)
      .then((response) => {
        console.log(selectedExercise);
        setTrackedExercises((prevTrackedExercises) => {
          const updatedTrackedExercises = [
            ...prevTrackedExercises[selectedExercise.name],
          ];

          const indexToDelete = updatedTrackedExercises.findIndex(
            (exercise) => exercise.id === id
          );
          if (indexToDelete !== -1) {
            updatedTrackedExercises.splice(indexToDelete, 1);
          }

          if (updatedTrackedExercises.length === 0) {
            const updatedTrackedExercisesObj = { ...prevTrackedExercises };
            delete updatedTrackedExercisesObj[selectedExercise.name];
            return updatedTrackedExercisesObj;
          } else {
            return {
              ...prevTrackedExercises,
              [selectedExercise.name]: updatedTrackedExercises,
            };
          }
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
            <p>
              Are you sure you want to delete {selectedExercise.name}:{" "}
              {`${new Date(selectedExercise.date).toLocaleDateString()}`}?
            </p>
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

export default DeleteTrackedExerciseModal;
