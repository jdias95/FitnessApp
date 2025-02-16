import React from "react";
import Axios from "axios";
import Modal from "../../components/Modal";

const StarterRoutinesModal = (props) => {
  const {
    loginStatus,
    onClose,
    routines,
    setRoutines,
    exercises,
    setExercises,
    apiURL,
  } = props;

  const createRoutines = () => {
    const routineData = [
      { userId: loginStatus.id, name: "Full Body 1" },
      { userId: loginStatus.id, name: "Full Body 2" },
      { userId: loginStatus.id, name: "Full Body 3" },
    ];

    const exerciseData = [
      { userId: loginStatus.id, name: "Squats", repsHigh: 8, repsLow: 5 },
      { userId: loginStatus.id, name: "Bench Press", repsHigh: 8, repsLow: 5 },
      {
        userId: loginStatus.id,
        name: "Bent-over Rows",
        repsHigh: 8,
        repsLow: 5,
      },
      {
        userId: loginStatus.id,
        name: "Overhead Press",
        repsHigh: 8,
        repsLow: 5,
      },
      {
        userId: loginStatus.id,
        name: "Dumbbell Romanian Deadlift",
        repsHigh: 8,
        repsLow: 5,
      },
      {
        userId: loginStatus.id,
        name: "Incline Bench Press",
        repsHigh: 8,
        repsLow: 5,
      },
      { userId: loginStatus.id, name: "Lat Pulldown", repsHigh: 8, repsLow: 5 },
      {
        userId: loginStatus.id,
        name: "Dumbbell Lateral Raise",
        repsHigh: 12,
        repsLow: 8,
      },
      { userId: loginStatus.id, name: "Lunges", repsHigh: 8, repsLow: 5 },
      { userId: loginStatus.id, name: "Dips", repsHigh: 8, repsLow: 5 },
      {
        userId: loginStatus.id,
        name: "Pullups (Assisted if needed)",
        repsHigh: 8,
        repsLow: 5,
      },
      {
        userId: loginStatus.id,
        name: "Seated Shoulder Press",
        repsHigh: 8,
        repsLow: 5,
      },
    ];

    Promise.all(
      routineData.map((routine) => {
        return Axios.post(`${apiURL}/insert/routine`, {
          userId: routine.userId,
          name: routine.name,
        }).then((response) => response.data.insertId);
      })
    )
      .then((insertIds) => {
        const newRoutines = routineData.map((routine, index) => ({
          id: insertIds[index],
          user_id: routine.userId,
          name: routine.name,
        }));

        Promise.all(
          exerciseData.map((exercise, index) => {
            return Axios.post(`${apiURL}/insert/exercise`, {
              userId: exercise.userId,
              routineId:
                index <= 3
                  ? insertIds[0]
                  : index <= 7
                  ? insertIds[1]
                  : insertIds[2],
              name: exercise.name,
              repsHigh: exercise.repsHigh,
              repsLow: exercise.repsLow,
              sets: 3,
              weight: 0,
              tracked: false,
              bw: false,
              notes: "",
            }).then((response) => response.data.insertId);
          })
        )
          .then((insertIds2) => {
            const newExercises = exerciseData.map((exercise, index) => {
              Axios.put(`${apiURL}/update/exercise/${insertIds2[index]}`, {
                userId: exercise.userId,
                routineId:
                  index <= 3
                    ? insertIds[0]
                    : index <= 7
                    ? insertIds[1]
                    : insertIds[2],
                name: exercise.name,
                repsHigh: exercise.repsHigh,
                repsLow: exercise.repsLow,
                sets: 3,
                weight: 0,
                tracked: false,
                bw: false,
                notes: "",
                sortOrder: insertIds2[index],
              });

              const routineIndex = Math.floor(index / 4);
              return {
                id: insertIds2[index],
                user_id: exercise.userId,
                routine_id: insertIds[routineIndex],
                name: exercise.name,
                reps_high: exercise.repsHigh,
                reps_low: exercise.repsLow,
                sets: 3,
                weight: 0,
                tracked: false,
                bw: false,
                notes: "",
                sort_order: insertIds2[index],
              };
            });

            setExercises([...exercises, ...newExercises]);
          })
          .catch((error) => {
            console.error("Error creating exercises:", error);
          });

        setRoutines([...routines, ...newRoutines]);
        onClose();
      })
      .catch((error) => {
        console.error("Error creating routines:", error);
      });
  };

  return (
    <Modal
      isOpen={true}
      hasHeader={false}
      onClose={onClose}
      onConfirm={(e) => {
        e.preventDefault();
        createRoutines();
      }}
      isLarge={true}
    >
      <p>
        Feeling unsure about where to start? Click 'Confirm' to generate three
        simple full-body workout routines as a guide. Feel free to customize
        them based on your preferences!
      </p>
    </Modal>
  );
};

export default StarterRoutinesModal;
