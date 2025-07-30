'use client';

import React, { useRef, useState, useEffect } from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';

type BarChartData = {
    label: string;
    count: number;
};

interface BarChartProps {
    chartData: BarChartData[];
    color?: string;
    hover?: string;
    height?: number;
}

const margin = { top: 20, right: 30, bottom: 70, left: 80 };

export default function BarChart({
    chartData,
    color = '#68cbb0',
    hover = '#38ad8d',
    height = 320,
}: BarChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentRect.width) {
                    setWidth(entry.contentRect.width);
                }
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    const xScale = scaleBand<string>({
        domain: chartData.map(d => d.label),
        range: [0, xMax],
        padding: 0.2,
    });

    const yScale = scaleLinear<number>({
        domain: [0, Math.max(...chartData.map(d => d.count)) * 1.1], // 10% headroom
        range: [yMax, 0],
        nice: true,
    });

    return (
        <div ref={containerRef} style={{ width: '100%' }}>
            {width > 0 && (
                <svg width={width} height={height} role="img" aria-label="Bar chart">
                    <Group top={margin.top} left={margin.left}>
                        {/* Grid */}
                        <GridRows
                            scale={yScale}
                            width={xMax}
                            stroke="#e0e0e0"
                            strokeDasharray="4,4"
                            pointerEvents="none"
                        />

                        {/* Bars */}
                        {chartData.map((d, i) => {
                            const barWidth = xScale.bandwidth();
                            const barHeight = yMax - (yScale(d.count) ?? 0);
                            const barX = xScale(d.label) ?? 0;
                            const barY = yScale(d.count) ?? 0;

                            return (
                                <Group key={`bar-${i}`}>
                                    <Bar
                                        x={barX}
                                        y={barY}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={hoverIndex === i ? hover : color}
                                        rx={4}
                                        onMouseEnter={() => setHoverIndex(i)}
                                        onMouseLeave={() => setHoverIndex(null)}
                                    />
                                    {hoverIndex === i && (
                                        <text
                                            x={barX + barWidth / 2}
                                            y={barY - 10}
                                            textAnchor="middle"
                                            fontSize={12}
                                            fontWeight={600}
                                            fill="#333"
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {d.count}
                                        </text>
                                    )}
                                </Group>
                            );
                        })}

                        {/* <AxisBottom
                            top={yMax}
                            scale={xScale}
                            tickLabelProps={() => ({
                                fontSize: 12,
                                textAnchor: 'middle',
                                fill: '#555',
                            })}
                        /> */}
                        <AxisBottom
                            top={yMax}
                            scale={xScale}
                            tickLabelProps={() => ({
                                fontSize: 13,
                                fill: '#555',
                                textAnchor: 'end',
                                angle: -25,
                                dy: '-0.5em',
                                dx: '-0.5em',
                            })}
                        />
                        <AxisLeft
                            scale={yScale}
                            tickLabelProps={() => ({
                                fontSize: 14,
                                fill: '#555',
                                dx: '-1.5em',
                            })}
                            tickStroke="#aaa"
                            stroke="#aaa"
                        />
                    </Group>
                </svg>
            )}
        </div>
    );
}
