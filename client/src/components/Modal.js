import React from "react";

const Modal = ({
  isOpen,
  onConfirm,
  onClose,
  children,
  hasHeader,
  header,
  isLarge,
  hasConfirm = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        {hasHeader ? (
          <div className="modal-header">
            <h1>{header}</h1>
          </div>
        ) : (
          ""
        )}
        {isLarge ? (
          <div className="modal-flex">
            <div className="exercise-modal-body">
              <div>{children}</div>
              <div className="flex-end">
                <span className="modal-button-container">
                  {hasConfirm ? (
                    <button className="modal-button" onClick={onConfirm}>
                      Confirm
                    </button>
                  ) : (
                    ""
                  )}
                  <button className="modal-button" onClick={onClose}>
                    Cancel
                  </button>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex space-between">
            <div className="modal-body">{children}</div>
            <span className="modal-button-container mr-1">
              {hasConfirm ? (
                <button className="modal-button" onClick={onConfirm}>
                  Confirm
                </button>
              ) : (
                ""
              )}
              <button className="modal-button" onClick={onClose}>
                Cancel
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
