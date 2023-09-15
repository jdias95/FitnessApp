import React, { useState } from "react";
import Axios from "axios";

const ExerciseFormModal = (props) => {
  const {
    loginStatus,
    userProfile,
    onClose,
    selectedRoutine,
    routineExercises,
    setRoutineExercises,
    formattedDate,
    setTrackedExercises,
  } = props;
  const [nameReg, setNameReg] = useState("");
  const [repsHighReg, setRepsHighReg] = useState();
  const [repsLowReg, setRepsLowReg] = useState(1);
  const [setsReg, setSetsReg] = useState(1);
  const [weightReg, setWeightReg] = useState(0);
  const [trackReg, setTrackReg] = useState(false);
  const [bwReg, setBwReg] = useState(false);
  const [notesReg, setNotesReg] = useState("");

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
      notes: notesReg,
    })
      .then((response) => {
        const existingExercisesForRoutine =
          routineExercises[selectedRoutine.id] || [];

        setRoutineExercises((prevRoutineExercises) => ({
          ...prevRoutineExercises,
          [selectedRoutine.id]: [
            ...existingExercisesForRoutine,
            {
              id: response.data.insertId,
              name: nameReg,
              reps_high: repsHighReg,
              reps_low: repsLowReg,
              sets: setsReg,
              weight: weightReg,
              tracked: trackReg,
              bw: bwReg,
              notes: notesReg,
            },
          ],
        }));

        if (trackReg) {
          Axios.post("http://localhost:3001/api/insert/tracked-exercise", {
            userId: loginStatus.id,
            exerciseId: response.data.insertId,
            name: nameReg,
            repsHigh: repsHighReg,
            repsLow: repsLowReg,
            sets: setsReg,
            weight: weightReg,
            bw: bwReg,
            date: formattedDate,
          })
            .then((response2) => {
              setTrackedExercises((prevTrackedExercises) => {
                if (prevTrackedExercises.hasOwnProperty(nameReg)) {
                  return {
                    ...prevTrackedExercises,
                    [nameReg]: [
                      ...prevTrackedExercises[nameReg],
                      {
                        id: response2.data.insertId,
                        exercise_id: response.data.insertId,
                        name: nameReg,
                        sets: setsReg,
                        reps_high: repsHighReg,
                        reps_low: repsLowReg,
                        weight: weightReg,
                        bw: bwReg,
                        date: formattedDate,
                      },
                    ],
                  };
                } else {
                  return {
                    ...prevTrackedExercises,
                    [nameReg]: [
                      {
                        id: response2.data.insertId,
                        exercise_id: response.data.insertId,
                        name: nameReg,
                        sets: setsReg,
                        reps_high: repsHighReg,
                        reps_low: repsLowReg,
                        weight: weightReg,
                        bw: bwReg,
                        date: formattedDate,
                      },
                    ],
                  };
                }
              });
            })
            .catch((error) => {
              console.error("Error tracking exercise:", error);
            });
        }

        onClose();
      })
      .catch((error) => {
        console.error("Error creating routine:", error);
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
                <label className="flex-input">Rep-range: </label>
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
              <div className="flex">
                <label id="notes" className="flex-input">
                  Notes:
                </label>
                <textarea
                  rows="4"
                  cols="30"
                  value={notesReg}
                  onChange={(e) => {
                    setNotesReg(e.target.value);
                  }}
                />
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
                  disabled={!trackReg}
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
        )}
      </div>
    </div>
  );
};

export default ExerciseFormModal;
