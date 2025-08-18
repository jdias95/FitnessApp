import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const RoutineWidget = (props) => {
  const {
    routines,
    openMenus,
    routineExercises,
    handleOnDragEnd,
    toggleMenu,
    toggleModal,
    setSelectedRoutine,
    setSelectedExercise,
    userProfile,
    defaultConvertWeight,
  } = props;

  return (
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
                      handleOnDragEnd(result, exerciseList, "routineExercises")
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
                                      {exercise.name} |{exercise.sets_low}
                                      {exercise.sets_high
                                        ? `-${exercise.sets_high}`
                                        : ""}
                                      &nbsp;x {exercise.reps_low}
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
                                        src={process.env.PUBLIC_URL + "/x.png"}
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
  );
};

export default RoutineWidget;
