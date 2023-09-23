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
import NotesModal from "./NotesModal";
import * as d3 from "d3";
import moment from "moment";

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
    weightData,
    setWeightData,
    formatDate,
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
  const [showNotesModal, setShowNotesModal] = useState(false);
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

  const toggleModal = (modalName, isOpen) => {
    switch (modalName) {
      case "weight":
        setShowWeightModal(isOpen);
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
        setShowExerciseModal(isOpen);
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
      default:
        break;
    }
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

  // if (userProfile) {
  //   if (userProfile.measurement_type === "metric") {
  //     for (let i = 0; i < weightData.length; i++) {
  //       if (weightData[i].weight) {
  //         weightData[i].weight = defaultConvertWeight(weightData[i].weight);
  //       }
  //     }
  //   }
  // }

  useEffect(() => {
    d3.select(".weightGraph svg").remove();

    if (weightData.length > 0) {
      const graphWidth = 500;
      const graphHeight = 400;
      const marginTop = 20;
      const marginRight = 0;
      const marginBottom = 30;
      const marginLeft = 20;

      const yScale = d3
        .scaleLinear()
        .domain([
          d3.min(
            weightData.filter((d) => {
              return d.weight != null;
            }),
            (d) => d.weight - 5
          ),
          d3.max(
            weightData.filter((d) => {
              return d.weight != null;
            }),
            (d) => d.weight + 5
          ),
        ])
        .nice()
        .range([graphHeight - marginBottom, marginTop]);

      const svg = d3
        .select(".weightGraph")
        .append("svg")
        .attr("width", "100%")
        .attr("height", graphHeight)
        .attr("viewBox", `0 0 ${graphWidth} ${graphHeight}`);

      const tickValues = [];
      const endDate = moment(
        weightData[weightData.length - 1].date,
        "YYYY-MM-DD"
      );

      for (let i = 0; i < 5; i++) {
        const date = moment(endDate).subtract(5 * i, "days");
        tickValues.push(date.toDate());
      }

      const xScale = d3
        .scaleTime()
        .domain([new Date(tickValues[4]), new Date(tickValues[0])])
        .range([marginLeft, graphWidth - marginRight]);

      svg
        .append("g")
        .attr("transform", `translate(0,${graphHeight - marginBottom})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickValues(tickValues)
            .tickFormat((date) => {
              // const timeFormat = d3.timeFormat("%m/%d");
              return date.toLocaleDateString().slice(0, -5);
            })
        );

      const line = d3
        .line()
        .defined((d) => {
          return d.weight != null;
        })
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.weight));

      svg
        .append("path")
        .datum(
          weightData.filter((d) => {
            return d.weight != null;
          })
        )
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("d", line);

      svg
        .append("path")
        .datum(weightData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("d", line);

      const yAxisGroup = svg
        .append("g")
        .attr("transform", `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(yScale));

      yAxisGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end")
        .text("Y-Axis Label");

      yAxisGroup
        .selectAll("g.tick")
        .filter((d, i) => i !== 0)
        .append("line")
        .attr("class", "gridline")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", graphWidth - marginRight - marginLeft)
        .attr("y2", 0)
        .attr("stroke", "#9ca5aecf")
        .attr("stroke-dasharray", "4");
    }
  }, [weightData]);

  return (
    <div className="App">
      <div className="row flex">
        <div className="weight container">
          <div className="dashboard flex title">
            <h2>Weight</h2>
            <h1
              id="plus"
              onClick={() => {
                toggleModal("weight", true);
              }}
            >
              +
            </h1>
          </div>
          <div className="weightGraph"></div>
        </div>
        <div className="routine container">
          <div className="dashboard flex title">
            <h2>Workout Routines</h2>
            <h2
              id="plus"
              onClick={() => {
                toggleModal("routine", true);
              }}
            >
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
                    <div
                      className="flex workout-list-clickable"
                      onClick={() => {
                        toggleMenu(val.id);
                      }}
                    >
                      <h3>{val.name}</h3>
                      <h5 className="caret">&diams;</h5>
                    </div>
                    <div className="flex">
                      <img
                        className="img edit"
                        src={process.env.PUBLIC_URL + "/edit.png"}
                        onClick={() => {
                          setSelectedRoutine(val);
                          toggleModal("updateRoutine", true);
                        }}
                        alt="edit"
                      />
                      <img
                        className="img delete"
                        src={process.env.PUBLIC_URL + "/delete.png"}
                        onClick={() => {
                          setSelectedRoutine(val);
                          toggleModal("deleteRoutine", true);
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
                            <div>
                              {exercise.name} | {exercise.sets} x{" "}
                              {exercise.reps_low}
                              {exercise.reps_high
                                ? `-${exercise.reps_high}`
                                : ""}
                              {exercise.weight &&
                              userProfile.measurement_type === "imperial"
                                ? ` | ${exercise.weight} lbs`
                                : exercise.weight &&
                                  userProfile.measurement_type === "metric"
                                ? ` | ${defaultConvertWeight(
                                    exercise.weight
                                  )} kgs`
                                : ""}
                              {exercise.notes && (
                                <img
                                  className="img notes"
                                  src={process.env.PUBLIC_URL + "/notes.png"}
                                  onClick={() => {
                                    setSelectedExercise(exercise);
                                    toggleModal("notes", true);
                                  }}
                                  alt="notes"
                                />
                              )}
                            </div>
                            <div className="flex">
                              <img
                                className="img edit"
                                src={process.env.PUBLIC_URL + "/edit.png"}
                                onClick={() => {
                                  setSelectedRoutine(val);
                                  setSelectedExercise(exercise);
                                  toggleModal("updateExercise", true);
                                }}
                                alt="edit"
                              />
                              <img
                                className="img x"
                                src={process.env.PUBLIC_URL + "/x.png"}
                                onClick={() => {
                                  setSelectedRoutine(val);
                                  setSelectedExercise(exercise);
                                  toggleModal("deleteExercise", true);
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
                            toggleModal("exercise", true);
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
                  <div
                    className="flex tracked-clickable"
                    onClick={() => {
                      toggleTrackedMenu(exerciseName);
                    }}
                  >
                    <h3>{exerciseName}</h3>
                    <h5 className="caret">&diams;</h5>
                  </div>
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
                              ? `${exercise.weight} lbs | `
                              : exercise.weight &&
                                userProfile.measurement_type === "metric"
                              ? `${defaultConvertWeight(
                                  exercise.weight
                                )} kgs | `
                              : " "}
                            {exercise.bw
                              ? `(${compareBW(
                                  userProfile.weight,
                                  exercise.weight
                                )}xBW) | `
                              : " "}
                            {exercise.sets} x {exercise.reps_low}
                            {exercise.reps_high ? `-${exercise.reps_high}` : ""}
                            <img
                              className="img x"
                              src={process.env.PUBLIC_URL + "/x.png"}
                              onClick={() => {
                                setSelectedExercise(exercise);
                                toggleModal("deleteTrackedExercise", true);
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
          onClose={() => {
            toggleModal("weight", false);
          }}
          previousWeight={previousWeight}
          setPreviousWeight={setPreviousWeight}
          formattedDate={formattedDate}
          setWeightData={setWeightData}
          weightData={weightData}
          formatDate={formatDate}
        />
      )}

      {showRoutineModal && (
        <RoutineFormModal
          loginStatus={loginStatus}
          onClose={() => {
            toggleModal("routine", false);
          }}
          routines={routines}
          setRoutines={setRoutines}
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
        />
      )}

      {showExerciseModal && (
        <ExerciseFormModal
          loginStatus={loginStatus}
          userProfile={userProfile}
          onClose={() => {
            setSelectedRoutine(null);
            toggleModal("exercise", false);
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
            toggleModal("updateExercise", false);
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
            toggleModal("deleteExercise", false);
          }}
          selectedExercise={selectedExercise}
          selectedRoutine={selectedRoutine}
          setRoutineExercises={setRoutineExercises}
        />
      )}

      {showDeleteTrackedExerciseModal && selectedExercise && (
        <DeleteTrackedExerciseModal
          onClose={() => {
            toggleModal("deleteTrackedExercise", false);
          }}
          selectedExercise={selectedExercise}
          setTrackedExercises={setTrackedExercises}
          monthNames={monthNames}
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
    </div>
  );
};

export default Dashboard;
