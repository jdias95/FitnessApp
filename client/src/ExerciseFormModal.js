import React, { useState } from "react";
import Axios from "axios";

const ExerciseFormModal = (props) => {
  const { loginStatus, onClose, selectedRoutine } = props;
  const [nameReg, setNameReg] = useState("");
  const [repsHighReg, setRepsHighReg] = useState(0);
  const [repsLowReg, setRepsLowReg] = useState(0);
  const [setsReg, setSetsReg] = useState(0);
  const [weightReg, setWeightReg] = useState(0);
  const [trackReg, setTrackReg] = useState(false);
  const [bwReg, setBwReg] = useState(false);

  const createExercise = () => {
    Axios.post("http://localhost:3001/api/insert/exercise", {
      userId: loginStatus.id,
      routineId: selectedRoutine.id,
      name: nameReg,
      repsHigh: repsHighReg,
      repsLow: repsLowReg,
      sets: setsReg,
      weight: weightReg,
      tracked: trackReg,
      bw: bwReg,
    })
      .then((response) => {
        onClose();
      })
      .catch((error) => {
        console.error("Error creating routine:", error);
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1>Add Exercise</h1>
        </div>
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div>
              <label>Name: </label>
              <input
                type="text"
                id="name"
                value={nameReg}
                onChange={(e) => {
                  setNameReg(e.target.value);
                }}
              />
            </div>
            <div>
              <label>Sets: </label>
              <input
                type="number"
                id="narrow"
                value={setsReg}
                onChange={(e) => {
                  setSetsReg(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="flex">
              <label>Rep-range: </label>
              <input
                type="number"
                id="narrow"
                value={repsLowReg}
                onChange={(e) => {
                  setRepsLowReg(parseInt(e.target.value));
                }}
              />
              <p>-</p>
              <input
                type="number"
                id="narrow"
                value={repsHighReg}
                onChange={(e) => {
                  setRepsHighReg(parseInt(e.target.value));
                }}
              />
            </div>
            <div>
              <label>Weight: </label>
              <input
                type="number"
                id="wide"
                value={weightReg}
                onChange={(e) => {
                  setWeightReg(parseInt(e.target.value));
                }}
              />
              <label>lbs</label>
            </div>
            <div>
              <label>Track Progress?: </label>
              <input
                type="checkbox"
                id="checkbox"
                checked={trackReg}
                onChange={() => {
                  setTrackReg(!trackReg);
                }}
              />
            </div>
            <div>
              <label>Bodyweight Comparison?: </label>
              <input
                type="checkbox"
                id="checkbox"
                checked={bwReg}
                onChange={() => {
                  setBwReg(!bwReg);
                }}
              />
            </div>
            <div>
              <span className="modal-button-container">
                <button className="modal-button" onClick={createExercise}>
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
    </div>
  );
};

export default ExerciseFormModal;
