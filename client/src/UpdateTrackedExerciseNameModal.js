import React, { useState } from "react";
import Axios from "axios";

const UpdateTrackedExerciseNameModal = (props) => {
  const {
    onClose,
    loginStatus,
    selectedExercise,
    trackedExercises,
    setTrackedExercises,
    apiURL,
  } = props;
  const [nameReg, setNameReg] = useState(selectedExercise);
  const sortOrderCheck =
    trackedExercises.sortOrder.find((exercise) => exercise.name === nameReg) ??
    "";

  const updateTrackedExerciseName = () => {
    const updatedTrackedExercises = { ...trackedExercises };
    const updatedSortOrder = [...trackedExercises.sortOrder];

    const selectedExerciseValue = updatedTrackedExercises[selectedExercise].map(
      (exercise) => {
        return { ...exercise, name: nameReg };
      }
    );

    updatedTrackedExercises[nameReg] = selectedExerciseValue;

    const exerciseIndex = updatedSortOrder.findIndex(
      (exercise) => exercise.name === selectedExercise
    );

    if (exerciseIndex !== -1) {
      updatedSortOrder[exerciseIndex].name = nameReg;
    }

    updatedTrackedExercises.sortOrder = updatedSortOrder;

    if (sortOrderCheck) {
      const newUpdatedSortOrder = updatedSortOrder.filter(
        (exercise) => exercise !== sortOrderCheck
      );

      updatedTrackedExercises.sortOrder = newUpdatedSortOrder;

      updatedTrackedExercises[nameReg] = trackedExercises[nameReg]
        .concat(updatedTrackedExercises[nameReg])
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setTrackedExercises(updatedTrackedExercises);

      Axios.delete(
        `${apiURL}/delete/tracked-exercise-order/${sortOrderCheck.id}`
      ).catch((error) => {
        console.error(error);
      });
    }

    delete updatedTrackedExercises[selectedExercise];

    setTrackedExercises(updatedTrackedExercises);

    Axios.put(`${apiURL}/update/tracked-exercise/${loginStatus.id}`, {
      name: selectedExercise,
      newName: nameReg,
    })
      .then(() => {
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
              <label className="flex-input">Name:&nbsp;</label>
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
                onClick={() =>
                  selectedExercise !== nameReg
                    ? updateTrackedExerciseName()
                    : onClose()
                }
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
