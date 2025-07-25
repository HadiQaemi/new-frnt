// components/PieChart.tsx
"use client";

import React from "react";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";
import { schemeCategory10 } from "d3-scale-chromatic";

type PieChartData = {
    label: string;
    count: number;
};

interface PieChartProps {
    width: number;
    height: number;
    data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ width, height, data }) => {
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const getLabel = (d: PieChartData) => d.label;
    const getValue = (d: PieChartData) => d.count;

    const colorScale = scaleOrdinal<string, string>({
        domain: data.map(getLabel),
        range: [...schemeCategory10],
    });

    return (
        <svg width={width} height={height} style={{ display: "block" }}>
            <Group top={centerY} left={centerX}>
                <Pie
                    data={data}
                    pieValue={getValue}
                    outerRadius={radius}
                    cornerRadius={3}
                    padAngle={0.02}
                >
                    {(pie) =>
                        pie.arcs.map((arc, index) => {
                            const [centroidX, centroidY] = pie.path.centroid(arc);
                            const label = getLabel(arc.data);
                            const value = getValue(arc.data);

                            return (
                                <g key={`arc-${label}-${index}`}>
                                    <path d={pie.path(arc) ?? ""} fill={colorScale(label)} />
                                    <text
                                        x={centroidX}
                                        y={centroidY}
                                        dy=".33em"
                                        fontSize={18}
                                        fill="#fff"
                                        textAnchor="middle"
                                        pointerEvents="none"
                                    >
                                        {`${label} (${value}%)`}
                                    </text>
                                </g>
                            );
                        })
                    }
                </Pie>
            </Group>
        </svg>
    );
};

export default PieChart;
