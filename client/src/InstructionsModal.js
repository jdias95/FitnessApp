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
                  id="edit"
                  alt="edit"
                  src={process.env.PUBLIC_URL + "/edit.png"}
                />
                {")"} an exercise in a workout routine with 'Track Progress?'
                selected, a new entry will be added below to a list of the{" "}
                <span className="bold">SAME NAME</span>.
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
