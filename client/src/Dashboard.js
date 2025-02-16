import React, { useState, useEffect, useMemo } from "react";
import RoutineFormModal from "./RoutineFormModal";
import WeightFormModal from "./WeightFormModal";
import DeleteRoutineModal from "./DeleteRoutineModal";
import UpdateRoutineModal from "./UpdateRoutineModal";
import ExerciseFormModal from "./ExerciseFormModal";
import UpdateExerciseModal from "./UpdateExerciseModal";
import DeleteExerciseModal from "./DeleteExerciseModal";
import DeleteTrackedExerciseModal from "./DeleteTrackedExerciseModal";
import NotesModal from "./NotesModal";
import * as d3 from "d3";
import moment from "moment";
import StatisticsModal from "./StatisticsModal";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Axios from "axios";
import StarterRoutinesModal from "./StarterRoutinesModal";
import UpdateTrackedExerciseNameModal from "./UpdateTrackedExerciseNameModal";

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
    routines,
    setRoutines,
    exercises,
    setExercises,
    trackedExercises,
    setTrackedExercises,
    weightData,
    setWeightData,
    setUserProfile,
    convertWeight,
    defaultConvertWeight,
    safeParseFloat,
    openMenus,
    setOpenMenus,
    routineExercises,
    setRoutineExercises,
    apiURL,
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
  const [
    showUpdateTrackedExerciseNameModal,
    setShowUpdateTrackedExerciseNameModal,
  ] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [showStarterRoutinesModal, setShowStarterRoutinesModal] =
    useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState({});
  const [firstExercise, setFirstExercise] = useState({});
  const [weightTimeBTN, setWeightTimeBTN] = useState(0);
  const [timeSelection, setTimeSelection] = useState("1 month");
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
      case "updateTrackedExerciseName":
        setShowUpdateTrackedExerciseNameModal(isOpen);
        break;
      case "exerciseStatistics":
        setShowStatisticsModal(isOpen);
        break;
      case "starterRoutines":
        setShowStarterRoutinesModal(isOpen);
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

  useEffect(() => {
    d3.select(".weightGraph svg").remove();

    if (weightData.length > 0) {
      const weightValues = weightData
        .filter((d) => d.weight != null)
        .map((d) => d.weight);
      const dateValues = weightData
        .filter((d) => d.weight != null)
        .map((d) => d.date);

      setWeightTimeBTN(
        new Date(dateValues[dateValues.length - 1]).getTime() -
          new Date(dateValues[0]).getTime()
      );

      const graphWidth = 500;
      const graphHeight = 400;
      const marginTop = 20;
      const marginRight = 20;
      const marginBottom = 20;
      const marginLeft = 30;

      const minValue = d3.min(weightValues);
      const maxValue = d3.max(weightValues);
      const meanValue = d3.mean(weightValues);
      const padding = meanValue * 0.025;

      const yScale = d3
        .scaleLinear()
        .domain([
          userProfile &&
          userProfile.target_weight &&
          userProfile.measurement_type !== "metric"
            ? d3.min([userProfile.target_weight - padding, minValue - padding])
            : userProfile && userProfile.target_weight
            ? d3.min([
                defaultConvertWeight(userProfile.target_weight) - padding,
                minValue - padding,
              ])
            : minValue - padding,
          userProfile &&
          userProfile.target_weight &&
          userProfile.measurement_type !== "metric"
            ? d3.max([userProfile.target_weight + padding, maxValue + padding])
            : userProfile && userProfile.target_weight
            ? d3.max([
                defaultConvertWeight(userProfile.target_weight) + padding,
                maxValue + padding,
              ])
            : maxValue + padding,
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

      for (let i = 0; i < 6; i++) {
        const date = moment(endDate).subtract(
          timeMultipliers[timeSelection] * i,
          "days"
        );
        tickValues.push(date.toDate());
      }

      const xScale = d3
        .scaleTime()
        .domain([
          new Date(tickValues[tickValues.length - 1]),
          new Date(tickValues[0]),
        ])
        .range([marginLeft, graphWidth - marginRight]);

      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${graphHeight - marginBottom})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickValues(tickValues)
            .tickFormat((date) => {
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
        .append("defs")
        .append("clipPath")
        .attr("id", "clip-path")
        .append("rect")
        .attr("transform", `translate(${marginLeft}, 0)`)
        .attr("width", graphWidth)
        .attr("height", graphHeight);

      svg
        .append("path")
        .datum(weightData)
        .attr("fill", "none")
        .attr("stroke", "#ACEDFF")
        .attr("stroke-width", 3)
        .attr("width", graphWidth)
        .attr("stroke-linecap", "round")
        .attr("d", line)
        .attr("clip-path", "url(#clip-path)");

      if (userProfile && userProfile.target_weight) {
        const targetWeight =
          userProfile.measurement_type !== "metric"
            ? userProfile.target_weight
            : defaultConvertWeight(userProfile.target_weight);

        svg
          .append("line")
          .attr("class", "target-line")
          .attr("x1", marginLeft)
          .attr("y1", yScale(targetWeight))
          .attr("x2", graphWidth - marginRight)
          .attr("y2", yScale(targetWeight))
          .attr("stroke", "rgb(138, 201, 38)")
          .attr("stroke-width", 2);

        const screenWidth = window.innerWidth;

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
          .style("padding", "15px")
          .style("font-size", screenWidth < 800 ? "11px" : "14px")
          .style("font-family", "Open Sans")
          .style("z-index", "-100");

        svg
          .append("text")
          .attr("x", (graphWidth - marginLeft - marginRight) / 2)
          .attr(
            "y",
            userProfile.target_weight - userProfile.weight > 0
              ? yScale(targetWeight) - 10
              : yScale(targetWeight) + 20
          )
          .attr("text-anchor", "start")
          .attr("fill", "rgb(138, 201, 38)")
          .text(
            weightForcast[0] > 1 ||
              (weightForcast[0] > 0 && weightForcast[0] < 1)
              ? `${Number(weightForcast[0])} ${weightForcast[1]}`
              : Number(weightForcast[0]) === 1
              ? `${Number(weightForcast[0])} ${weightForcast[1].slice(
                  0,
                  weightForcast[1].length - 1
                )}`
              : ""
          );

        if (weightForcast[0]) {
          svg
            .append("image")
            .attr("class", "tooltip-png2")
            .attr("x", (graphWidth - marginLeft - marginRight) / 2 - 18)
            .attr(
              "y",
              userProfile.target_weight - userProfile.weight > 0
                ? yScale(targetWeight) - 22
                : yScale(targetWeight) + 9
            )
            .attr("xlink:href", process.env.PUBLIC_URL + "/tooltip.png")
            .on("mouseover", function (event) {
              d3.select(this).attr(
                "xlink:href",
                process.env.PUBLIC_URL + "/tooltip-hover.png"
              );
              tooltip
                .html(
                  "Please note, the estimated daily calorie budget is tailored to your weekly goal and profile settings. This calculation assumes your average daily calorie intake aligns closely with the budget. Remember, it's a rough estimate, and you may discover better results by adjusting your calorie intake based on your preferences and needs."
                )
                .style("opacity", 1)
                .style("position", "absolute")
                .style(
                  "left",
                  screenWidth < 800
                    ? `${event.pageX - 137}px`
                    : `${event.pageX - 155}px`
                )
                .style(
                  "top",
                  screenWidth < 800
                    ? `${event.pageY - 140}px`
                    : `${event.pageY - 160}px`
                )
                .style("z-index", "100");
            })
            .on("mouseout", function () {
              d3.select(this).attr(
                "xlink:href",
                process.env.PUBLIC_URL + "/tooltip.png"
              );
              tooltip.style("opacity", 0).style("z-index", "-100");
            });
        }
      }

      const yAxisGroup = svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(yScale));

      yAxisGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end")
        .text("Y-Axis Label");

      yAxisGroup
        .selectAll("g.tick")
        .append("line")
        .attr("class", "gridline")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", graphWidth - marginRight - marginLeft)
        .attr("y2", 0)
        .attr("stroke", "rgba(156, 165, 174, .4");

      svg.selectAll(".domain").remove();
      svg.selectAll(".x-axis .tick line").remove();
      svg.selectAll(".y-axis .tick line:first-child").remove();
      svg.selectAll("text").style("font-size", "12px");
    }
  }, [
    weightData,
    weightTimeBTN,
    timeSelection,
    userProfile,
    defaultConvertWeight,
    weightForcast,
    timeMultipliers,
  ]);

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
            sets: exercise.sets,
            weight: exercise.weight,
            tracked: exercise.tracked,
            bw: exercise.bw,
            notes: exercise.notes,
            sortOrder: sortOrder[index],
          });
        })
      ).catch((error) => {
        console.log(error);
      });

      // Sets the selected exercise to reflect the new order if the exercises is updated after sorting
      setSelectedExercise(sortableList[destinationIndex]);
    } else if (listType === "trackedExercises") {
      Promise.all(
        sortableList.map((exercise, index) => {
          return Axios.put(
            `${apiURL}/update/tracked-exercise-order/${exercise.id}`,
            {
              name: exercise.name,
              sortOrder: sortOrder[index],
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
      <div className="weight container">
        <div className="dashboard flex title">
          <h2>Body Weight</h2>
          <h1
            id="plus"
            onClick={() => {
              toggleModal("weight", true);
            }}
          >
            +
          </h1>
        </div>
        {weightData.length > 0 ? (
          <div className="flex weight-graph-container">
            <div id="graph-container">
              <div>
                <div className="time-selection-container">
                  <select
                    id="time-selection"
                    name="timeSelection"
                    value={timeSelection}
                    onChange={(e) => {
                      setTimeSelection(e.target.value);
                    }}
                  >
                    <option value="1 month">1 month</option>
                    {weightTimeBTN >= 5184000000 ? (
                      <option value="2 months">2 months</option>
                    ) : (
                      ""
                    )}
                    {weightTimeBTN >= 7776000000 ? (
                      <option value="3 months">3 months</option>
                    ) : (
                      ""
                    )}
                    {weightTimeBTN >= 15552000000 ? (
                      <option value="6 months">6 months</option>
                    ) : (
                      ""
                    )}
                    {weightTimeBTN >= 31104000000 ? (
                      <option value="1 year">1 year</option>
                    ) : (
                      ""
                    )}
                    {weightTimeBTN >= 3110400000 ? (
                      <option value="All">All</option>
                    ) : (
                      ""
                    )}
                  </select>
                </div>

                <div className="weight-change-container">
                  <div className="weight-change dashboard flex">
                    <div>
                      <p>
                        {weightData[0].weight}{" "}
                        {userProfile &&
                        userProfile.measurement_type !== "metric"
                          ? "lbs"
                          : "kgs"}
                      </p>
                      <p id="weight-change">Start</p>
                    </div>
                    <div>
                      <p>
                        {weightData[weightData.length - 1].weight}{" "}
                        {userProfile &&
                        userProfile.measurement_type !== "metric"
                          ? "lbs"
                          : "kgs"}
                      </p>
                      <p id="weight-change">Now</p>
                    </div>
                    <div>
                      <div className="flex">
                        {weightData[weightData.length - 1].weight -
                          weightData[0].weight >
                        0 ? (
                          <p id="positive">&#8657;</p>
                        ) : weightData[weightData.length - 1].weight -
                            weightData[0].weight <
                          0 ? (
                          <p id="negative">&#8659;</p>
                        ) : (
                          ""
                        )}
                        <p>
                          {Math.abs(
                            weightData[weightData.length - 1].weight -
                              weightData[0].weight
                          ).toFixed(1)}{" "}
                          {userProfile &&
                          userProfile.measurement_type !== "metric"
                            ? "lbs"
                            : "kgs"}
                        </p>
                      </div>
                      <p id="weight-change">Change</p>
                    </div>
                  </div>
                </div>
                <div className="weightGraph"></div>
              </div>
            </div>
            <div className="weight-list">
              <ul>
                {weightData
                  .slice()
                  .reverse()
                  .map((val) => {
                    if (val.weight) {
                      return (
                        <div
                          className="dashboard flex"
                          key={`${val.weight} | ${val.date}`}
                        >
                          {userProfile &&
                          userProfile.measurement_type !== "metric" ? (
                            <li>{val.weight} lbs</li>
                          ) : (
                            <li>{val.weight} kgs</li>
                          )}
                          <li id="dates">
                            {parseInt(val.date.slice(5, 7))}/
                            {parseInt(val.date.slice(8, 10))}/
                            {val.date.slice(2, 4)}
                          </li>
                        </div>
                      );
                    }
                    return null;
                  })}
              </ul>
            </div>
          </div>
        ) : (
          ""
        )}
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
        <ul className="unordered-list">
          {routines.map((routine) => {
            const isMenuOpen = openMenus[routine.id] || false;
            const exerciseList = routineExercises[routine.id] || [];

            return (
              <li key={`${routine.name}-routine`}>
                <div className="dashboard flex list-title-card">
                  <div
                    className="flex workout-list-clickable"
                    onClick={() => {
                      toggleMenu(routine.id);
                    }}
                  >
                    <h3>{routine.name}</h3>
                    {isMenuOpen ? (
                      <img
                        src={process.env.PUBLIC_URL + "/up-arrow.png"}
                        className="up-arrow"
                        alt="click to collapse drop down menu"
                      />
                    ) : (
                      <img
                        src={process.env.PUBLIC_URL + "/down-arrow.png"}
                        className="down-arrow"
                        alt="click for drop down menu"
                      />
                    )}
                  </div>
                  <div className="flex">
                    <img
                      className="img edit"
                      src={process.env.PUBLIC_URL + "/edit.png"}
                      onClick={() => {
                        setSelectedRoutine(routine);
                        toggleModal("updateRoutine", true);
                      }}
                      alt="edit"
                    />
                    <img
                      className="img delete"
                      src={process.env.PUBLIC_URL + "/delete.png"}
                      onClick={() => {
                        setSelectedRoutine(routine);
                        toggleModal("deleteRoutine", true);
                      }}
                      alt="delete"
                    />
                  </div>
                </div>
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <DragDropContext
                      onDragEnd={(result) =>
                        handleOnDragEnd(
                          result,
                          exerciseList,
                          "routineExercises"
                        )
                      }
                    >
                      <Droppable droppableId="exercises">
                        {(provided) => (
                          <ul
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {exerciseList.map((exercise, index) => (
                              <Draggable
                                key={exercise.id}
                                draggableId={`exercise-id-${exercise.id}`}
                                index={index}
                              >
                                {(provided) => {
                                  return (
                                    <li
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="dashboard flex"
                                      style={{
                                        ...provided.draggableProps.style,
                                        cursor: "default",
                                      }}
                                    >
                                      <div className="exercise-container">
                                        {exercise.name} | {exercise.sets} x{" "}
                                        {exercise.reps_low}
                                        {exercise.reps_high
                                          ? `-${exercise.reps_high}`
                                          : ""}
                                        {exercise.weight &&
                                        userProfile &&
                                        userProfile.measurement_type ===
                                          "imperial"
                                          ? ` | ${exercise.weight} lbs`
                                          : exercise.weight &&
                                            userProfile &&
                                            userProfile.measurement_type ===
                                              "metric"
                                          ? ` | ${defaultConvertWeight(
                                              exercise.weight
                                            )} kgs`
                                          : ""}
                                        {exercise.notes && (
                                          <img
                                            className="img notes"
                                            src={
                                              process.env.PUBLIC_URL +
                                              "/notepad.png"
                                            }
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
                                          src={
                                            process.env.PUBLIC_URL + "/edit.png"
                                          }
                                          onClick={() => {
                                            setSelectedRoutine(routine);
                                            setSelectedExercise(exercise);
                                            toggleModal("updateExercise", true);
                                          }}
                                          alt="edit"
                                        />
                                        <img
                                          className="img x"
                                          src={
                                            process.env.PUBLIC_URL + "/x.png"
                                          }
                                          onClick={() => {
                                            setSelectedRoutine(routine);
                                            setSelectedExercise(exercise);
                                            toggleModal("deleteExercise", true);
                                          }}
                                          alt="delete"
                                        />
                                        <img
                                          {...provided.dragHandleProps}
                                          className="img sort"
                                          src={
                                            process.env.PUBLIC_URL +
                                            "/sort-list.png"
                                          }
                                          onClick={() => {
                                            setSelectedRoutine(routine);
                                            setSelectedExercise(exercise);
                                          }}
                                          alt="sort"
                                        />
                                      </div>
                                    </li>
                                  );
                                }}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <div className="plus-container">
                      <h1
                        id="list-plus"
                        onClick={() => {
                          setSelectedRoutine(routine);
                          toggleModal("exercise", true);
                        }}
                      >
                        +
                      </h1>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <button
          id="link"
          className="need-help"
          onClick={() => toggleModal("starterRoutines", true)}
        >
          Need help?
        </button>
      </div>
      <div className="tracked container">
        <div className="dashboard flex title tooltip-container">
          <h2>Exercise Progress</h2>
          <img
            className="tooltip-png"
            src={process.env.PUBLIC_URL + "/tooltip.png"}
            onMouseOver={() => {
              setShowInfo("track progress");
            }}
            onMouseOut={() => {
              setShowInfo("");
            }}
            alt="tooltip"
          />
          {showInfo === "track progress" && (
            <div className="tooltip">
              <p>
                When you create {"("}
                <span className="bold">+</span>
                {")"} or update {"("}
                <img
                  id="edit"
                  alt="edit"
                  src={process.env.PUBLIC_URL + "/edit.png"}
                />
                {")"} an exercise in a workout routine with 'Track Progress?'
                selected, a new entry will be added below to a list with the{" "}
                <span className="bold">SAME NAME</span> as the exercise.
              </p>
            </div>
          )}
        </div>
        <DragDropContext
          onDragEnd={(result) =>
            handleOnDragEnd(
              result,
              trackedExercises.sortOrder,
              "trackedExercises"
            )
          }
        >
          <Droppable droppableId="trackedExercises">
            {(provided) => (
              <ul
                className="unordered-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {trackedExercises.sortOrder
                  ? trackedExercises.sortOrder.map((exercise, index) => (
                      <Draggable
                        key={exercise.name}
                        draggableId={exercise.name || "unnamed"}
                        index={index}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              cursor: "default",
                            }}
                          >
                            <div className="dashboard flex list-title-card">
                              <div
                                className="flex tracked-clickable"
                                onClick={() => {
                                  toggleTrackedMenu(exercise.name);
                                }}
                              >
                                <h3>{exercise.name}</h3>
                                {openMenus[exercise.name] ? (
                                  <img
                                    src={
                                      process.env.PUBLIC_URL + "/up-arrow.png"
                                    }
                                    className="up-arrow"
                                    alt="click to collapse drop down menu"
                                  />
                                ) : (
                                  <img
                                    src={
                                      process.env.PUBLIC_URL + "/down-arrow.png"
                                    }
                                    className="down-arrow"
                                    alt="click for drop down menu"
                                  />
                                )}
                              </div>
                              <div className="flex">
                                {trackedExercises[exercise.name] &&
                                trackedExercises[exercise.name].find(
                                  (exercise) => exercise.weight
                                ) ? (
                                  <img
                                    alt="exercise statistics"
                                    className="img stats"
                                    src={
                                      process.env.PUBLIC_URL + "/linegraph.png"
                                    }
                                    onClick={() => {
                                      setSelectedExercise(
                                        trackedExercises[exercise.name]
                                      );
                                      setFirstExercise(
                                        trackedExercises[exercise.name].find(
                                          (entry) => entry.weight > 0
                                        )
                                      );
                                      toggleModal("exerciseStatistics", true);
                                    }}
                                  />
                                ) : null}
                                <img
                                  src={process.env.PUBLIC_URL + "/edit.png"}
                                  className="img edit"
                                  alt="edit name"
                                  onClick={() => {
                                    setSelectedExercise(
                                      trackedExercises[exercise.name][0].name
                                    );
                                    toggleModal(
                                      "updateTrackedExerciseName",
                                      true
                                    );
                                  }}
                                />
                                <img
                                  {...provided.dragHandleProps}
                                  className="img sort"
                                  src={
                                    process.env.PUBLIC_URL + "/sort-list.png"
                                  }
                                  alt="sort"
                                />
                              </div>
                            </div>
                            {openMenus[exercise.name] && (
                              <div className="tracked-dropdown dropdown-menu">
                                <ul>
                                  {trackedExercises[exercise.name]
                                    .slice()
                                    .reverse()
                                    .map((exercise) => (
                                      <li key={exercise.id}>
                                        <div className="dashboard flex">
                                          <div className="exercise-container">
                                            {exercise.weight &&
                                            userProfile &&
                                            userProfile.measurement_type ===
                                              "imperial"
                                              ? `${exercise.weight} lbs | `
                                              : exercise.weight &&
                                                userProfile &&
                                                userProfile.measurement_type ===
                                                  "metric"
                                              ? `${defaultConvertWeight(
                                                  exercise.weight
                                                )} kgs | `
                                              : " "}
                                            {exercise.bw &&
                                            userProfile &&
                                            userProfile.weight
                                              ? `(${compareBW(
                                                  userProfile.weight,
                                                  exercise.weight
                                                )}xBW) | `
                                              : " "}
                                            {exercise.sets} x{" "}
                                            {exercise.reps_low}
                                            {exercise.reps_high
                                              ? `-${exercise.reps_high}`
                                              : ""}
                                          </div>
                                          <div>
                                            {`${new Date(
                                              exercise.date
                                            ).toLocaleDateString()}
                                        `}
                                            &nbsp;
                                            <img
                                              className="img x"
                                              src={
                                                process.env.PUBLIC_URL +
                                                "/x.png"
                                              }
                                              onClick={() => {
                                                setSelectedExercise(exercise);
                                                toggleModal(
                                                  "deleteTrackedExercise",
                                                  true
                                                );
                                              }}
                                              alt="delete"
                                            />
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        )}
                      </Draggable>
                    ))
                  : ""}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
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
          setUserProfile={setUserProfile}
          convertWeight={convertWeight}
          defaultConvertWeight={defaultConvertWeight}
          safeParseFloat={safeParseFloat}
          apiURL={apiURL}
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
          setShowInfo={setShowInfo}
          showInfo={showInfo}
          setTrackedExercises={setTrackedExercises}
          trackedExercises={trackedExercises}
          convertWeight={convertWeight}
          defaultConvertWeight={defaultConvertWeight}
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
          formattedDate={formattedDate}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
          setTrackedExercises={setTrackedExercises}
          trackedExercises={trackedExercises}
          convertWeight={convertWeight}
          defaultConvertWeight={defaultConvertWeight}
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
          selectedExercise={selectedExercise[selectedExercise.length - 1]}
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
    </div>
  );
};

export default Dashboard;
