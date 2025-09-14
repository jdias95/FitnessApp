import React, { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import moment from "moment";
import Modal from "../../components/Modal";
import TooltipInput from "../help/TooltipInput";

const StatisticsModal = (props) => {
  const {
    onClose,
    lastExercise,
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

  const workingWeightDifference =
    firstExercise && lastExercise
      ? lastExercise.working_weight - firstExercise.working_weight
      : 0;

  const volumeDifference =
    firstExercise && lastExercise
      ? lastExercise.volume - firstExercise.volume
      : 0;

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

    const graphData = selectedExerciseList
      .filter((exercise) => exercise.working_weight)
      .map((exercise) => {
        const weight =
          graphSelection === "working weight"
            ? exercise.working_weight
            : exercise.volume;

        return {
          ...exercise,
          value:
            userProfile?.measurement_type === "metric"
              ? defaultConvertWeight(weight)
              : weight,
        };
      });

    const weightValues = graphData.map((d) => d.value);

    const dateValues = graphData.map((d) => d.date);

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

    const yScale = d3
      .scaleLinear()
      .domain([minValue - padding, maxValue + padding])
      .nice()
      .range([graphHeight - marginBottom, marginTop]);

    const svg = d3
      .select(".exerciseGraph")
      .append("svg")
      .attr("width", "100%")
      .attr("height", graphHeight)
      .attr("viewBox", `0 0 ${graphWidth} ${graphHeight}`);

    const tickValues = [];
    const enddDate = moment(lastExercise.date, "YYYY-MM-DD");

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
      .datum(graphData)
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
          .y((exercise) => yScale(exercise.value))
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
    lastExercise.date,
    timeMultipliers,
    timeSelectionTracked,
  ]);

  return (
    <Modal
      isOpen={true}
      hasHeader={true}
      header={lastExercise.name}
      onClose={onClose}
      hasConfirm={false}
      isLarge={true}
    >
      <div className="flex space-between">
        <div>
          <TooltipInput
            id="working-weight"
            label={null}
            tooltip="Working weight is the amount of weight lifted for a specific exercise during a workout routine."
            showInfo={showInfo}
            setShowInfo={setShowInfo}
          >
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
                <p>{lastExercise.working_weight} lbs</p>
              ) : (
                <p>{defaultConvertWeight(lastExercise.working_weight)} kgs</p>
              )}
              <div className="flex">
                {renderPercentageDifference(
                  workingWeightDifference,
                  firstExercise.working_weight
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
          </TooltipInput>
          <TooltipInput
            id="volume"
            label={null}
            tooltip="Volume refers to the total amount of work performed in a workout. It is calculated by multiplying the number of sets, repetitions, and weight lifted for an exercise in a routine."
            showInfo={showInfo}
            setShowInfo={setShowInfo}
          >
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
              {userProfile?.measurement_type !== "metric" ? (
                <p>{`${lastExercise.volume?.toLocaleString()} lbs`}</p>
              ) : (
                <p>{`${defaultConvertWeight(
                  lastExercise.volume
                )?.toLocaleString()} kgs`}</p>
              )}
              {firstExercise.volume ? (
                <div className="flex">
                  {renderPercentageDifference(
                    volumeDifference,
                    firstExercise.volume
                  )}
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
          </TooltipInput>
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
