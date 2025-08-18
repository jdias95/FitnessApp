import React, { useState } from "react";
import ExerciseFormFields from "./ExerciseFormFields";
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
  const [setsHighReg, setSetsHighReg] = useState(0);
  const [setsLowReg, setSetsLowReg] = useState(1);
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
      setsHigh:
        setsHighReg === "" || setsHighReg <= setsLowReg ? null : setsHighReg,
      setsLow: setsLowReg === "" ? 1 : setsLowReg,
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
          setsLow: setsLowReg === "" ? 1 : setsLowReg,
          setsHigh:
            setsHighReg === "" || setsHighReg <= setsLowReg
              ? null
              : setsHighReg,
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
              sets_High:
                setsHighReg === "" || setsHighReg <= setsLowReg
                  ? null
                  : setsHighReg,
              sets_low: setsLowReg === "" ? 1 : setsLowReg,
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
            sets: setsLowReg === "" ? 1 : setsLowReg,
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
                        id: response2.data.insertId,
                        exercise_id: response.data.insertId,
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

export default ExerciseFormModal;
