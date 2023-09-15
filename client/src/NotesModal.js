import React from "react";

const NotesModal = (props) => {
  const { onClose, selectedExercise } = props;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex notes-flex">
          <div className="modal-body">
            <div className="notes-review">
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
