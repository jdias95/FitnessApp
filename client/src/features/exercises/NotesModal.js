import React from "react";
import Modal from "../../components/Modal";

const NotesModal = (props) => {
  const { onClose, selectedExercise } = props;

  return (
    <Modal
      isOpen={true}
      hasHeader={false}
      hasConfirm={false}
      onClose={onClose}
      isLarge={true}
    >
      <div>
        <p>{selectedExercise.notes}</p>
      </div>
    </Modal>
  );
};

export default NotesModal;
