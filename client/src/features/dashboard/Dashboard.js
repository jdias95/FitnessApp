import React, { useState, useEffect, useMemo } from "react";
import CreateRoutineModal from "../routines/CreateRoutineModal";
import AddWeightModal from "../weight/AddWeightModal";
import DeleteWeightModal from "../weight/DeleteWeightModal";
import DeleteRoutineModal from "../routines/DeleteRoutineModal";
import UpdateRoutineModal from "../routines/UpdateRoutineModal";
import CreateExerciseModal from "../exercises/CreateExerciseModal";
import UpdateExerciseModal from "../exercises/UpdateExerciseModal";
import DeleteExerciseModal from "../exercises/DeleteExerciseModal";
import DeleteTrackedExerciseModal from "../tracked-exercises/DeleteTrackedExerciseModal";
import NotesModal from "../exercises/NotesModal";
import StatisticsModal from "../tracked-exercises/StatisticsModal";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import StarterRoutinesModal from "../help/StarterRoutinesModal";
import UpdateTrackedExerciseNameModal from "../tracked-exercises/UpdateTrackedExerciseNameModal";
import WeightWidget from "../widgets/WeightWidget";
import RoutineWidget from "../widgets/RoutineWidget";
import TrackedExerciseWidget from "../widgets/TrackedExerciseWidget";
import RoutineSelectionModal from "../workout-log/RoutineSelectionModal";
import WorkoutLogModal from "../workout-log/WorkoutLogModal";

