import React, { useState } from "react";
import Axios from "axios";
import Modal from "../../components/Modal";

const RoutineFormModal = (props) => {
  const { loginStatus, onClose, routines, setRoutines, apiURL } = props;
  const [nameReg, setNameReg] = useState("");

  const createRoutine = () => {
    Axios.post(`${apiURL}/insert/routine`, {
      userId: loginStatus.id,
      name: nameReg,
    })
      .then((response) => {
        setRoutines([
          ...routines,
          {
            id: response.data.insertId,
            user_id: loginStatus.id,
            name: nameReg,
          },
        ]);
        onClose();
      })
      .catch((error) => {
        console.error("Error creating routine:", error);
      });
  };

  return (
    <Modal
      isOpen={true}
      hasHeader={true}
      header="Create Routine"
      onConfirm={createRoutine}
      onClose={onClose}
      isLarge={false}
    >
      <div className="flex">
        <label className="flex-input">Name:&nbsp;</label>
        <input
          type="text"
          id="wider"
          placeholder="Ex: Push, Lower Body, etc."
          maxLength="45"
          onFocus={(e) => e.target.select()}
          value={nameReg}
          onChange={(e) => {
            setNameReg(e.target.value);
          }}
        />
      </div>
    </Modal>
  );
};

export default RoutineFormModal;
