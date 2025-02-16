import React from "react";
import Axios from "axios";
import Modal from "../../components/Modal";

const DeleteTrackedExerciseModal = (props) => {
  const {
    onClose,
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

            Axios.delete(
              `${apiURL}/delete/tracked-exercise-order/${
                trackedExercises.sortOrder.find(
                  (exercise) => exercise.name === selectedExercise.name
                ).id
              }`
            ).catch((error) => {
              console.error(error);
            });

            const updatedSortOrder = prevTrackedExercises.sortOrder.filter(
              (exercise) => exercise.name !== selectedExercise.name
            );

            return {
              ...updatedTrackedExercisesObj,
              sortOrder: updatedSortOrder,
            };
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
    <Modal
      isOpen={true}
      hasHeader={false}
      onClose={onClose}
      onConfirm={() => deleteExercise(selectedExercise.id)}
      isLarge={false}
    >
      <p>
        Are you sure you want to delete {selectedExercise.name}:{" "}
        {`${new Date(selectedExercise.date).toLocaleDateString()}`}?
      </p>
    </Modal>
  );
};

export default DeleteTrackedExerciseModal;
