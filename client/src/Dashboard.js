import React, { useState, useEffect } from "react";
import RoutineFormModal from "./RoutineFormModal";
import WeightFormModal from "./WeightFormModal";
import { useNavigate } from "react-router-dom";
import DeleteRoutineModal from "./DeleteRoutineModal";
import UpdateRoutineModal from "./UpdateRoutineModal";
import ExerciseFormModal from "./ExerciseFormModal";
import UpdateExerciseModal from "./UpdateExerciseModal";
import DeleteExerciseModal from "./DeleteExerciseModal";
import DeleteTrackedExerciseModal from "./DeleteTrackedExerciseModal";

const Dashboard = (props) => {
  const {
    loginStatus,
    userProfile,
    previousWeight,
    setPreviousWeight,
    formattedDate,
    routines,
    setRoutines,
    exercises,
    trackedExercises,
    setTrackedExercises,
  } = props;
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showUpdateRoutineModal, setShowUpdateRoutineModal] = useState(false);
  const [showDeleteRoutineModal, setShowDeleteRoutineModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showUpdateExerciseModal, setShowUpdateExerciseModal] = useState(false);
  const [showDeleteExerciseModal, setShowDeleteExerciseModal] = useState(false);
  const [showDeleteTrackedExerciseModal, setShowDeleteTrackedExerciseModal] =
    useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [openMenus, setOpenMenus] = useState({});
  const [routineExercises, setRoutineExercises] = useState({});
  const [selectedExercise, setSelectedExercise] = useState({});
  const navigate = useNavigate();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    if (loginStatus === false) {
      localStorage.clear();
      navigate("/login");
    }
  }, [loginStatus, navigate]);

  const openWeightModal = () => {
    setShowWeightModal(true);
  };

  const closeWeightModal = () => {
    setShowWeightModal(false);
  };

  const cancelWeightModal = () => {
    setShowWeightModal(false);
  };

  const openRoutineModal = () => {
    setShowRoutineModal(true);
  };

  const closeRoutineModal = () => {
    setShowRoutineModal(false);
  };

  const openUpdateRoutineModal = () => {
    setShowUpdateRoutineModal(true);
  };

  const closeUpdateRoutineModal = () => {
    setShowUpdateRoutineModal(false);
  };

  const openDeleteRoutineModal = () => {
    setShowDeleteRoutineModal(true);
  };

  const closeDeleteRoutineModal = () => {
    setShowDeleteRoutineModal(false);
  };

  const openExerciseModal = () => {
    setShowExerciseModal(true);
  };

  const closeExerciseModal = () => {
    setShowExerciseModal(false);
  };

  const openUpdateExerciseModal = () => {
    setShowUpdateExerciseModal(true);
  };

  const closeUpdateExerciseModal = () => {
    setShowUpdateExerciseModal(false);
  };

  const openDeleteExerciseModal = () => {
    setShowDeleteExerciseModal(true);
  };

  const closeDeleteExerciseModal = () => {
    setShowDeleteExerciseModal(false);
  };

  const openDeleteTrackedExerciseModal = () => {
    setShowDeleteTrackedExerciseModal(true);
  };

  const closeDeleteTrackedExerciseModal = () => {
    setShowDeleteTrackedExerciseModal(false);
  };

  const getExercisesForRoutine = (routineId) => {
    return exercises.filter((exercise) => exercise.routine_id === routineId);
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

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(1));
  };

  const compareBW = (bw, weight) => {
    return Number(weight / bw).toFixed(2);
  };

  return (
    <div className="App">
      <div className="row flex">
        <div className="weight container">
          <div className="dashboard flex title">
            <h2>Weight</h2>
            <h1 id="plus" onClick={openWeightModal}>
              +
            </h1>
          </div>
        </div>
        <div className="routine container">
          <div className="dashboard flex title">
            <h2>Workout Routines</h2>
            <h2 id="plus" onClick={openRoutineModal}>
              +
            </h2>
          </div>
          <div>
            {routines.map((val) => {
              const isMenuOpen = openMenus[val.id] || false;
              const exerciseList = routineExercises[val.id] || [];

              return (
                <div key={`${val.name}-routine`}>
                  <div className="dashboard flex list-title-card">
                    <h3>{val.name}</h3>
                    <h5
                      className="caret"
                      onClick={() => {
                        toggleMenu(val.id);
                      }}
                    >
                      &diams;
                    </h5>
                    <div className="flex">
                      <img
                        className="img edit"
                        src={process.env.PUBLIC_URL + "/edit.png"}
                        onClick={() => {
                          setSelectedRoutine(val);
                          openUpdateRoutineModal();
                        }}
                        alt="edit"
                      />
                      <img
                        className="img delete"
                        src={process.env.PUBLIC_URL + "/delete.png"}
                        onClick={() => {
                          setSelectedRoutine(val);
                          openDeleteRoutineModal();
                        }}
                        alt="delete"
                      />
                    </div>
                  </div>
                  {isMenuOpen && (
                    <div className="dropdown-menu">
                      <ul>
                        {exerciseList.map((exercise) => (
                          <li key={exercise.id} className="dashboard flex">
                            {exercise.name} | {exercise.sets} x{" "}
                            {exercise.reps_low}
                            {exercise.reps_high ? `-${exercise.reps_high}` : ""}
                            {exercise.weight &&
                            userProfile.measurement_type === "imperial"
                              ? ` | ${exercise.weight} lbs`
                              : exercise.weight &&
                                userProfile.measurement_type === "metric"
                              ? ` | ${defaultConvertWeight(
                                  exercise.weight
                                )} kgs`
                              : ""}
                            <div className="flex">
                              <img
                                className="img edit"
                                src={process.env.PUBLIC_URL + "/edit.png"}
                                onClick={() => {
                                  setSelectedRoutine(val);
                                  setSelectedExercise(exercise);
                                  openUpdateExerciseModal();
                                }}
                                alt="edit"
                              />
                              <img
                                className="img x"
                                src={process.env.PUBLIC_URL + "/x.png"}
                                onClick={() => {
                                  setSelectedRoutine(val);
                                  setSelectedExercise(exercise);
                                  openDeleteExerciseModal();
                                }}
                                alt="delete"
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="plus-container">
                        <h1
                          id="list-plus"
                          onClick={() => {
                            setSelectedRoutine(val);
                            openExerciseModal();
                          }}
                        >
                          +
                        </h1>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="tracked container">
          <div className="dashboard flex title">
            <h2>Track Progress</h2>
          </div>
          <div>
            {Object.keys(trackedExercises).map((exerciseName) => (
              <div key={exerciseName}>
                <div className="dashboard flex list-title-card">
                  <h3>{exerciseName}</h3>
                  <h5
                    onClick={() => {
                      toggleTrackedMenu(exerciseName);
                    }}
                    className="caret"
                  >
                    &diams;
                  </h5>
                </div>
                {openMenus[exerciseName] && (
                  <div className="tracked-dropdown dropdown-menu">
                    <ul>
                      {trackedExercises[exerciseName]
                        .slice()
                        .reverse()
                        .map((exercise) => (
                          <li key={exercise.id} className="dashboard flex">
                            {`${
                              monthNames[
                                parseInt(exercise.date.slice(5, 7) - 1)
                              ]
                            } ${exercise.date.slice(8)} ${exercise.date.slice(
                              0,
                              4
                            )}`}
                            :{" "}
                            {exercise.weight &&
                            userProfile.measurement_type === "imperial"
                              ? `${exercise.weight} lbs `
                              : exercise.weight &&
                                userProfile.measurement_type === "metric"
                              ? `${defaultConvertWeight(exercise.weight)} kgs `
                              : " "}
                            {exercise.bw
                              ? `(${compareBW(
                                  userProfile.weight,
                                  exercise.weight
                                )}xBW) `
                              : " "}
                            | {exercise.sets} x {exercise.reps_low}
                            {exercise.reps_high ? `-${exercise.reps_high}` : ""}
                            <img
                              className="img x"
                              src={process.env.PUBLIC_URL + "/x.png"}
                              onClick={() => {
                                setSelectedExercise(exercise);
                                openDeleteTrackedExerciseModal();
                              }}
                              alt="delete"
                            />
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showWeightModal && (
        <WeightFormModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={closeWeightModal}
          onCancel={cancelWeightModal}
          previousWeight={previousWeight}
          setPreviousWeight={setPreviousWeight}
          formattedDate={formattedDate}
        />
      )}

      {showRoutineModal && (
        <RoutineFormModal
          loginStatus={loginStatus}
          onClose={closeRoutineModal}
          routines={routines}
          setRoutines={setRoutines}
        />
      )}

      {showUpdateRoutineModal && (
        <UpdateRoutineModal
          onClose={() => {
            setSelectedRoutine(null);
            closeUpdateRoutineModal();
          }}
          routines={routines}
          setRoutines={setRoutines}
          selectedRoutine={selectedRoutine}
        />
      )}

      {showDeleteRoutineModal && (
        <DeleteRoutineModal
          onClose={() => {
            setSelectedRoutine(null);
            closeDeleteRoutineModal();
          }}
          setRoutines={setRoutines}
          routines={routines}
          selectedRoutine={selectedRoutine}
        />
      )}

      {showExerciseModal && (
        <ExerciseFormModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={() => {
            setSelectedRoutine(null);
            closeExerciseModal();
          }}
          selectedRoutine={selectedRoutine}
          routineExercises={routineExercises}
          setRoutineExercises={setRoutineExercises}
          formattedDate={formattedDate}
          setTrackedExercises={setTrackedExercises}
        />
      )}

      {showUpdateExerciseModal && selectedExercise && (
        <UpdateExerciseModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={() => {
            setSelectedRoutine(null);
            closeUpdateExerciseModal();
          }}
          selectedRoutine={selectedRoutine}
          selectedExercise={selectedExercise}
          setRoutineExercises={setRoutineExercises}
          formattedDate={formattedDate}
          setTrackedExercises={setTrackedExercises}
        />
      )}

      {showDeleteExerciseModal && selectedExercise && (
        <DeleteExerciseModal
          onClose={() => {
            setSelectedRoutine(null);
            closeDeleteExerciseModal();
          }}
          selectedExercise={selectedExercise}
          selectedRoutine={selectedRoutine}
          setRoutineExercises={setRoutineExercises}
        />
      )}

      {showDeleteTrackedExerciseModal && selectedExercise && (
        <DeleteTrackedExerciseModal
          onClose={closeDeleteTrackedExerciseModal}
          selectedExercise={selectedExercise}
          setTrackedExercises={setTrackedExercises}
          monthNames={monthNames}
        />
      )}
    </div>
  );
};

export default Dashboard;
