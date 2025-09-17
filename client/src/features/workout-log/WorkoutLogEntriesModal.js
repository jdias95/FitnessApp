import React from "react";
import Modal from "../../components/Modal";

const WorkoutLogEntriesModal = (props) => {
  const {
    onClose,
    userProfile,
    selectedExercise,
    defaultConvertWeight,
    formatDate,
  } = props;

  return (
    <Modal
      isOpen={true}
      hasHeader={false}
      onClose={onClose}
      isLarge={true}
      hasConfirm={false}
    >
      <div>
        <h2>
          {selectedExercise?.exercise_name} Sets for{" "}
          {formatDate(selectedExercise?.date)}
        </h2>
        <ul className="workout-log-entries-list">
          {selectedExercise?.sets?.map((entry) => (
            <li key={`${entry.id}-${Math.random()}`} className="flex">
              {userProfile.measurement_type !== "metric" ? (
                <p>
                  {entry.reps} reps | {entry.weight} lbs
                </p>
              ) : (
                <p>
                  {entry.reps} reps | {defaultConvertWeight(entry.weight)} kgs
                </p>
              )}
              {entry.notes && <p className="pl-3">Notes: {entry.notes}</p>}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default WorkoutLogEntriesModal;
