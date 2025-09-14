import React, { useEffect } from "react";
import Modal from "../../components/Modal";

const RoutineSelectionModal = (props) => {
  const {
    onClose,
    routines,
    getExercisesForRoutine,
    setSelectedRoutineForLog,
    toggleModal,
  } = props;

  useEffect(() => {
    setSelectedRoutineForLog(null);
  }, []);

  return (
    <Modal
      isOpen={true}
      hasHeader={true}
      header="Select a Routine or Start from Scratch"
      onClose={onClose}
      isLarge={true}
      hasConfirm={false}
    >
      <ul className="routine-list">
        {routines.map((routine) => (
          <button
            key={routine.id}
            onClick={() => {
              setSelectedRoutineForLog(getExercisesForRoutine(routine.id));
              toggleModal("workoutLog", true);
              onClose();
            }}
            className="routine-button"
          >
            {routine.name}
          </button>
        ))}
        <button
          className="routine-button"
          onClick={() => {
            setSelectedRoutineForLog(null);
            toggleModal("workoutLog", true);
            onClose();
          }}
        >
          Start from Scratch
        </button>
      </ul>
    </Modal>
  );
};

export default RoutineSelectionModal;
