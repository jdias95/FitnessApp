import React from "react";

const InstructionsModal = (props) => {
  const { onClose } = props;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div>
              <p>
                When you create {"("}
                <span className="bold">+</span>
                {")"} or update {"("}
                <img
                  className="edit"
                  alt="edit"
                  src={process.env.PUBLIC_URL + "/edit.png"}
                />
                {")"} an exercise in 'Workout Routines' and select 'Track
                Progress,' it will be added to a 'Track Progress' list of the{" "}
                <span className="bold">same name</span>.
              </p>
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

export default InstructionsModal;
