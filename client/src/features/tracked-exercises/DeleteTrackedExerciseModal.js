import React, { useEffect } from "react";
import Axios from "axios";
import Modal from "../../components/Modal";

const DeleteTrackedExerciseModal = (props) => {
  const {
    onClose,
    formatDate,
    selectedExercise,
    setTrackedExercises,
    trackedExercises,
    apiURL,
  } = props;

  const deleteExercise = (id) => {
    Axios.delete(`${apiURL}/delete/tracked-exercise/${id}`)
      .then(() => {
        setTrackedExercises((prevTrackedExercises) => {
          const updatedTrackedExercises = [
            ...prevTrackedExercises[selectedExercise.exercise_name],
          ];

          const indexToDelete = updatedTrackedExercises.findIndex(
            (exercise) => exercise.id === id
          );

          if (indexToDelete !== -1) {
            updatedTrackedExercises.splice(indexToDelete, 1);
          }

          if (updatedTrackedExercises.length === 0) {
            const updatedTrackedExercisesObj = { ...prevTrackedExercises };
            delete updatedTrackedExercisesObj[selectedExercise.exercise_name];

            Axios.delete(
              `${apiURL}/delete/tracked-exercise-order/${
                trackedExercises.sortOrder.find(
                  (exercise) =>
                    exercise.exercise_name === selectedExercise.exercise_name
                ).id
              }`
            ).catch((error) => {
              console.error(error);
            });

            const updatedSortOrder = prevTrackedExercises.sortOrder.filter(
              (exercise) =>
                exercise.exercise_name !== selectedExercise.exercise_name
            );

            return {
              ...updatedTrackedExercisesObj,
              sortOrder: updatedSortOrder,
            };
          } else {
            return {
              ...prevTrackedExercises,
              [selectedExercise.exercise_name]: updatedTrackedExercises,
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
    <Modal
      isOpen={true}
      hasHeader={false}
      onClose={onClose}
      onConfirm={() => deleteExercise(selectedExercise.id)}
      isLarge={false}
    >
      <p>
        Are you sure you want to delete {selectedExercise.name} from{" "}
        {formatDate(selectedExercise.date)}?
      </p>
    </Modal>
  );
};

export default DeleteTrackedExerciseModal;
