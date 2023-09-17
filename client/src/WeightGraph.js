import React, { useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WeightGraph = (props) => {
  const { weightData } = props;

  function formatDate(dateString) {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}/${day}`;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        width={600}
        height={300}
        data={weightData}
        margin={{ top: 30, right: 50, left: 0, bottom: 10 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          type="number"
          domain={([dataMin, dataMax]) => {
            const newMin = Math.max(
              Math.abs(dataMax - 1728000000),
              weightData.length > 0 ? weightData[0].date : dataMin
            );
            return [newMin, dataMax];
          }}
          tickFormatter={(tick) => {
            return formatDate(tick);
          }}
          ticks={
            weightData.length > 0
              ? [
                  weightData[weightData.length - 1].date,
                  weightData[weightData.length - 1].date - 432000000,
                  weightData[weightData.length - 1].date - 864000000,
                  weightData[weightData.length - 1].date - 1296000000,
                  weightData[weightData.length - 1].date - 1728000000,
                ]
              : []
          }
        />
        <YAxis
          domain={[
            (dataMin) => Math.floor(dataMin) - 5,
            (dataMax) => Math.ceil(dataMax) + 5,
          ]}
          scale="linear"
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="rgba(159, 225, 255, 0.87)"
          dot={{ r: 2 }}
          activeDot={{ r: 6 }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightGraph;
