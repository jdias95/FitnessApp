import React, { useEffect } from "react";
import Modal from "../../components/Modal";
import { useState } from "react";
import axios from "axios";
import TooltipInput from "../help/TooltipInput";

const makeId = () => `${Date.now()}-${Math.random()}`;

const WorkoutLogModal = (props) => {
  const {
    loginStatus,
    userProfile,
    onClose,
    setShowInfo,
    showInfo,
    convertWeight,
    defaultConvertWeight,
    setTrackedExercises,
    safeParseInt,
    safeParseFloat,
    selectedRoutineForLog,
    workoutLog,
    setWorkoutLog,
    apiURL,
  } = props;

  const [localLog, setLocalLog] = useState([]);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (workoutLog && workoutLog.length > 0) {
      // take parent log (ensure every item/set has id)
      setLocalLog(
        workoutLog.map((ex) => ({
          id: ex.id ?? makeId(),
          name: ex.name ?? "",
          tracked: ex.tracked || false,
          bw: ex.bw || false,
          sets: (ex.sets ?? []).map((s) => ({
            id: s.id ?? makeId(),
            reps: s.reps ?? 1,
            weight: s.weight ?? 0,
            notes: s.notes ?? "",
          })),
        }))
      );
      return;
    }

    if (selectedRoutineForLog && selectedRoutineForLog.length > 0) {
      setLocalLog(
        selectedRoutineForLog.map((ex) => ({
          id: makeId(),
          name: ex.name || "",
          tracked: ex.tracked || false,
          bw: ex.bw || false,
          sets: [],
        }))
      );
      return;
    }

    // default empty
    setLocalLog([]);
  }, [selectedRoutineForLog, workoutLog]);

  const addExercise = () => {
    setLocalLog((prev) => [
      ...prev,
      { id: makeId(), name: "", tracked: false, bw: false, sets: [] },
    ]);
  };

  const removeExercise = (exIndex) => {
    setLocalLog((prev) => prev.filter((_, i) => i !== exIndex));
  };

  const updateExercise = (exIndex, key, value) => {
    setLocalLog((prev) => {
      const copy = [...prev];
      copy[exIndex] = { ...copy[exIndex], [key]: value };
      return copy;
    });
  };

  const addSet = (exIndex) => {
    setLocalLog((prev) => {
      const copy = [...prev];
      copy[exIndex] = {
        ...copy[exIndex],
        sets: [
          ...(copy[exIndex].sets || []),
          { id: makeId(), reps: 1, weight: 0, notes: "" },
        ],
      };
      return copy;
    });
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    setLocalLog((prev) => {
      const copy = [...prev];
      const sets = [...(copy[exIndex].sets || [])];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      copy[exIndex] = { ...copy[exIndex], sets };
      return copy;
    });
  };

  const removeSet = (exIndex, setIndex) => {
    setLocalLog((prev) => {
      const copy = [...prev];
      copy[exIndex] = {
        ...copy[exIndex],
        sets: (copy[exIndex].sets || []).filter((_, i) => i !== setIndex),
      };
      return copy;
    });
  };

  async function handleSaveWorkoutLog(userId, localLog, setWorkoutLog) {
    try {
      // Filter out exercises without sets
      const filteredLog = localLog.filter(
        (exercise) => exercise.sets && exercise.sets.length > 0
      );
      const response = await axios.post(`${apiURL}/sync/workout-log`, {
        userId,
        localLog: filteredLog,
        timezone: userTimezone,
      });

      if (response.data.success) {
        // Refresh tracked exercises from server to ensure current list
        try {
          const trackedExercisesRes = await axios.get(
            `${apiURL}/get/tracked-exercises/${userId}`
          );
          setTrackedExercises((prev) => {
            return trackedExercisesRes.status === 200
              ? trackedExercisesRes.data || {}
              : prev;
          });
        } catch (err) {
          console.error("Error fetching tracked exercises:", err);
        }
        // Update local state with canonical ids returned from server
        setWorkoutLog(response.data.localLog);
        console.log("Workout log saved successfully!");
        onClose();
      }
    } catch (err) {
      console.error("Error saving workout log:", err);
    }
  }

  return (
    <Modal
      isOpen={true}
      hasHeader={true}
      header="Daily Workout Log"
      onClose={onClose}
      isLarge={true}
      onConfirm={() =>
        handleSaveWorkoutLog(loginStatus.id, localLog, setWorkoutLog)
      }
    >
      <div id="workout-log-modal" className="workout-log-modal-content">
        {localLog.map((exercise, exIndex) => (
          <div key={exercise.id}>
            {/* Editable exercise name */}
            <div className="flex space-between">
              <input
                type="text"
                placeholder="Exercise Name"
                name="exerciseName"
                value={exercise.name}
                onChange={(e) =>
                  updateExercise(exIndex, "name", e.target.value)
                }
                onFocus={(e) => e.target.select()}
              />

              <button
                type="button"
                onClick={() => removeExercise(exIndex)}
                className="log-remove-exercise-button"
              >
                ✕ Remove Exercise
              </button>
            </div>
            <div className="pl-1">
              <TooltipInput
                className="log-track"
                id={`log-track-${exIndex}`}
                label="Track Progress?:"
                tooltip="Selecting this will create a single entry under Exercise Progress with the calculated working weight, sets, and rep-range for the current date. The entries are sorted in lists by exercise name."
                showInfo={showInfo}
                setShowInfo={setShowInfo}
              >
                <input
                  type="checkbox"
                  id="checkbox"
                  checked={exercise.tracked}
                  onChange={(e) =>
                    updateExercise(exIndex, "tracked", e.target.checked)
                  }
                />
              </TooltipInput>
              <TooltipInput
                className="log-bw"
                id={`log-bw-${exIndex}`}
                label="Bodyweight Comparison?:"
                tooltip="Selecting this will add the proportion of weight lifted to your bodyweight when creating an entry under Track Progress. This is especially useful for the more essential compound lifts (eg. Bench Press, Squat, etc.)."
                showInfo={showInfo}
                setShowInfo={setShowInfo}
              >
                <input
                  type="checkbox"
                  id="checkbox"
                  checked={exercise.bw}
                  disabled={!exercise.tracked}
                  onChange={(e) =>
                    updateExercise(exIndex, "bw", e.target.checked)
                  }
                />
              </TooltipInput>
            </div>
            {/* Render sets for this exercise */}
            <div>
              {(exercise.sets ?? []).map((set, setIndex) => (
                <div key={setIndex} className="flex">
                  <input
                    type="number"
                    placeholder="Reps"
                    name="reps"
                    id="narrow"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        exIndex,
                        setIndex,
                        "reps",
                        safeParseInt(e.target.value)
                      )
                    }
                    onFocus={(e) => e.target.select()}
                  />
                  <p>&nbsp;&nbsp;reps&nbsp;&nbsp;</p>
                  {userProfile?.measurement_type !== "metric" ? (
                    <>
                      <input
                        type="number"
                        placeholder="Weight"
                        name="weight"
                        id="wide"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(
                            exIndex,
                            setIndex,
                            "weight",
                            safeParseFloat(e.target.value)
                          )
                        }
                        onFocus={(e) => e.target.select()}
                      />
                      <p>&nbsp;&nbsp;lbs&nbsp;&nbsp;</p>
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        placeholder="Weight"
                        name="weight"
                        id="wide"
                        value={defaultConvertWeight(set.weight)}
                        onChange={(e) =>
                          updateSet(
                            exIndex,
                            setIndex,
                            "weight",
                            convertWeight(safeParseFloat(e.target.value))
                          )
                        }
                        onFocus={(e) => e.target.select()}
                      />
                      <p>&nbsp;&nbsp;kg&nbsp;&nbsp;</p>
                    </>
                  )}
                  <textarea
                    placeholder="Notes"
                    id="wider"
                    name="notes"
                    value={set.notes}
                    onChange={(e) =>
                      updateSet(exIndex, setIndex, "notes", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                  />
                  <p>&nbsp;&nbsp;</p>
                  <button
                    type="button"
                    onClick={() => removeSet(exIndex, setIndex)}
                    className="log-remove-set-button"
                  >
                    - Remove Set
                  </button>
                </div>
              ))}
            </div>

            {/* Button to add a new set */}
            <button
              type="button"
              onClick={() => addSet(exIndex)}
              className="log-add-set-button"
            >
              + Add Set
            </button>
          </div>
        ))}

        {/* Add Exercise at bottom */}
        <button
          type="button"
          onClick={addExercise}
          className="log-add-exercise-button"
        >
          + Add Exercise
        </button>
      </div>
    </Modal>
  );
};

export default WorkoutLogModal;
