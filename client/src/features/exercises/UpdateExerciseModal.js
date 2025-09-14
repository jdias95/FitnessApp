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
    setShowInfo,
    showInfo,
    convertWeight,
    defaultConvertWeight,
    safeParseInt,
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
          safeParseInt={safeParseInt}
          safeParseFloat={safeParseFloat}
        />
      )}
    </Modal>
  );
};

export default UpdateExerciseModal;