const Dashboard = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  const {
    loginStatus,
    userProfile,
    previousWeight,
    setPreviousWeight,
    formattedDate,
    formatDate,
    routines,
    setRoutines,
    exercises,
    setExercises,
    workoutLog,
    setWorkoutLog,
    trackedExercises,
    setTrackedExercises,
    weightData,
    setWeightData,
    setUserProfile,
    convertWeight,
    defaultConvertWeight,
    safeParseInt,
    safeParseFloat,
    openMenus,
    setOpenMenus,
    routineExercises,
    setRoutineExercises,
    apiURL,
  } = props;
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState({});
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showDeleteWeightModal, setShowDeleteWeightModal] = useState(false);
  const [weightTimeBTN, setWeightTimeBTN] = useState(0);
  const [timeSelection, setTimeSelection] = useState("1 month");
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [showUpdateRoutineModal, setShowUpdateRoutineModal] = useState(false);
  const [showDeleteRoutineModal, setShowDeleteRoutineModal] = useState(false);
  const [showStarterRoutinesModal, setShowStarterRoutinesModal] =
    useState(false);
  const [firstExercise, setFirstExercise] = useState({});
  const [selectedExercise, setSelectedExercise] = useState({});
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [showUpdateExerciseModal, setShowUpdateExerciseModal] = useState(false);
  const [showDeleteExerciseModal, setShowDeleteExerciseModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDeleteTrackedExerciseModal, setShowDeleteTrackedExerciseModal] =
    useState(false);
  const [
    showUpdateTrackedExerciseNameModal,
    setShowUpdateTrackedExerciseNameModal,
  ] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [selectedRoutineForLog, setSelectedRoutineForLog] = useState(null);
  const [showRoutineSelectionModal, setShowRoutineSelectionModal] =
    useState(false);
  const [showWorkoutLogModal, setShowWorkoutLogModal] = useState(false);
  const timeMultipliers = useMemo(() => {
    return {
      "1 month": 6,
      "2 months": 12,
      "3 months": 18,
      "6 months": 36,
      "1 year": 72,
      All: Math.ceil(weightTimeBTN / 432000000),
    };
  }, [weightTimeBTN]);
  const [showInfo, setShowInfo] = useState("");
  const [weightForcast, setWeightForcast] = useState([0, ""]);

  const toggleModal = (modalName, isOpen) => {
    switch (modalName) {
      case "weight":
        setShowWeightModal(isOpen);
        break;
      case "deleteWeight":
        setShowDeleteWeightModal(isOpen);
        break;
      case "routine":
        setShowRoutineModal(isOpen);
        break;
      case "updateRoutine":
        setShowUpdateRoutineModal(isOpen);
        break;
      case "deleteRoutine":
        setShowDeleteRoutineModal(isOpen);
        break;
      case "exercise":
        setShowCreateExerciseModal(isOpen);
        break;
      case "notes":
        setShowNotesModal(isOpen);
        break;
      case "updateExercise":
        setShowUpdateExerciseModal(isOpen);
        break;
      case "deleteExercise":
        setShowDeleteExerciseModal(isOpen);
        break;
      case "deleteTrackedExercise":
        setShowDeleteTrackedExerciseModal(isOpen);
        break;
      case "updateTrackedExerciseName":
        setShowUpdateTrackedExerciseNameModal(isOpen);
        break;
      case "exerciseStatistics":
        setShowStatisticsModal(isOpen);
        break;
      case "starterRoutines":
        setShowStarterRoutinesModal(isOpen);
        break;
      case "routineSelection":
        setShowRoutineSelectionModal(isOpen);
        break;
      case "workoutLog":
        setShowWorkoutLogModal(isOpen);
        break;
      default:
        break;
    }
  };

  const getExercisesForRoutine = (routineId) => {
    if (exercises.length > 0) {
      return exercises.filter((exercise) => exercise.routine_id === routineId);
    } else {
      return;
    }
  };

  const toggleMenu = (routineId) => {
    setOpenMenus((prevOpenMenus) => ({
      ...prevOpenMenus,
      [routineId]: !prevOpenMenus[routineId],
    }));

    if (!routineExercises[routineId]) {
      const exercisesForRoutine = getExercisesForRoutine(routineId);
      setRoutineExercises((prevRoutineExercises) => ({
        ...prevRoutineExercises,
        [routineId]: exercisesForRoutine,
      }));
    }
  };

  const toggleTrackedMenu = (exerciseName) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [exerciseName]: !prevState[exerciseName],
    }));
  };

  const compareBW = (bw, weight) => {
    return Number(weight / bw).toFixed(2);
  };

  useEffect(() => {
    if (
      userProfile &&
      userProfile.target_weight &&
      userProfile.weight_goal &&
      userProfile.weight_goal !== 0
    ) {
      const weightDifference = userProfile.target_weight - userProfile.weight;
      if (
        (userProfile.weight_goal < 0 && weightDifference < 0) ||
        (userProfile.weight_goal > 0 && weightDifference > 0)
      ) {
        setWeightForcast(
          weightDifference / userProfile.weight_goal >= 1
            ? [
                (weightDifference / userProfile.weight_goal).toFixed(1),
                "months",
              ]
            : weightDifference / userProfile.weight_goal < 1 &&
              weightDifference / userProfile.weight_goal > 0
            ? [
                (weightDifference / (userProfile.weight_goal / 4)).toFixed(1),
                "weeks",
              ]
            : [0, ""]
        );
      }
    }
  }, [userProfile]);

  // Handles logic for list sorting
  const handleOnDragEnd = (result, sortableList, listType) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    // Copies the sort order as a new list
    let sortOrder = sortableList.map((item) => item.sort_order);

    // Moves the item on the front-end
    const [itemMoved] = sortableList.splice(sourceIndex, 1);
    sortableList.splice(destinationIndex, 0, itemMoved);

    // Updates the sort_order values to prepare them for the database
    sortableList.forEach((item, index) => {
      item.sort_order = sortOrder[index];
    });

    // Checks the list type and updates the sort_order values in the database
    if (listType === "routineExercises") {
      Promise.all(
        sortableList.map((exercise, index) => {
          return Axios.put(`${apiURL}/update/exercise/${exercise.id}`, {
            name: exercise.name,
            repsLow: exercise.reps_low,
            repsHigh: exercise.reps_high,
            setsLow: exercise.sets_low,
            setsHigh: exercise.sets_high,
            weight: exercise.weight,
            tracked: exercise.tracked,
            bw: exercise.bw,
            notes: exercise.notes,
            sortOrder: exercise.sort_order,
          });
        })
      ).catch((error) => {
        console.log(error);
      });

      // Sets the selected exercise to reflect the new order if the exercise is updated after sorting
      setSelectedExercise(sortableList[destinationIndex]);
    } else if (listType === "trackedExercises") {
      Promise.all(
        sortableList.map((exercise, index) => {
          return Axios.put(
            `${apiURL}/update/tracked-exercise-order/${exercise.id}`,
            {
              name: exercise.exercise_name,
              sortOrder: exercise.sort_order,
            }
          );
        })
      ).catch((error) => {
        console.log(error);
      });
    }
  };

  return (
    <div className="dashboard-container row flex">
      <WeightWidget
        userProfile={userProfile}
        weightData={weightData}
        timeSelection={timeSelection}
        timeMultipliers={timeMultipliers}
        defaultConvertWeight={defaultConvertWeight}
        setTimeSelection={setTimeSelection}
        weightTimeBTN={weightTimeBTN}
        setWeightTimeBTN={setWeightTimeBTN}
        weightForcast={weightForcast}
        setSelectedWeight={setSelectedWeight}
        toggleModal={toggleModal}
      />
      <div className="exercise-container">
        <RoutineWidget
          routines={routines}
          openMenus={openMenus}
          routineExercises={routineExercises}
          handleOnDragEnd={handleOnDragEnd}
          toggleMenu={toggleMenu}
          toggleModal={toggleModal}
          setSelectedRoutine={setSelectedRoutine}
          setSelectedExercise={setSelectedExercise}
          userProfile={userProfile}
          defaultConvertWeight={defaultConvertWeight}
        />
        <TrackedExerciseWidget
          trackedExercises={trackedExercises}
          openMenus={openMenus}
          handleOnDragEnd={handleOnDragEnd}
          toggleTrackedMenu={toggleTrackedMenu}
          setSelectedExercise={setSelectedExercise}
          toggleModal={toggleModal}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
          userProfile={userProfile}
          defaultConvertWeight={defaultConvertWeight}
          compareBW={compareBW}
          setFirstExercise={setFirstExercise}
        />
      </div>

      {showWeightModal && (
        <AddWeightModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={() => {
            toggleModal("weight", false);
          }}
          previousWeight={previousWeight}
          setPreviousWeight={setPreviousWeight}
          formattedDate={formattedDate}
          setWeightData={setWeightData}
          weightData={weightData}
          setUserProfile={setUserProfile}
          convertWeight={convertWeight}
          defaultConvertWeight={defaultConvertWeight}
          safeParseFloat={safeParseFloat}
          apiURL={apiURL}
        />
      )}

      {showDeleteWeightModal && selectedWeight && (
        <DeleteWeightModal
          onClose={() => {
            toggleModal("deleteWeight", false);
          }}
          formatDate={formatDate}
          selectedWeight={selectedWeight}
          setWeightData={setWeightData}
          apiURL={apiURL}
        />
      )}

      {showRoutineModal && (
        <CreateRoutineModal
          loginStatus={loginStatus}
          onClose={() => {
            toggleModal("routine", false);
          }}
          routines={routines}
          setRoutines={setRoutines}
          apiURL={apiURL}
        />
      )}

      {showUpdateRoutineModal && (
        <UpdateRoutineModal
          onClose={() => {
            setSelectedRoutine(null);
            toggleModal("updateRoutine", false);
          }}
          routines={routines}
          setRoutines={setRoutines}
          selectedRoutine={selectedRoutine}
          apiURL={apiURL}
        />
      )}

      {showDeleteRoutineModal && (
        <DeleteRoutineModal
          onClose={() => {
            setSelectedRoutine(null);
            toggleModal("deleteRoutine", false);
          }}
          setRoutines={setRoutines}
          routines={routines}
          selectedRoutine={selectedRoutine}
          apiURL={apiURL}
        />
      )}

      {showCreateExerciseModal && (
        <CreateExerciseModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={() => {
            setSelectedRoutine(null);
            toggleModal("exercise", false);
          }}
          selectedRoutine={selectedRoutine}
          routineExercises={routineExercises}
          setRoutineExercises={setRoutineExercises}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
          convertWeight={convertWeight}
          defaultConvertWeight={defaultConvertWeight}
          safeParseInt={safeParseInt}
          safeParseFloat={safeParseFloat}
          apiURL={apiURL}
        />
      )}

      {showUpdateExerciseModal && selectedExercise && (
        <UpdateExerciseModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={() => {
            setSelectedRoutine(null);
            toggleModal("updateExercise", false);
          }}
          selectedRoutine={selectedRoutine}
          selectedExercise={selectedExercise}
          setRoutineExercises={setRoutineExercises}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
          convertWeight={convertWeight}
          defaultConvertWeight={defaultConvertWeight}
          safeParseInt={safeParseInt}
          safeParseFloat={safeParseFloat}
          apiURL={apiURL}
        />
      )}

      {showDeleteExerciseModal && selectedExercise && (
        <DeleteExerciseModal
          onClose={() => {
            setSelectedRoutine(null);
            toggleModal("deleteExercise", false);
          }}
          selectedExercise={selectedExercise}
          selectedRoutine={selectedRoutine}
          setRoutineExercises={setRoutineExercises}
          apiURL={apiURL}
        />
      )}

      {showDeleteTrackedExerciseModal && selectedExercise && (
        <DeleteTrackedExerciseModal
          onClose={() => {
            toggleModal("deleteTrackedExercise", false);
          }}
          formatDate={formatDate}
          selectedExercise={selectedExercise}
          setTrackedExercises={setTrackedExercises}
          trackedExercises={trackedExercises}
          apiURL={apiURL}
        />
      )}

      {showUpdateTrackedExerciseNameModal &&
        (selectedExercise || selectedExercise === "") && (
          <UpdateTrackedExerciseNameModal
            onClose={() => {
              toggleModal("updateTrackedExerciseName", false);
            }}
            loginStatus={loginStatus}
            selectedExercise={selectedExercise}
            trackedExercises={trackedExercises}
            setTrackedExercises={setTrackedExercises}
            apiURL={apiURL}
          />
        )}

      {showNotesModal && selectedExercise && (
        <NotesModal
          onClose={() => {
            toggleModal("notes", false);
          }}
          selectedExercise={selectedExercise}
        />
      )}

      {showStatisticsModal && (
        <StatisticsModal
          onClose={() => {
            toggleModal("exerciseStatistics", false);
          }}
          lastExercise={selectedExercise[selectedExercise.length - 1]}
          selectedExerciseList={selectedExercise}
          firstExercise={firstExercise}
          userProfile={userProfile}
          defaultConvertWeight={defaultConvertWeight}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
        />
      )}

      {showStarterRoutinesModal && (
        <StarterRoutinesModal
          loginStatus={loginStatus}
          onClose={() => {
            toggleModal("starterRoutines", false);
          }}
          routines={routines}
          setRoutines={setRoutines}
          exercises={exercises}
          setExercises={setExercises}
          apiURL={apiURL}
        />
      )}

      {showRoutineSelectionModal && (
        <RoutineSelectionModal
          onClose={() => {
            toggleModal("routineSelection", false);
          }}
          routines={routines}
          getExercisesForRoutine={getExercisesForRoutine}
          setSelectedRoutineForLog={setSelectedRoutineForLog}
          toggleModal={toggleModal}
        />
      )}

      {showWorkoutLogModal && (
        <WorkoutLogModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={() => {
            toggleModal("workoutLog", false);
            setSelectedRoutineForLog(null);
          }}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
          convertWeight={convertWeight}
          defaultConvertWeight={defaultConvertWeight}
          setTrackedExercises={setTrackedExercises}
          safeParseInt={safeParseInt}
          safeParseFloat={safeParseFloat}
          selectedRoutineForLog={selectedRoutineForLog}
          workoutLog={workoutLog}
          setWorkoutLog={setWorkoutLog}
          apiURL={apiURL}
        />
      )}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        viewBox="0 0 26 26"
        className="add-log-svg"
        role="img"
        aria-label="Workout Log"
        onClick={() => {
          if (workoutLog.length > 0) {
            setSelectedRoutineForLog(null);
            toggleModal("workoutLog", true);
          } else {
            toggleModal("routineSelection", true);
          }
        }}
      >
        <title>Workout Log</title>
        <path
          fill="currentColor"
          d="M22.438-.063c-.375 0-.732.17-1.032.47l-.718.687l4.218 4.218l.688-.718c.6-.6.6-1.494 0-2.094L23.5.406c-.3-.3-.688-.469-1.063-.469zM20 1.688l-1.094.907l4.5 4.5l1-1L20 1.687zm-1.688 1.625l-9.03 8.938a.975.975 0 0 0-.126.125l-.062.031a.975.975 0 0 0-.219.438l-1.219 4.281a.975.975 0 0 0 1.219 1.219l4.281-1.219a.975.975 0 0 0 .656-.531l8.876-8.782L21 6v.094l-1.188-1.188h.094l-1.593-1.593zM.813 4A1 1 0 0 0 0 5v20a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V14a1 1 0 1 0-2 0v10H2V6h10a1 1 0 1 0 0-2H1a1 1 0 0 0-.094 0a1 1 0 0 0-.094 0zm9.813 9.813l1.375.093l.094 1.5l-1.375.406l-.531-.53l.437-1.47z"
        />
      </svg>
    </div>
  );
};

export default Dashboard;
