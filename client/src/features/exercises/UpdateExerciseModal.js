import React, { useState } from "react";
import Axios from "axios";
import Modal from "../../components/Modal";
import TooltipInput from "./TooltipInput";

const UpdateExerciseModal = (props) => {
  const {
    loginStatus,
    userProfile,
    onClose,
    selectedRoutine,
    selectedExercise,
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
  const [nameReg, setNameReg] = useState(selectedExercise.name);
  const [repsLowReg, setRepsLowReg] = useState(selectedExercise.reps_low);
  const [repsHighReg, setRepsHighReg] = useState(selectedExercise.reps_high);
  const [setsReg, setSetsReg] = useState(selectedExercise.sets);
  const [weightReg, setWeightReg] = useState(selectedExercise.weight);
  const [trackReg, setTrackReg] = useState(selectedExercise.tracked);
  const [bwReg, setBwReg] = useState(selectedExercise.bw);
  const [notesReg, setNotesReg] = useState(
    selectedExercise.notes ? selectedExercise.notes : ""
  );
  const sortOrder = selectedExercise.sort_order;

  const updateExercise = (id) => {
    Axios.put(`${apiURL}/update/exercise/${id}`, {
      name: nameReg,
      repsLow: repsLowReg === "" ? 1 : repsLowReg,
      repsHigh:
        repsHighReg === "" || repsHighReg <= repsLowReg ? null : repsHighReg,
      sets: setsReg === "" ? 1 : setsReg,
      weight: weightReg === "" ? 0 : weightReg,
      tracked: trackReg,
      bw: bwReg,
      notes: notesReg,
      sortOrder: sortOrder,
    })
      .then(() => {
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
              sort_order: sortOrder,
            };
          }

          if (trackReg) {
            Axios.post(`${apiURL}/insert/tracked-exercise`, {
              userId: loginStatus.id,
              exerciseId: id,
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
              .then((response) => {
                setTrackedExercises((prevTrackedExercises) => {
                  if (prevTrackedExercises.hasOwnProperty(nameReg)) {
                    return {
                      ...prevTrackedExercises,
                      [nameReg]: [
                        ...prevTrackedExercises[nameReg],
                        {
                          id: response.data.insertId,
                          exercise_id: id,
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
                          id: response.data.insertId,
                          exercise_id: id,
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
                  console.log(trackedExercises);
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
          }

          return {
            ...prevRoutineExercises,
            [selectedRoutine.id]: updatedRoutineExercises,
          };
        });

        onClose();
      })
      .catch((error) => {
        console.error("Error updating exercise:", error);
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
      header="Update Exercise"
      onClose={onClose}
      onConfirm={() => {
        updateExercise(selectedExercise.id);
      }}
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
                  step="0.1"
                  placeholder="0"
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
                  min="0"
                  max="750"
                  placeholder="0"
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

export default UpdateExerciseModal;
