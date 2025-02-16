import React, { useState } from "react";
import Axios from "axios";
import Modal from "../../components/Modal";

const UpdateRoutineModal = (props) => {
  const { onClose, setRoutines, routines, selectedRoutine, apiURL } = props;
  const [nameReg, setNameReg] = useState(selectedRoutine.name);

  const updateRoutine = (id) => {
    Axios.put(`${apiURL}/update/routine/${id}`, {
      name: nameReg,
    })
      .then(() => {
        const updatedRoutines = routines.map((routine) => {
          if (routine.id === id) {
            return { ...routine, name: nameReg };
          }
          return routine;
        });
        setRoutines(updatedRoutines);
        onClose();
      })
      .catch((error) => {
        console.error("Error updating routine:", error);
      });
  };

  return (
    <Modal
      isOpen={true}
      hasHeader={false}
      onClose={onClose}
      onConfirm={() => updateRoutine(selectedRoutine.id)}
      isLarge={false}
    >
      <div className="flex">
        <label className="flex-input">Name:&nbsp;</label>
        <input
          type="text"
          id="wider"
          placeholder="Ex: Push, Lower Body, etc."
          maxLength="45"
          value={nameReg}
          onChange={(e) => {
            setNameReg(e.target.value);
          }}
        />
      </div>
    </Modal>
  );
};

export default UpdateRoutineModal;
