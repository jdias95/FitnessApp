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
                                src={process.env.PUBLIC_URL + "/sort-list.png"}
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
                                          {exercise.sets} x {exercise.reps_low}
                                          {exercise.reps_high
                                            ? `-${exercise.reps_high}`
                                            : ""}
                                        </div>
                                        <div>
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
