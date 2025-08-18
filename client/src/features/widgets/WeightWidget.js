import React from "react";
import WeightGraph from "../weight/WeightGraph";

const WeightWidget = (props) => {
  const {
    weightData,
    userProfile,
    timeSelection,
    timeMultipliers,
    defaultConvertWeight,
    setTimeSelection,
    setWeightTimeBTN,
    weightTimeBTN,
    weightForcast,
    toggleModal,
    setSelectedWeight,
  } = props;

  return (
    <div className="weight container">
      <div className="dashboard flex title">
        <h2>Body Weight</h2>
        <h1
          id="plus"
          onClick={() => {
            toggleModal("weight", true);
          }}
        >
          +
        </h1>
      </div>
      {weightData.length > 0 ? (
        <div className="flex weight-graph-container">
          <div id="graph-container">
            <div>
              <div className="time-selection-container">
                <select
                  id="time-selection"
                  name="timeSelection"
                  value={timeSelection}
                  onChange={(e) => {
                    setTimeSelection(e.target.value);
                  }}
                >
                  <option value="1 month">1 month</option>
                  {weightTimeBTN >= 5184000000 ? (
                    <option value="2 months">2 months</option>
                  ) : (
                    ""
                  )}
                  {weightTimeBTN >= 7776000000 ? (
                    <option value="3 months">3 months</option>
                  ) : (
                    ""
                  )}
                  {weightTimeBTN >= 15552000000 ? (
                    <option value="6 months">6 months</option>
                  ) : (
                    ""
                  )}
                  {weightTimeBTN >= 31104000000 ? (
                    <option value="1 year">1 year</option>
                  ) : (
                    ""
                  )}
                  {weightTimeBTN >= 3110400000 ? (
                    <option value="All">All</option>
                  ) : (
                    ""
                  )}
                </select>
              </div>

              <div className="weight-change-container">
                <div className="weight-change dashboard flex">
                  <div>
                    <p>
                      {weightData[0].weight}{" "}
                      {userProfile && userProfile.measurement_type !== "metric"
                        ? "lbs"
                        : "kgs"}
                    </p>
                    <p id="weight-change">Start</p>
                  </div>
                  <div>
                    <p>
                      {weightData[weightData.length - 1].weight}{" "}
                      {userProfile && userProfile.measurement_type !== "metric"
                        ? "lbs"
                        : "kgs"}
                    </p>
                    <p id="weight-change">Now</p>
                  </div>
                  <div>
                    <div className="flex">
                      {weightData[weightData.length - 1].weight -
                        weightData[0].weight >
                      0 ? (
                        <p id="positive">&#8657;</p>
                      ) : weightData[weightData.length - 1].weight -
                          weightData[0].weight <
                        0 ? (
                        <p id="negative">&#8659;</p>
                      ) : (
                        ""
                      )}
                      <p>
                        {Math.abs(
                          weightData[weightData.length - 1].weight -
                            weightData[0].weight
                        ).toFixed(1)}{" "}
                        {userProfile &&
                        userProfile.measurement_type !== "metric"
                          ? "lbs"
                          : "kgs"}
                      </p>
                    </div>
                    <p id="weight-change">Change</p>
                  </div>
                </div>
              </div>
              <WeightGraph
                weightData={weightData}
                userProfile={userProfile}
                timeSelection={timeSelection}
                timeMultipliers={timeMultipliers}
                defaultConvertWeight={defaultConvertWeight}
                weightForcast={weightForcast}
                weightTimeBTN={weightTimeBTN}
                setWeightTimeBTN={setWeightTimeBTN}
              />
            </div>
          </div>
          <div className="weight-list">
            <ul>
              {weightData
                .slice()
                .reverse()
                .map((val) => {
                  if (val.weight) {
                    return (
                      <div
                        className="dashboard flex underline px-1"
                        key={`${val.weight} | ${val.date}`}
                      >
                        {userProfile &&
                        userProfile.measurement_type !== "metric" ? (
                          <li>{val.weight} lbs</li>
                        ) : (
                          <li>{val.weight} kgs</li>
                        )}
                        <div className="flex">
                          <li id="dates">
                            {parseInt(val.date.slice(5, 7))}/
                            {parseInt(val.date.slice(8, 10))}/
                            {val.date.slice(2, 4)}
                          </li>
                          <img
                            className="img x"
                            src={process.env.PUBLIC_URL + "/x.png"}
                            onClick={() => {
                              setSelectedWeight(val);
                              toggleModal("deleteWeight", true);
                            }}
                            alt="delete"
                          />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
            </ul>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default WeightWidget;
