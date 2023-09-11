import React, { useState } from "react";
import Axios from "axios";

const UpdateExerciseModal = (props) => {
  const {
    userProfile,
    onClose,
    selectedRoutine,
    selectedExercise,
    setRoutineExercises,
    formattedDate,
  } = props;
  const [nameReg, setNameReg] = useState(selectedExercise.name);
  const [repsLowReg, setRepsLowReg] = useState(selectedExercise.reps_low);
  const [repsHighReg, setRepsHighReg] = useState(selectedExercise.reps_high);
  const [setsReg, setSetsReg] = useState(selectedExercise.sets);
  const [weightReg, setWeightReg] = useState(selectedExercise.weight);
  const [trackReg, setTrackReg] = useState(selectedExercise.tracked);
  const [bwReg, setBwReg] = useState(selectedExercise.bw);

  const updateExercise = (id) => {
    Axios.put(`http://localhost:3001/api/update/exercise/${id}`, {
      name: nameReg,
      repsLow: repsLowReg,
      repsHigh: repsHighReg,
      sets: setsReg,
      weight: weightReg,
      tracked: trackReg,
      bw: bwReg,
    })
      .then((response) => {
        setRoutineExercises((prevRoutineExercises) => {
          const updatedRoutineExercises = [
            ...prevRoutineExercises[selectedRoutine.id],
          ];

          const indexToUpdate = updatedRoutineExercises.findIndex(
            (exercise) => exercise.id === id
          );

          if (indexToUpdate !== -1) {
            updatedRoutineExercises[indexToUpdate] = {
              id: id,
              name: nameReg,
              reps_low: repsLowReg,
              reps_high: repsHighReg,
              sets: setsReg,
              weight: weightReg,
              tracked: trackReg,
              bw: bwReg,
            };
          }

          return {
            ...prevRoutineExercises,
            [selectedRoutine.id]: updatedRoutineExercises,
          };
        });

        onClose();
      })
      .catch((error) => {
        console.error("Error updating routine:", error);
      });
  };

  const safeParseInt2 = (str) => {
    try {
      const parsedValue = parseInt(str);
      if (!isNaN(parsedValue) && parsedValue >= 1) {
        return parsedValue;
      } else {
        throw new Error("Value is not a valid number.");
      }
    } catch (error) {
      return 1;
    }
  };

  const safeParseInt3 = (str) => {
    try {
      if (str === null) {
        return null;
      }

      const parsedValue = parseInt(str);
      if (!isNaN(parsedValue) && parsedValue >= 1) {
        return parsedValue;
      } else {
        throw new Error("Value is not a valid number.");
      }
    } catch (error) {
      return null;
    }
  };

  const safeParseFloat = (str) => {
    try {
      const parsedValue = parseFloat(str);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        return parsedValue;
      } else {
        throw new Error("Value is not a valid number.");
      }
    } catch (error) {
      return 0;
    }
  };

  const convertWeight = (kgs) => {
    const lbs = kgs * 2.20462262185;
    return Number(lbs.toFixed(1));
  };

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(1));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1>Add Exercise</h1>
        </div>
        {userProfile && (
          <div className="modal-flex">
            <div className="exercise-modal-body">
              <div>
                <label>Name: </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Ex: Bench Press"
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
                    setSetsReg(safeParseInt2(e.target.value));
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
                    setRepsLowReg(safeParseInt2(e.target.value));
                  }}
                />
                <p>-</p>
                <input
                  type="number"
                  id="narrow"
                  value={repsHighReg === null ? "" : repsHighReg}
                  onChange={(e) => {
                    setRepsHighReg(safeParseInt3(e.target.value));
                  }}
                />
              </div>
              {userProfile.measurement_type !== "metric" ? (
                <div>
                  <label>Weight: </label>
                  <input
                    type="number"
                    id="wide"
                    value={weightReg}
                    onChange={(e) => {
                      setWeightReg(safeParseFloat(e.target.value));
                    }}
                  />
                  <label>lbs</label>
                </div>
              ) : (
                <div>
                  <label>Weight: </label>
                  <input
                    type="number"
                    id="wide"
                    value={defaultConvertWeight(weightReg)}
                    onChange={(e) => {
                      setWeightReg(
                        convertWeight(safeParseFloat(e.target.value))
                      );
                    }}
                  />
                  <label>kgs</label>
                </div>
              )}
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
                  disabled={!trackReg}
                  onChange={() => {
                    setBwReg(!bwReg);
                  }}
                />
              </div>
              <div>
                <span className="modal-button-container">
                  <button
                    className="modal-button"
                    onClick={() => {
                      updateExercise(selectedExercise.id);
                    }}
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
        )}
      </div>
    </div>
  );
};

export default UpdateExerciseModal;
