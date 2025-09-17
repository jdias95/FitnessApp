import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const TrackedExerciseWidget = (props) => {
  const {
    trackedExercises,
    openMenus,
    handleOnDragEnd,
    toggleTrackedMenu,
    setSelectedExercise,
    toggleModal,
    setShowInfo,
    showInfo,
    userProfile,
    defaultConvertWeight,
    compareBW,
    setFirstExercise,
  } = props;

  return (
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
              When you add an exercise to a workout log with 'Track Progress?'
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
                      key={exercise.exercise_name}
                      draggableId={exercise.exercise_name || "unnamed"}
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
                                toggleTrackedMenu(exercise.exercise_name);
                              }}
                            >
                              <h3>{exercise.exercise_name}</h3>
                              {openMenus[exercise.exercise_name] ? (
                                <img
                                  src={process.env.PUBLIC_URL + "/up-arrow.png"}
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
                              {trackedExercises[exercise.exercise_name] ? (
                                <img
                                  alt="exercise statistics"
                                  className="img stats"
                                  src={
                                    process.env.PUBLIC_URL + "/linegraph.png"
                                  }
                                  onClick={() => {
                                    setSelectedExercise(
                                      trackedExercises[exercise.exercise_name]
                                    );
                                    setFirstExercise(
                                      trackedExercises[
                                        exercise.exercise_name
                                      ].find(
                                        (entry) => entry.working_weight > 0
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
                                    trackedExercises[exercise.exercise_name][0]
                                      .exercise_name
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
                                src={process.env.PUBLIC_URL + "/sort-list.png"}
                                alt="sort"
                              />
                            </div>
                          </div>
                          {openMenus[exercise.exercise_name] && (
                            <div className="tracked-dropdown dropdown-menu">
                              <ul>
                                {trackedExercises[exercise.exercise_name]
                                  .slice()
                                  .reverse()
                                  .map((exercise) => (
                                    <li key={exercise.id}>
                                      <div className="dashboard flex">
                                        <div className="exercise-container">
                                          {exercise.working_weight &&
                                          userProfile?.measurement_type ===
                                            "imperial"
                                            ? `${exercise.working_weight} lbs | `
                                            : exercise.working_weight &&
                                              userProfile?.measurement_type ===
                                                "metric"
                                            ? `${defaultConvertWeight(
                                                exercise.working_weight
                                              )} kgs | `
                                            : " "}
                                          {exercise.bw && userProfile?.weight
                                            ? `(${compareBW(
                                                userProfile.weight,
                                                exercise.working_weight
                                              )}xBW) | `
                                            : " "}
                                          {exercise.working_set_count} x{" "}
                                          {exercise.reps_low}
                                          {exercise.reps_high
                                            ? `-${exercise.reps_high}`
                                            : ""}
                                        </div>
                                        <div>
                                          <img
                                            className="img log-entries"
                                            src={
                                              process.env.PUBLIC_URL +
                                              "/log-entries.png"
                                            }
                                            alt="workout log entries"
                                            onClick={() => {
                                              setSelectedExercise(exercise);
                                              toggleModal(
                                                "workoutLogEntries",
                                                true
                                              );
                                            }}
                                          />
                                          {new Date(
                                            exercise.date
                                          ).toLocaleDateString()}
                                          <img
                                            className="img x"
                                            src={
                                              process.env.PUBLIC_URL + "/x.png"
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
  );
};

export default TrackedExerciseWidget;
