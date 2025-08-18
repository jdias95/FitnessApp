import React, { useState } from "react";
import Axios from "axios";
import Modal from "../../components/Modal";
import ExerciseFormFields from "./ExerciseFormFields";

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
  const [setsLowReg, setSetsLowReg] = useState(selectedExercise.sets_low);
  const [setsHighReg, setSetsHighReg] = useState(selectedExercise.sets_high);
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
      setsLow: setsLowReg === "" ? 1 : setsLowReg,
      setsHigh:
        setsHighReg === "" || setsHighReg <= setsLowReg ? null : setsHighReg,
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
              sets_high:
                setsHighReg === "" || setsHighReg <= setsLowReg
                  ? null
                  : setsHighReg,
              sets_low: setsLowReg === "" ? 1 : setsLowReg,
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
              sets: setsLowReg === "" ? 1 : setsLowReg,
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
                          sets: setsLowReg === "" ? 1 : setsLowReg,
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
                          sets: setsLowReg === "" ? 1 : setsLowReg,
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
        <ExerciseFormFields
          userProfile={userProfile}
          nameReg={nameReg}
          setNameReg={setNameReg}
          setsLowReg={setsLowReg}
          setSetsLowReg={setSetsLowReg}
          setsHighReg={setsHighReg}
          setSetsHighReg={setSetsHighReg}
          repsLowReg={repsLowReg}
          setRepsLowReg={setRepsLowReg}
          repsHighReg={repsHighReg}
          setRepsHighReg={setRepsHighReg}
          weightReg={weightReg}
          setWeightReg={setWeightReg}
          notesReg={notesReg}
          setNotesReg={setNotesReg}
          trackReg={trackReg}
          setTrackReg={setTrackReg}
          bwReg={bwReg}
          setBwReg={setBwReg}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          convertWeight={convertWeight}
          defaultConvertWeight={defaultConvertWeight}
          safeParseFloat={safeParseFloat}
          safeParseInt={safeParseInt}
        />
      )}
    </Modal>
  );
};

export default UpdateExerciseModal;
