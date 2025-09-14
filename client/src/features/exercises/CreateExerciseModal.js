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
    setShowInfo,
    showInfo,
    convertWeight,
    defaultConvertWeight,
    safeParseInt,
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

        onClose();
      })
      .catch((error) => {
        console.error("Error creating exercise:", error);
      });
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
          safeParseInt={safeParseInt}
          safeParseFloat={safeParseFloat}
        />
      )}
    </Modal>
  );
};

export default ExerciseFormModal;
