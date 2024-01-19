import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import moment from "moment";

const StatisticsModal = (props) => {
  const {
    onClose,
    selectedExercise,
    selectedExerciseList,
    firstExercise,
    userProfile,
    defaultConvertWeight,
  } = props;

  const [tickMultiplierTracked, setTickMultiplierTracked] = useState(18);
  const [exerciseTimeBTN, setExerciseTimeBTN] = useState(0);
  const [timeSelectionTracked, setTimeSelectionTracked] = useState("3 months");
  const [graphSelection, setGraphSelection] = useState("working weight");

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
    if (timeSelectionTracked === "3 months") {
      setTickMultiplierTracked(18);
    } else if (timeSelectionTracked === "6 months") {
      setTickMultiplierTracked(36);
    } else if (timeSelectionTracked === "1 year") {
      setTickMultiplierTracked(72);
    } else if (timeSelectionTracked === "All") {
      setTickMultiplierTracked(Math.ceil(exerciseTimeBTN / 432000000));
    }

    const graphWidth = 400;
    const graphHeight = 300;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 20;
    const marginLeft = 30;

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
      .attr("viewBox", `0 0 ${graphWidth} ${graphHeight}`)
      .attr(
        "transform",
        `translate(${-marginLeft - marginRight}, ${marginTop})`
      );

    const tickValues = [];
    const enddDate = moment(selectedExercise.date, "YYYY-MM-DD");

    for (let i = 0; i < 6; i++) {
      const date = moment(enddDate).subtract(tickMultiplierTracked * i, "days");
      tickValues.push(date.toDate());
    }

    const xScale = d3
      .scaleTime()
      .domain([
        new Date(tickValues[tickValues.length - 1]),
        new Date(tickValues[0]),
      ])
      .range([marginLeft, graphWidth + marginRight + 5]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat((date) => {
        // const timeFormat = d3.timeFormat("%m/%d");
        return date.toLocaleDateString().slice(0, -5);
      });

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr(
        "transform",
        `translate(${-marginLeft}, ${graphHeight - marginBottom})`
      )
      .call(xAxis);

    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip-path")
      .append("rect")
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
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("clip-path", "url(#clip-path)")
      .attr("transform", `translate(${-marginLeft}, 0)`)
      .attr(
        "d",
        d3
          .line()
          .x((exercise) => xScale(new Date(exercise.date)))
          .y((exercise) => yScale(exercise.weight))
      );

    // svg
    //   .append("g")
    //   .append("path")
    //   .datum(exerciseVolumes)
    //   .attr("fill", "none")
    //   .attr("stroke", "steelblue")
    //   .attr("stroke-width", 2)
    //   .attr("stroke-linecap", "round")
    //   .attr("clip-path", "url(#clip-path)")
    //   .attr("transform", `translate(${-marginLeft}, 0)`)
    //   .attr(
    //     "d",
    //     d3
    //       .line()
    //       .x((exercise) => xScale(new Date(exercise.date)))
    //       .y((exercise) => yScale(exercise.weight))
    //   );

    const yAxisGroup = svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(0, 0)`)
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
      .attr("x2", graphWidth)
      .attr("y2", 0)
      .attr("stroke", "rgba(156, 165, 174, .4");

    svg.selectAll(".domain").remove();
    svg.selectAll(".x-axis .tick line").remove();
    svg.selectAll(".y-axis .tick line:first-child").remove();
    svg.selectAll("text").style("font-size", "12px");
  });

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-flex">
          <div className="exercise-modal-body">
            <div className="flex">
              <p>Working Weight:&nbsp;</p>
              {userProfile.measurement_type !== "metric" ? (
                <p>{selectedExercise.weight} lbs</p>
              ) : (
                <p>{defaultConvertWeight(selectedExercise.weight)} kgs</p>
              )}
              {workingWeightDifference > 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="positive">&#8657;</p>
                  <p>
                    {Number(
                      (
                        (workingWeightDifference / firstExercise.weight) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : workingWeightDifference < 0 ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="negative">&#8659;</p>
                  <p>
                    {Number(
                      (
                        (Math.abs(workingWeightDifference) /
                          firstExercise.weight) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="flex">
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
              {volumeDifference > 0 && firstVolume ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="positive">&#8657;</p>
                  <p>
                    {Number(
                      ((volumeDifference / firstVolume) * 100).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : volumeDifference < 0 && firstVolume ? (
                <div className="flex">
                  <p>&nbsp;(</p>
                  <p id="negative">&#8659;</p>
                  <p>
                    {Number(
                      (
                        (Math.abs(volumeDifference) / firstVolume) *
                        100
                      ).toFixed(1)
                    )}
                    %)
                  </p>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="exerciseGraph"></div>
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

export default StatisticsModal;
