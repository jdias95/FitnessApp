import React from "react";
import Axios from "axios";
import Modal from "../../components/Modal";

const DeleteRoutineModal = (props) => {
  const { onClose, setRoutines, routines, selectedRoutine, apiURL } = props;

  const deleteRoutine = (id) => {
    Axios.delete(`${apiURL}/delete/routine/${id}`)
      .then(() => {
        const updatedRoutines = routines.filter((routine) => routine.id !== id);
        setRoutines(updatedRoutines);
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
      onConfirm={() => deleteRoutine(selectedRoutine.id)}
      isLarge={false}
    >
      <p>Are you sure you want to delete {selectedRoutine.name}?</p>
    </Modal>
  );
};

export default DeleteRoutineModal;
