import React from "react";
import Axios from "axios";

const DeleteTrackedExerciseModal = (props) => {
  const { onClose, selectedExercise, setTrackedExercises, monthNames } = props;

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

          return {
            ...prevTrackedExercises,
            [selectedExercise.name]: updatedTrackedExercises,
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
            <p>
              Are you sure you want to delete {selectedExercise.name}:{" "}
              {`${
                monthNames[parseInt(selectedExercise.date.slice(5, 7) - 1)]
              } ${selectedExercise.date.slice(
                8,
                10
              )} ${selectedExercise.date.slice(0, 4)}`}
              ?
            </p>
            <span>
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
