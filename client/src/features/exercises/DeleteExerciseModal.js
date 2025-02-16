import React from "react";
import Axios from "axios";
import Modal from "../../components/Modal";

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
    <Modal
      isOpen={true}
      hasHeader={false}
      onClose={onClose}
      onConfirm={() => deleteExercise(selectedExercise.id)}
      isLarge={false}
    >
      <p>Are you sure you want to delete {selectedExercise.name}?</p>
    </Modal>
  );
};

export default DeleteExerciseModal;
