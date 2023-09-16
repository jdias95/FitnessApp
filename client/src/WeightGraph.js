import React from "react";
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        width={600}
        height={300}
        data={weightData}
        margin={{ top: 30, right: 50, left: 0, bottom: 10 }}
      >
        <CartesianGrid vertical={false} />
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
          stroke="rgba(93, 190, 163, 0.87)"
          activeDot={{ r: 8 }}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeightGraph;
