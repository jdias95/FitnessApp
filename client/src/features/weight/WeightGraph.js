import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import moment from "moment";

const WeightGraph = ({
  weightData,
  timeSelection,
  userProfile,
  defaultConvertWeight,
  weightForcast,
  timeMultipliers,
  setWeightTimeBTN, // Add setWeightTimeBTN as a prop
}) => {
  const svgRef = useRef(null);

  // Calculate weightTimeBTN outside useEffect using useMemo
  useMemo(() => {
    if (weightData && weightData.length > 0) {
      const dateValues = weightData
        .filter((d) => d.weight != null)
        .map((d) => d.date);
      const timeDiff =
        new Date(dateValues[dateValues.length - 1]).getTime() -
        new Date(dateValues[0]).getTime();
      setWeightTimeBTN(timeDiff);
    }
  }, [weightData, setWeightTimeBTN]);

  // Memoize yScale to ensure consistency across effects
  const yScale = useMemo(() => {
    if (!weightData || weightData.length === 0) return null;

    const weightValues = weightData
      .filter((d) => d.weight != null)
      .map((d) => d.weight);
    const minValue = d3.min(weightValues);
    const maxValue = d3.max(weightValues);
    const meanValue = d3.mean(weightValues);
    const padding = meanValue * 0.025; // Reintroduce padding

    return d3
      .scaleLinear()
      .domain([
        userProfile && userProfile.target_weight
          ? userProfile.measurement_type !== "metric"
            ? d3.min([userProfile.target_weight - padding, minValue - padding])
            : d3.min([
                defaultConvertWeight(userProfile.target_weight) - padding,
                minValue - padding,
              ])
          : minValue - padding,
        userProfile && userProfile.target_weight
          ? userProfile.measurement_type !== "metric"
            ? d3.max([userProfile.target_weight + padding, maxValue + padding])
            : d3.max([
                defaultConvertWeight(userProfile.target_weight) + padding,
                maxValue + padding,
              ])
          : maxValue + padding,
      ])
      .nice()
      .range([400 - 20, 20]); // graphHeight - marginBottom, marginTop
  }, [weightData, userProfile, defaultConvertWeight]);

  // Memoize xScale to ensure consistency and avoid unnecessary recalculations
  const xScale = useMemo(() => {
    if (!weightData || weightData.length === 0) return null;

    const dateValues = weightData
      .filter((d) => d.weight != null)
      .map((d) => d.date);

    const tickValues = [];
    const endDate = moment(
      weightData[weightData.length - 1].date,
      "YYYY-MM-DD"
    );

    for (let i = 0; i < 6; i++) {
      const date = moment(endDate).subtract(
        timeMultipliers[timeSelection] * i,
        "days"
      );
      tickValues.push(date.toDate());
    }

    return d3
      .scaleTime()
      .domain([
        new Date(tickValues[tickValues.length - 1]),
        new Date(tickValues[0]),
      ])
      .range([30, 500 - 20]); // marginLeft, graphWidth - marginRight
  }, [weightData, timeSelection, timeMultipliers]);

  // Core graph setup (line and axes) - only runs when necessary
  useEffect(() => {
    if (!weightData || weightData.length === 0 || !yScale || !xScale) return;

    const svg = d3.select(svgRef.current);
    const graphWidth = 500;
    const graphHeight = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 20;
    const marginLeft = 30;

    // Update x-axis
    const xAxis = svg.selectAll(".x-axis").data([null]);
    xAxis
      .enter()
      .append("g")
      .attr("class", "x-axis")
      .merge(xAxis)
      .attr("transform", `translate(0, ${graphHeight - marginBottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(
            Array.from({ length: 6 }, (_, i) =>
              moment(weightData[weightData.length - 1].date, "YYYY-MM-DD")
                .subtract(timeMultipliers[timeSelection] * i, "days")
                .toDate()
            )
          )
          .tickFormat((date) => date.toLocaleDateString().slice(0, -5))
      );

    // Update y-axis
    const yAxis = svg.selectAll(".y-axis").data([null]);
    yAxis
      .enter()
      .append("g")
      .attr("class", "y-axis")
      .merge(yAxis)
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(yScale));

    // Add gridlines
    const gridlines = svg.selectAll(".gridline").data(yScale.ticks());
    gridlines
      .enter()
      .append("line")
      .attr("class", "gridline")
      .merge(gridlines)
      .attr("x1", marginLeft)
      .attr("y1", (d) => yScale(d))
      .attr("x2", graphWidth - marginRight)
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "rgba(156, 165, 174, .4)");

    // Update clip path to extend to the left edge of the graph area
    const clipPath = svg.selectAll("#clip-path").data([null]);
    clipPath
      .enter()
      .append("defs")
      .append("clipPath")
      .attr("id", "clip-path")
      .append("rect")
      .merge(clipPath)
      .attr("x", marginLeft)
      .attr("y", 0)
      .attr("width", graphWidth)
      .attr("height", graphHeight);

    // Define the line
    const line = d3
      .line()
      .defined((d) => d.weight != null)
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.weight));

    // Update weight line
    const weightLine = svg.selectAll(".weight-line").data([weightData]);
    weightLine
      .enter()
      .append("path")
      .attr("class", "weight-line")
      .merge(weightLine)
      .attr("fill", "none")
      .attr("stroke", "#ACEDFF")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("d", line)
      .attr("clip-path", "url(#clip-path)");

    // Clean up styles
    svg.selectAll(".domain").remove();
    svg.selectAll(".x-axis .tick line").remove();
    svg.selectAll(".y-axis .tick line:first-child").remove();
    svg.selectAll("text").style("font-size", "12px");
  }, [weightData, timeSelection, timeMultipliers, yScale, xScale]);

  // Target line and tooltip updates
  useEffect(() => {
    if (!userProfile || !userProfile.target_weight || !yScale || !xScale)
      return;

    const svg = d3.select(svgRef.current);
    const graphWidth = 500;
    const marginLeft = 30;
    const marginRight = 20;

    const targetWeight =
      userProfile.measurement_type !== "metric"
        ? userProfile.target_weight
        : defaultConvertWeight(userProfile.target_weight);

    // Update or append target line
    const targetLine = svg.selectAll(".target-line").data([targetWeight]);
    targetLine
      .enter()
      .append("line")
      .attr("class", "target-line")
      .merge(targetLine)
      .attr("x1", marginLeft)
      .attr("y1", (d) => yScale(d))
      .attr("x2", graphWidth - marginRight)
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "rgb(138, 201, 38)")
      .attr("stroke-width", 2);

    // Update or append target text
    const targetText = svg.selectAll(".target-text").data([weightForcast]);
    targetText
      .enter()
      .append("text")
      .attr("class", "target-text")
      .merge(targetText)
      .attr("x", (graphWidth - marginLeft - marginRight) / 2)
      .attr(
        "y",
        userProfile.target_weight - userProfile.weight > 0
          ? yScale(targetWeight) - 10
          : yScale(targetWeight) + 20
      )
      .attr("text-anchor", "start")
      .attr("fill", "rgb(138, 201, 38)")
      .text((d) =>
        d[0] > 1 || (d[0] > 0 && d[0] < 1)
          ? `${Number(d[0])} ${d[1]}`
          : Number(d[0]) === 1
          ? `${Number(d[0])} ${d[1].slice(0, d[1].length - 1)}`
          : ""
      );

    // Tooltip logic (simplified for brevity)
    const screenWidth = window.innerWidth;
    const tooltip = d3
      .select("body")
      .selectAll(".tooltip")
      .data([null])
      .join("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("padding", "15px")
      .style("font-size", screenWidth < 800 ? "11px" : "14px")
      .style("font-family", "Open Sans")
      .style("z-index", "-100");

    const tooltipImage = svg.selectAll(".tooltip-png2").data([weightForcast]);
    tooltipImage
      .enter()
      .append("image")
      .attr("class", "tooltip-png2")
      .merge(tooltipImage)
      .attr("x", (graphWidth - marginLeft - marginRight) / 2 - 18)
      .attr(
        "y",
        userProfile.target_weight - userProfile.weight > 0
          ? yScale(targetWeight) - 22
          : yScale(targetWeight) + 9
      )
      .attr("xlink:href", process.env.PUBLIC_URL + "/tooltip.png")
      .on("mouseover", function (event) {
        d3.select(this).attr(
          "xlink:href",
          process.env.PUBLIC_URL + "/tooltip-hover.png"
        );
        tooltip
          .html(
            "Please note, the estimated daily calorie budget is tailored to your weekly goal and profile settings..."
          )
          .style("opacity", 1)
          .style("position", "absolute")
          .style(
            "left",
            screenWidth < 800
              ? `${event.pageX - 137}px`
              : `${event.pageX - 155}px`
          )
          .style(
            "top",
            screenWidth < 800
              ? `${event.pageY - 140}px`
              : `${event.pageY - 160}px`
          )
          .style("z-index", "100");
      })
      .on("mouseout", function () {
        d3.select(this).attr(
          "xlink:href",
          process.env.PUBLIC_URL + "/tooltip.png"
        );
        tooltip.style("opacity", 0).style("z-index", "-100");
      });
  }, [userProfile, weightForcast, defaultConvertWeight, yScale, xScale]);

  return (
    <div className="weightGraph">
      <svg ref={svgRef} width="100%" height="400" viewBox={`0 0 500 400`}></svg>
    </div>
  );
};

export default WeightGraph;
