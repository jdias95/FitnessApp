import React from "react";

const NotesModal = (props) => {
  const { onClose, selectedExercise } = props;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div>
              <p>{selectedExercise.notes}</p>
            </div>
            <div>
              <span className="modal-button-container">
                <button className="modal-button" onClick={onClose}>
                  Close
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
