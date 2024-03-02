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

  const updateTrackedExerciseName = () => {
    const updatedTrackedExercises = { ...trackedExercises };
    const updatedSortOrder = [...trackedExercises.sortOrder];
    const sortOrderCheck =
      trackedExercises.sortOrder.find(
        (exercise) => exercise.name === nameReg
      ) ?? "";

    const selectedExerciseValue = updatedTrackedExercises[selectedExercise].map(
      (exercise) => {
        return { ...exercise, name: nameReg };
      }
    );

    delete updatedTrackedExercises[selectedExercise];

    updatedTrackedExercises[nameReg] = selectedExerciseValue;

    const exerciseIndex = updatedSortOrder.findIndex(
      (exercise) => exercise.name === selectedExercise
    );

    if (exerciseIndex !== -1) {
      updatedSortOrder[exerciseIndex].name = nameReg;
    }

    updatedTrackedExercises.sortOrder = updatedSortOrder;

    setTrackedExercises(updatedTrackedExercises);

    if (sortOrderCheck) {
      const newUpdatedSortOrder = updatedSortOrder.filter(
        (exercise) => exercise !== sortOrderCheck
      );

      updatedTrackedExercises.sortOrder = newUpdatedSortOrder;

      setTrackedExercises(updatedTrackedExercises);

      Axios.delete(
        `${apiURL}/api/delete/tracked-exercise-order/${sortOrderCheck.id}`
      ).catch((error) => {
        console.error(error);
      });
    }

    Axios.put(`${apiURL}/api/update/tracked-exercise/${loginStatus.id}`, {
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
            {console.log(
              trackedExercises.sortOrder.find(
                (exercise) => exercise.name === nameReg
              )
                ? true
                : false
            )}
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
