import React, { useState, useEffect } from "react";
import RoutineFormModal from "./RoutineFormModal";
import WeightFormModal from "./WeightFormModal";
import { useNavigate } from "react-router-dom";
import DeleteRoutineModal from "./DeleteRoutineModal";
import UpdateRoutineModal from "./UpdateRoutineModal";
import ExerciseFormModal from "./ExerciseFormModal";
import UpdateExerciseModal from "./UpdateExerciseModal";
import DeleteExerciseModal from "./DeleteExerciseModal";

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
    setExercises,
  } = props;
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showUpdateRoutineModal, setShowUpdateRoutineModal] = useState(false);
  const [showDeleteRoutineModal, setShowDeleteRoutineModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showUpdateExerciseModal, setShowUpdateExerciseModal] = useState(false);
  const [showDeleteExerciseModal, setShowDeleteExerciseModal] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [openMenus, setOpenMenus] = useState({});
  const [routineExercises, setRoutineExercises] = useState({});
  const [selectedExercise, setSelectedExercise] = useState({});
  const [exerciseList, setExerciseList] = useState([]);
  const navigate = useNavigate();

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
    const data = JSON.parse(localStorage.getItem("weightFormData"));
    data.weight = JSON.parse(
      localStorage.getItem("previousWeight")
    ).previousWeight.weight;
    localStorage.setItem("weightFormData", JSON.stringify(data));
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

  const defaultConvertWeight = (lbs) => {
    const kgs = lbs / 2.20462262185;
    return Number(kgs.toFixed(1));
  };

  return (
    <div className="App">
      <div className="flex">
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
                  <div className="dashboard flex routine-card">
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
                      <button
                        onClick={() => {
                          setSelectedRoutine(val);
                          openUpdateRoutineModal();
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRoutine(val);
                          openDeleteRoutineModal();
                        }}
                      >
                        Delete
                      </button>
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
                              <button
                                onClick={() => {
                                  setSelectedRoutine(val);
                                  setExerciseList(exerciseList);
                                  setSelectedExercise(exercise);
                                  openUpdateExerciseModal();
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRoutine(val);
                                  setExerciseList(exerciseList);
                                  setSelectedExercise(exercise);
                                  openDeleteExerciseModal();
                                }}
                              >
                                Delete
                              </button>
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
          setExercises={setExercises}
          routineExercises={routineExercises}
          setRoutineExercises={setRoutineExercises}
        />
      )}

      {showUpdateExerciseModal && (
        <UpdateExerciseModal
          userProfile={userProfile}
          onClose={() => {
            setSelectedRoutine(null);
            closeUpdateExerciseModal();
          }}
          selectedRoutine={selectedRoutine}
          setExercises={setExercises}
          routineExercises={routineExercises}
          setRoutineExercises={setRoutineExercises}
        />
      )}

      {showDeleteExerciseModal && (
        <DeleteExerciseModal
          onClose={() => {
            setSelectedRoutine(null);
            closeDeleteExerciseModal();
          }}
          selectedExercise={selectedExercise}
          exerciseList={exerciseList}
          setExerciseList={setExerciseList}
          selectedRoutine={selectedRoutine}
          setExercises={setExercises}
          routineExercises={routineExercises}
          setRoutineExercises={setRoutineExercises}
        />
      )}
    </div>
  );
};

export default Dashboard;
