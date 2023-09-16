import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const WeightGraph = (props) => {
  const { weightData } = props;

  return (
    <LineChart
      width={600}
      height={300}
      data={weightData}
      margin={{ top: 30, right: 50, left: 0, bottom: 10 }}
    >
      <CartesianGrid strokeDasharray="0" />
      <XAxis dataKey="date" interval={1} />
      <YAxis
        domain={[
          (dataMin) => Math.floor(dataMin) - 10,
          (dataMax) => Math.ceil(dataMax) + 10,
        ]}
        scale="linear"
      />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="weight"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
        connectNulls={true}
      />
    </LineChart>
  );
};

export default WeightGraph;
