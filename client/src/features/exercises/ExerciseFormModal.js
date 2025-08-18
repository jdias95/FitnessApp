import React, { useState } from "react";
import TooltipInput from "./TooltipInput";
import Axios from "axios";
import Modal from "../../components/Modal";

const ExerciseFormModal = (props) => {
  const {
    loginStatus,
    userProfile,
    onClose,
    selectedRoutine,
    routineExercises,
    setRoutineExercises,
    formattedDate,
    setShowInfo,
    showInfo,
    setTrackedExercises,
    trackedExercises,
    convertWeight,
    defaultConvertWeight,
    safeParseFloat,
    apiURL,
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
    Axios.post(`${apiURL}/insert/exercise`, {
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
        const newExerciseId = response.data.insertId;

        Axios.put(`${apiURL}/update/exercise/${newExerciseId}`, {
          name: nameReg,
          repsLow: repsLowReg === "" ? 1 : repsLowReg,
          repsHigh:
            repsHighReg === "" || repsHighReg <= repsLowReg
              ? null
              : repsHighReg,
          sets: setsReg === "" ? 1 : setsReg,
          weight: weightReg === "" ? 0 : weightReg,
          tracked: trackReg,
          bw: bwReg,
          notes: notesReg,
          sortOrder: newExerciseId,
        });

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
              sort_order: newExerciseId,
            },
          ],
        }));

        if (trackReg) {
          Axios.post(`${apiURL}/insert/tracked-exercise`, {
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

              if (!trackedExercises.sortOrder) {
                Axios.post(
                  `${apiURL}/insert/tracked-exercise-order/${loginStatus.id}`,
                  {
                    name: nameReg,
                  }
                )
                  .then((response3) => {
                    Axios.put(
                      `${apiURL}/update/tracked-exercise-order/${response3.data.insertId}`,
                      {
                        name: nameReg,
                        sortOrder: response3.data.insertId,
                      }
                    ).catch((error) => {
                      console.error(error);
                    });

                    setTrackedExercises((prevTrackedExercises) => ({
                      ...prevTrackedExercises,
                      sortOrder: [
                        {
                          id: response3.data.insertId,
                          user_id: loginStatus.id,
                          name: nameReg,
                          sort_order: response3.data.insertId,
                        },
                      ],
                    }));
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              } else if (
                !trackedExercises.sortOrder.some(
                  (exercise) => exercise.name === nameReg
                )
              ) {
                Axios.post(
                  `${apiURL}/insert/tracked-exercise-order/${loginStatus.id}`,
                  {
                    name: nameReg,
                  }
                )
                  .then((response3) => {
                    Axios.put(
                      `${apiURL}/update/tracked-exercise-order/${response3.data.insertId}`,
                      {
                        name: nameReg,
                        sortOrder: response3.data.insertId,
                      }
                    ).catch((error) => {
                      console.error(error);
                    });

                    const existingTrackedExercises =
                      trackedExercises["sortOrder"] || [];

                    setTrackedExercises((prevTrackedExercises) => ({
                      ...prevTrackedExercises,
                      sortOrder: [
                        ...existingTrackedExercises,
                        {
                          id: response3.data.insertId,
                          user_id: loginStatus.id,
                          name: nameReg,
                          sort_order: response3.data.insertId,
                        },
                      ],
                    }));
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }
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
    <Modal
      isOpen={true}
      hasHeader={true}
      header="Add Exercise"
      onClose={onClose}
      onConfirm={createExercise}
      isLarge={true}
    >
      {userProfile && (
        <div>
          <div>
            <label>Name:&nbsp;</label>
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
          <TooltipInput
            id="sets"
            label="Sets"
            tooltip="A set refers to a group of repetitions (or reps) of an exercise."
            showInfo={showInfo}
            setShowInfo={setShowInfo}
            inputProps={{
              type: "number",
              id: "narrow",
              placeholder: "1",
              min: 1,
              max: 99,
              maxLength: 2,
              value: !setsReg ? "" : setsReg,
              onChange: (e) => setSetsReg(safeParseInt(e.target.value)),
            }}
          />
          <TooltipInput
            id="reps"
            label="Reps"
            tooltip="A rep refers to a repetition of an exercise. The second input field can be left blank if you prefer."
            showInfo={showInfo}
            setShowInfo={setShowInfo}
          >
            <input
              type="number"
              id="narrow"
              placeholder="1"
              min="1"
              max="99"
              maxLength="2"
              value={!repsLowReg ? "" : repsLowReg}
              onChange={(e) => setRepsLowReg(safeParseInt(e.target.value))}
            />
            <p>&nbsp;-&nbsp;</p>
            <input
              type="number"
              id="narrow"
              min="0"
              max="99"
              maxLength="2"
              value={!repsHighReg ? "" : repsHighReg}
              onChange={(e) => setRepsHighReg(safeParseInt(e.target.value))}
            />
          </TooltipInput>
          <TooltipInput
            id="weight"
            label="Weight"
            tooltip="Weight refers to how much weight is added to an exercise. If there is no weight added (eg. Push Ups), then this can be left blank."
            showInfo={showInfo}
            setShowInfo={setShowInfo}
          >
            {userProfile.measurement_type !== "metric" ? (
              <>
                <input
                  type="number"
                  id="wide"
                  placeholder="0"
                  step="0.1"
                  min="0"
                  max="1500"
                  maxLength="4"
                  value={!weightReg ? "" : weightReg}
                  onChange={(e) => setWeightReg(safeParseFloat(e.target.value))}
                />
                <label>&nbsp;lbs</label>
              </>
            ) : (
              <>
                <input
                  type="number"
                  id="wide"
                  step="0.1"
                  placeholder="0"
                  min="0"
                  max="750"
                  maxLength="3"
                  value={!weightReg ? "" : defaultConvertWeight(weightReg)}
                  onChange={(e) =>
                    setWeightReg(convertWeight(safeParseFloat(e.target.value)))
                  }
                />
                <label>&nbsp;kgs</label>
              </>
            )}
          </TooltipInput>
          <div className="flex">
            <label id="notes" className="flex-input">
              Notes:&nbsp;
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
          <TooltipInput
            id="track"
            label="Track Progress?"
            tooltip="Selecting this will create a single entry under Track Progress with the information provided. The entry will show up in a list of the same name."
            showInfo={showInfo}
            setShowInfo={setShowInfo}
          >
            <input
              type="checkbox"
              id="checkbox"
              checked={trackReg}
              onChange={() => setTrackReg(!trackReg)}
            />
          </TooltipInput>
          <TooltipInput
            id="bw"
            label="Bodyweight Comparison?"
            tooltip="Selecting this will add the proportion of weight lifted to your bodyweight when creating an entry under Track Progress. This is especially useful for the more essential compound lifts (eg. Bench Press, Squat, etc.)."
            showInfo={showInfo}
            setShowInfo={setShowInfo}
          >
            <input
              type="checkbox"
              id="checkbox"
              checked={bwReg}
              disabled={!trackReg}
              onChange={() => setBwReg(!bwReg)}
            />
          </TooltipInput>
        </div>
      )}
    </Modal>
  );
};

export default ExerciseFormModal;
