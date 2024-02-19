import React, { useState } from "react";

const WalkthroughModal = (props) => {
  const { onClose } = props;
  const [pageNum, setPageNum] = useState(1);
  const pages = [1, 2, 3, 4];

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div className="position">
              <p>text</p>
              {pageNum > 1 ? (
                <img
                  className="page-left page-arrow"
                  src={process.env.PUBLIC_URL + "/page-left.png"}
                  onClick={() => setPageNum(pageNum - 1)}
                  alt="go back"
                />
              ) : null}
              {pageNum < pages[pages.length - 1] ? (
                <img
                  className="page-right page-arrow"
                  src={process.env.PUBLIC_URL + "/page-right.png"}
                  onClick={() => setPageNum(pageNum + 1)}
                  alt="go forward"
                />
              ) : null}
            </div>
            <div className="flex-center">
              {pages.map((page) => (
                <img
                  key={page}
                  className={page !== pageNum ? "img page" : "img"}
                  src={
                    page === pageNum
                      ? process.env.PUBLIC_URL + "/page-indicator-filled.png"
                      : process.env.PUBLIC_URL + "/page-indicator.png"
                  }
                  onClick={() => setPageNum(page)}
                  alt={
                    page === pageNum
                      ? `selected page: ${page}`
                      : `select page ${page}`
                  }
                />
              ))}
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

export default WalkthroughModal;
