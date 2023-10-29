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
    setExercises,
    formattedDate,
    setTrackedExercises,
    convertWeight,
    defaultConvertWeight,
    safeParseFloat,
  } = props;
  const [nameReg, setNameReg] = useState("");
  const [repsHighReg, setRepsHighReg] = useState(0);
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
      repsHigh:
        repsHighReg === "" || repsHighReg <= repsLowReg ? null : repsHighReg,
      repsLow: repsLowReg === "" ? 1 : repsLowReg,
      sets: setsReg === "" ? 1 : setsReg,
      weight: weightReg === "" ? 0 : weightReg,
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
              user_id: loginStatus.id,
              routine_id: selectedRoutine.id,
              name: nameReg,
              reps_high:
                repsHighReg === "" || repsHighReg <= repsLowReg
                  ? null
                  : repsHighReg,
              reps_low: repsLowReg === "" ? 1 : repsLowReg,
              sets: setsReg === "" ? 1 : setsReg,
              weight: weightReg === "" ? 0 : weightReg,
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
            repsHigh:
              repsHighReg === "" || repsHighReg <= repsLowReg
                ? null
                : repsHighReg,
            repsLow: repsLowReg === "" ? 1 : repsLowReg,
            sets: setsReg === "" ? 1 : setsReg,
            weight: weightReg === "" ? 0 : weightReg,
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
                        sets: setsReg === "" ? 1 : setsReg,
                        reps_high:
                          repsHighReg === "" || repsHighReg <= repsLowReg
                            ? null
                            : repsHighReg,
                        reps_low: repsLowReg === "" ? 1 : repsLowReg,
                        weight: weightReg === "" ? 0 : weightReg,
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
                        sets: setsReg === "" ? 1 : setsReg,
                        reps_high:
                          repsHighReg === "" || repsHighReg <= repsLowReg
                            ? null
                            : repsHighReg,
                        reps_low: repsLowReg === "" ? 1 : repsLowReg,
                        weight: weightReg === "" ? 0 : weightReg,
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
        console.error("Error creating exercise:", error);
      });
  };

  const safeParseInt = (str) => {
    try {
      const parsedValue = parseInt(str);
      if (!isNaN(parsedValue) && parsedValue >= 1) {
        if (str.length >= 3) {
          return parseInt(str.slice(0, 2));
        }
        return parsedValue;
      } else {
        throw new Error("Value is not a valid number.");
      }
    } catch (error) {
      return "";
    }
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
                  maxLength="45"
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
                  placeholder="1"
                  min="1"
                  max="99"
                  maxLength="2"
                  value={!setsReg ? "" : setsReg}
                  onChange={(e) => {
                    setSetsReg(safeParseInt(e.target.value));
                  }}
                />
              </div>
              <div className="flex">
                <label className="flex-input">Rep-range: </label>
                <input
                  type="number"
                  id="narrow"
                  placeholder="1"
                  min="1"
                  max="99"
                  maxLength="2"
                  value={!repsLowReg ? "" : repsLowReg}
                  onChange={(e) => {
                    setRepsLowReg(safeParseInt(e.target.value));
                  }}
                />
                <p>-</p>
                <input
                  type="number"
                  id="narrow"
                  min="0"
                  max="99"
                  maxLength="2"
                  value={!repsHighReg ? "" : repsHighReg}
                  onChange={(e) => {
                    setRepsHighReg(safeParseInt(e.target.value));
                  }}
                />
              </div>
              {userProfile.measurement_type !== "metric" ? (
                <div>
                  <label>Weight: </label>
                  <input
                    type="number"
                    id="wide"
                    placeholder="0"
                    step="0.1"
                    min="0"
                    max="1500"
                    maxLength="4"
                    value={!weightReg ? "" : weightReg}
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
                    step="0.1"
                    placeholder="0"
                    min="0"
                    max="750"
                    maxLength="3"
                    value={!weightReg ? "" : defaultConvertWeight(weightReg)}
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
                  maxLength="300"
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
              <div className="flex-end">
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
