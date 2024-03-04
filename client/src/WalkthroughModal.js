import React, { useState } from "react";

const WalkthroughModal = (props) => {
  const { onClose } = props;
  const [pageNum, setPageNum] = useState(1);
  const pages = [1, 2, 3, 4];

  return (
    <div className="modal">
      <div className="modal-content" id="walkthrough">
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div className="position">
              <div className="walkthrough-content">
                {pageNum === 1 ? (
                  <div>
                    <p>
                      <strong>Welcome to WeGoJim!!!</strong>
                      <br />
                      <br />
                      If you are someone who sets fitness goals and is
                      interested in tracking your progress, then this app is
                      designed just for you. With WeGoJim, you can easily:
                      <br />
                      <br />
                    </p>
                    <ul id="walkthrough-list">
                      <li>Estimate your daily calorie expenditure/budget</li>
                      <li>Set weight goals and track weight change</li>
                      <li>Manage workout routines</li>
                      <li>Track specific exercise progress</li>
                    </ul>
                    <p>
                      <br />
                      Upon registering and logging in for the first time, you'll
                      be directed to the profile page. Here, you can input your
                      information and goals to set your initial weight and
                      estimate your daily calorie expenditure/budget.
                    </p>
                  </div>
                ) : pageNum === 2 ? (
                  <p>
                    <br />
                    <br />
                    When you navigate to the dashboard, you'll discover the main
                    features of the app. The first of these is dedicated to
                    tracking your weight. In this section, you can input new
                    weight values as frequently as you'd like. Updating your
                    weight will not only reflect changes here, but will also
                    impact your profile's estimated calorie budget and
                    expenditure.
                    <br />
                    <br />
                    The graph in this section visually represents how your
                    weight has changed over time, providing a clear
                    visualization of your progress. If you've set a target
                    weight and weekly goal in your profile, you'll also receive
                    an estimate of the time you can expect it to take to reach
                    your goal.
                  </p>
                ) : pageNum === 3 ? (
                  <p>
                    <br />
                    <br />
                    The next section is where you can efficiently manage your
                    workout routines. To create a new routine, simply click the{" "}
                    <strong>+</strong> button. Your routine names can be
                    whatever you like. After confirming, you can add new
                    exercises by opening the drop-down menu and clicking the{" "}
                    <strong>+</strong> button.
                    <br />
                    <br />
                    Each exercise in your routine can be updated (
                    <img
                      id="edit"
                      alt="edit"
                      src={process.env.PUBLIC_URL + "/edit.png"}
                    />
                    ), deleted (
                    <img
                      id="edit"
                      alt="delete"
                      src={process.env.PUBLIC_URL + "/x.png"}
                    />
                    ), or rearranged (
                    <img
                      id="edit"
                      alt="sort"
                      src={process.env.PUBLIC_URL + "/sort-list.png"}
                    />
                    ) based on your preferences. When creating (
                    <strong>+</strong>) or updating (
                    <img
                      id="edit"
                      alt="edit"
                      src={process.env.PUBLIC_URL + "/edit.png"}
                    />
                    ) an exercise, the 'Track Progress?' option enables you to
                    monitor your exercise progress over time. This information
                    will be easily accessible under the 'Track Progress'
                    section.
                  </p>
                ) : pageNum === 4 ? (
                  <p>
                    <br />
                    <br />
                    The final section is your dedicated space for monitoring the
                    progress of specific exercises. When you create (
                    <strong>+</strong>) or update (
                    <img
                      id="edit"
                      alt="edit"
                      src={process.env.PUBLIC_URL + "/edit.png"}
                    />
                    ) an exercise within any workout routine, a single entry
                    will appear in a list named after the exercise. Clicking the{" "}
                    <img
                      id="edit"
                      alt="graph"
                      src={process.env.PUBLIC_URL + "/linegraph.png"}
                    />{" "}
                    icon will reveal your progress in both working weight and
                    volume (sets x reps x weight). This insight can assist you
                    in evaluating the effectiveness of your routines and guide
                    any necessary adjustments. These lists can be sorted (
                    <img
                      id="edit"
                      alt="sort"
                      src={process.env.PUBLIC_URL + "/sort-list.png"}
                    />
                    ) and the names can be editted (
                    <img
                      id="edit"
                      alt="edit"
                      src={process.env.PUBLIC_URL + "/edit.png"}
                    />
                    ) for your convenience. Be aware that if you name a list to
                    be the same as another, the two lists will merge.{" "}
                    <strong>THIS CANNOT BE UNDONE.</strong>
                  </p>
                ) : null}
              </div>
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
