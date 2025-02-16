import React, { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import moment from "moment";
import Modal from "../../components/Modal";

const StatisticsModal = (props) => {
  const {
    onClose,
    selectedExercise,
    selectedExerciseList,
    firstExercise,
    userProfile,
    defaultConvertWeight,
    setShowInfo,
    showInfo,
  } = props;

  const [exerciseTimeBTN, setExerciseTimeBTN] = useState(0);
  const [timeSelectionTracked, setTimeSelectionTracked] = useState("3 months");
  const [graphSelection, setGraphSelection] = useState("working weight");
  const timeMultipliers = useMemo(() => {
    return {
      "3 months": 18,
      "6 months": 36,
      "1 year": 72,
      All: Math.ceil(exerciseTimeBTN / 432000000),
    };
  }, [exerciseTimeBTN]);

  const calcVolume = (weight, sets, reps) => {
    const volume = weight * sets * reps;
    return Number(volume.toFixed(1));
  };

  const workingWeightDifference = firstExercise
    ? selectedExercise.weight - firstExercise.weight
    : 0;

  const volume = selectedExercise.reps_high
    ? Number(
        (
          (calcVolume(
            selectedExercise.weight,
            selectedExercise.sets,
            selectedExercise.reps_low
          ) +
            calcVolume(
              selectedExercise.weight,
              selectedExercise.sets,
              selectedExercise.reps_high
            )) /
          2
        ).toFixed(1)
      )
    : calcVolume(
        selectedExercise.weight,
        selectedExercise.sets,
        selectedExercise.reps_low
      );

  const firstVolume =
    firstExercise && firstExercise.reps_high
      ? Number(
          (
            (calcVolume(
              firstExercise.weight,
              firstExercise.sets,
              firstExercise.reps_low
            ) +
              calcVolume(
                firstExercise.weight,
                firstExercise.sets,
                firstExercise.reps_high
              )) /
            2
          ).toFixed(1)
        )
      : firstExercise
      ? calcVolume(
          firstExercise.weight,
          firstExercise.sets,
          firstExercise.reps_low
        )
      : 0;

  const volumeDifference = volume - firstVolume;

  const renderPercentageDifference = (difference, first) => {
    const percentage = Number(Math.abs((difference / first) * 100).toFixed(1));

    if (difference > 0) {
      return (
        <p>
          &nbsp;(<span id="positive">&#8657;</span>
          {percentage}%)
        </p>
      );
    } else if (difference < 0) {
      return (
        <p>
          &nbsp;(<span id="negative">&#8659;</span>
          {percentage}%)
        </p>
      );
    } else {
      return null;
    }
  };

  useEffect(() => {
    d3.select(".exerciseGraph svg").remove();

    const filteredExercises = selectedExerciseList.filter(
      (exercise) => exercise.weight
    );

    const metricFilteredExercises = filteredExercises.map((exercise) => {
      return { ...exercise, weight: defaultConvertWeight(exercise.weight) };
    });

    const exerciseVolumes = filteredExercises.map((exercise) => {
      return {
        ...exercise,
        weight:
          exercise.reps_high &&
          userProfile &&
          userProfile.measurement_type !== "metric"
            ? Number(
                (
                  (calcVolume(
                    exercise.weight,
                    exercise.sets,
                    exercise.reps_low
                  ) +
                    calcVolume(
                      exercise.weight,
                      exercise.sets,
                      exercise.reps_high
                    )) /
                  2
                ).toFixed(1)
              )
            : userProfile && userProfile.measurement_type !== "metric"
            ? calcVolume(exercise.weight, exercise.sets, exercise.reps_low)
            : exercise.reps_high
            ? defaultConvertWeight(
                Number(
                  (
                    (calcVolume(
                      exercise.weight,
                      exercise.sets,
                      exercise.reps_low
                    ) +
                      calcVolume(
                        exercise.weight,
                        exercise.sets,
                        exercise.reps_high
                      )) /
                    2
                  ).toFixed(1)
                )
              )
            : defaultConvertWeight(
                calcVolume(exercise.weight, exercise.sets, exercise.reps_low)
              ),
      };
    });

    const weightValues = filteredExercises
      .filter((d) => d.weight != null)
      .map((d) => d.weight);

    const volumeWeightValues = exerciseVolumes
      .filter((d) => d.weight != null)
      .map((d) => d.weight);

    const dateValues = filteredExercises
      .filter((d) => d.weight != null)
      .map((d) => d.date);

    setExerciseTimeBTN(
      new Date(dateValues[dateValues.length - 1]).getTime() -
        new Date(dateValues[0]).getTime()
    );

    const graphWidth = 400;
    const graphHeight = 300;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 20;
    const marginLeft = 45;

    const minValue = d3.min(weightValues);
    const maxValue = d3.max(weightValues);
    const meanValue = d3.mean(weightValues);
    const padding = meanValue * 0.025;

    const volumeMinValue = d3.min(volumeWeightValues);
    const volumeMaxValue = d3.max(volumeWeightValues);
    const volumeMeanValue = d3.mean(volumeWeightValues);
    const volumePadding = volumeMeanValue * 0.025;

    const yScale = d3
      .scaleLinear()
      .domain([
        userProfile &&
        userProfile.measurement_type !== "metric" &&
        graphSelection === "working weight"
          ? minValue - padding
          : graphSelection === "working weight"
          ? defaultConvertWeight(minValue - padding)
          : volumeMinValue - volumePadding,
        userProfile &&
        userProfile.measurement_type !== "metric" &&
        graphSelection === "working weight"
          ? maxValue + padding
          : graphSelection === "working weight"
          ? defaultConvertWeight(maxValue + padding)
          : volumeMaxValue + volumePadding,
      ])
      .nice()
      .range([graphHeight - marginBottom, marginTop]);

    const svg = d3
      .select(".exerciseGraph")
      .append("svg")
      .attr("width", "100%")
      .attr("height", graphHeight)
      .attr("viewBox", `0 0 ${graphWidth} ${graphHeight}`);

    const tickValues = [];
    const enddDate = moment(selectedExercise.date, "YYYY-MM-DD");

    for (let i = 0; i < 6; i++) {
      const date = moment(enddDate).subtract(
        timeMultipliers[timeSelectionTracked] * i,
        "days"
      );
      tickValues.push(date.toDate());
    }

    const xScale = d3
      .scaleTime()
      .domain([
        new Date(tickValues[tickValues.length - 1]),
        new Date(tickValues[0]),
      ])
      .range([marginLeft, graphWidth - marginRight]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat((date) => {
        return date.toLocaleDateString().slice(0, -5);
      });

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${graphHeight - marginBottom})`)
      .call(xAxis);

    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip-path2")
      .append("rect")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .attr("width", graphWidth)
      .attr("height", graphHeight);

    svg
      .append("g")
      .append("path")
      .datum(
        userProfile &&
          userProfile.measurement_type !== "metric" &&
          graphSelection === "working weight"
          ? filteredExercises
          : graphSelection === "working weight"
          ? metricFilteredExercises
          : exerciseVolumes
      )
      .attr("fill", "none")
      .attr("stroke", "#ACEDFF")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("clip-path", "url(#clip-path2)")
      .attr(
        "d",
        d3
          .line()
          .x((exercise) => xScale(new Date(exercise.date)))
          .y((exercise) => yScale(exercise.weight))
      );

    const yAxisGroup = svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(yScale));

    yAxisGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "end")
      .text("Y-Axis Label");

    yAxisGroup
      .selectAll("g.tick")
      .append("line")
      .attr("class", "gridline")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", graphWidth - marginRight - marginLeft + 3)
      .attr("y2", 0)
      .attr("stroke", "rgba(156, 165, 174, .4");

    svg.selectAll(".domain").remove();
    svg.selectAll(".x-axis .tick line").remove();
    svg.selectAll(".y-axis .tick line:first-child").remove();
    svg.selectAll("text").style("font-size", "12px");
  }, [
    selectedExerciseList,
    userProfile,
    graphSelection,
    defaultConvertWeight,
    selectedExercise.date,
    timeMultipliers,
    timeSelectionTracked,
  ]);

  return (
    <Modal
      isOpen={true}
      hasHeader={true}
      header={selectedExercise.name}
      onClose={onClose}
      hasConfirm={false}
      isLarge={true}
    >
      <div className="flex space-between">
        <div>
          <div className="flex shift-left">
            <div className="tooltip-container">
              <img
                className="tooltip-png2"
                src={process.env.PUBLIC_URL + "/tooltip.png"}
                onMouseOver={() => {
                  setShowInfo("working weight");
                }}
                onMouseOut={() => {
                  setShowInfo("");
                }}
                alt="tooltip"
              />
            </div>
            {showInfo === "working weight" && (
              <div className="tooltip tooltip-exercise" id="working-weight">
                <p>
                  Working weight is the amount of weight lifted for a specific
                  exercise during a workout routine.
                </p>
              </div>
            )}
            <div
              className={
                selectedExerciseList.length > 1
                  ? "flex exercise-graph-selector"
                  : "flex"
              }
              id={
                graphSelection === "working weight" &&
                selectedExerciseList.length > 1
                  ? "exercise-graph-selector-clicked"
                  : ""
              }
              onClick={() => {
                setGraphSelection("working weight");
              }}
            >
              <p>Working Weight:&nbsp;</p>
              {userProfile.measurement_type !== "metric" ? (
                <p>{selectedExercise.weight} lbs</p>
              ) : (
                <p>{defaultConvertWeight(selectedExercise.weight)} kgs</p>
              )}
              <div className="flex">
                {renderPercentageDifference(
                  workingWeightDifference,
                  firstExercise.weight
                )}
              </div>
            </div>
            {graphSelection === "working weight" &&
            selectedExerciseList.length > 1 ? (
              <img
                className="selected-graph"
                alt="selected graph"
                src={process.env.PUBLIC_URL + "/graph-indication.png"}
              />
            ) : null}
          </div>
          <div className="flex shift-left">
            <div className="tooltip-container">
              <img
                className="tooltip-png2"
                src={process.env.PUBLIC_URL + "/tooltip.png"}
                onMouseOver={() => {
                  setShowInfo("volume");
                }}
                onMouseOut={() => {
                  setShowInfo("");
                }}
                alt="tooltip"
              />
            </div>
            {showInfo === "volume" && (
              <div className="tooltip tooltip-exercise" id="volume">
                <p>
                  Volume refers to the total amount of work performed in a
                  workout. It is calculated by multiplying the number of sets,
                  repetitions, and weight lifted for an exercise in a routine.
                </p>
              </div>
            )}
            <div
              className={
                selectedExerciseList.length > 1
                  ? "flex exercise-graph-selector"
                  : "flex"
              }
              id={
                graphSelection === "volume" && selectedExerciseList.length > 1
                  ? "exercise-graph-selector-clicked"
                  : ""
              }
              onClick={() => {
                setGraphSelection("volume");
              }}
            >
              <p>Volume:&nbsp;</p>
              {userProfile.measurement_type !== "metric" ? (
                <p>
                  {calcVolume(
                    selectedExercise.weight,
                    selectedExercise.sets,
                    selectedExercise.reps_low
                  )}
                  {selectedExercise.reps_high
                    ? `-${calcVolume(
                        selectedExercise.weight,
                        selectedExercise.sets,
                        selectedExercise.reps_high
                      )}`
                    : ""}
                  {" lbs "}
                </p>
              ) : (
                <p>
                  {defaultConvertWeight(
                    calcVolume(
                      selectedExercise.weight,
                      selectedExercise.sets,
                      selectedExercise.reps_low
                    )
                  )}
                  {selectedExercise.reps_high
                    ? `-${defaultConvertWeight(
                        calcVolume(
                          selectedExercise.weight,
                          selectedExercise.sets,
                          selectedExercise.reps_high
                        )
                      )}`
                    : ""}
                  {" kgs "}
                </p>
              )}
              {firstVolume ? (
                <div className="flex">
                  {renderPercentageDifference(volumeDifference, firstVolume)}
                </div>
              ) : (
                ""
              )}
            </div>
            {graphSelection === "volume" && selectedExerciseList.length > 1 ? (
              <img
                className="selected-graph"
                alt="selected graph"
                src={process.env.PUBLIC_URL + "/graph-indication.png"}
              />
            ) : null}
          </div>
        </div>
      </div>
      {selectedExerciseList.length > 1 ? (
        <div>
          <div className="flex-center">
            {selectedExerciseList.length > 1 ? (
              <select
                id="time-selection-tracked"
                name="timeSelectionTracked"
                value={timeSelectionTracked}
                onChange={(e) => {
                  setTimeSelectionTracked(e.target.value);
                }}
              >
                <option value="3 months">3 months</option>
                {exerciseTimeBTN >= 15552000000 ? (
                  <option value="6 months">6 months</option>
                ) : (
                  ""
                )}
                {exerciseTimeBTN >= 31104000000 ? (
                  <option value="1 year">1 year</option>
                ) : (
                  ""
                )}
                {exerciseTimeBTN >= 8294400000 ? (
                  <option value="All">All</option>
                ) : (
                  ""
                )}
              </select>
            ) : (
              ""
            )}
          </div>
          <div className="exerciseGraph"></div>
        </div>
      ) : (
        ""
      )}
    </Modal>
  );
};

export default StatisticsModal;
