import { useState } from "react";
import {
  Cell,
  Pie,
  Sector,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  PieLabelRenderProps,
  SectorProps,
} from "recharts";

const COLORS = ["#f2afb2", "#68cbb0", "#FFBB28", "#FF8042"];

interface DataPoint {
  label: string;
  count: number;
}

interface ChartData {
  [key: string]: DataPoint;
}

interface Props {
  chartData: ChartData
}

const renderCustomLabel = ({ name, x, y }: PieLabelRenderProps) => (
  <text
    x={x}
    y={y}
    className="text-gray-800 text-base"
    textAnchor="middle"
    dominantBaseline="central"
  >
    {name}
  </text>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-300 rounded">
        <p>{data.name}: {data.value}%</p>
      </div>
    );
  }
  return null;
};

const renderActiveShape = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
}: SectorProps) => (
  <g>
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={(outerRadius ?? 0) + 10}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  </g>
);

export default function LanguagePieChart({ chartData }: Props) {

  const data = Object.values(chartData).map((datapoint) => ({
    name: datapoint.label,
    value: datapoint.count,
  }));

  return (
    <div className="w-full h-[90%]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
            label={renderCustomLabel}
            activeShape={renderActiveShape}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
