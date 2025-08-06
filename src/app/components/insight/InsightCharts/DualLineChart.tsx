'use client';

import React, { useEffect, useRef, useState } from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { LinePath, Circle } from '@visx/shape';
import { curveLinear } from '@visx/curve';

type DataPoint = {
    month: string;
    article_count: number;
    statement_count: number;
};

interface DualLineChartProps {
    data: DataPoint[];
    height?: number;
    articleColor?: string;
    statementColor?: string;
}

const margin = { top: 20, right: 30, bottom: 60, left: 60 };

export default function DualLineChart({
    data,
    height = 300,
    articleColor = '#8dbcf3',
    statementColor = '#efa5be',
}: DualLineChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    const [visibleLines, setVisibleLines] = useState({
        article: false,
        statement: false,
        cumulativeArticle: true,
        cumulativeStatement: true,
    });

    const [hovered, setHovered] = useState<{
        x: number;
        y: number;
        value: number;
        label: string;
        series: 'article' | 'statement' | 'cumulativeArticle' | 'cumulativeStatement';
    } | null>(null);

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
        domain: data.map(d => d.month),
        range: [0, xMax],
        padding: 0.4,
    });

    type CumulativeDataPoint = DataPoint & {
        cumulative_article: number;
        cumulative_statement: number;
    };

    const cumulativeData: CumulativeDataPoint[] = [];

    let cumulativeArticle = 0;
    let cumulativeStatement = 0;

    for (const d of data) {
        cumulativeArticle += d.article_count;
        cumulativeStatement += d.statement_count;

        cumulativeData.push({
            ...d,
            cumulative_article: cumulativeArticle,
            cumulative_statement: cumulativeStatement,
        });
    }
    const maxY = Math.max(
        0,
        ...(visibleLines.article
            ? data.map(d => d.article_count)
            : []),
        ...(visibleLines.statement
            ? data.map(d => d.statement_count)
            : []),
        ...(visibleLines.cumulativeArticle
            ? cumulativeData.map(d => d.cumulative_article)
            : []),
        ...(visibleLines.cumulativeStatement
            ? cumulativeData.map(d => d.cumulative_statement)
            : [])
    );
    const yScale = scaleLinear<number>({
        domain: [0, maxY * 1.05],
        range: [yMax, 0],
        nice: true,
    });
    return (
        <div className="flex flex-col-reverse md:flex-row items-start">
            <div ref={containerRef} className="w-full flex-1">
                {width > 0 && (
                    <svg width={width} height={height}>
                        <Group top={margin.top} left={margin.left}>
                            <GridRows
                                scale={yScale}
                                width={xMax}
                                stroke="#e0e0e0"
                                strokeDasharray="4,4"
                                pointerEvents="none"
                            />

                            {hovered && (
                                <text
                                    x={hovered.x}
                                    y={hovered.y - 10}
                                    textAnchor="middle"
                                    fontSize={12}
                                    fontWeight={600}
                                    fill="#333"
                                >
                                    {hovered.value}
                                </text>
                            )}

                            {visibleLines.article && (
                                <>
                                    <LinePath
                                        data={data}
                                        x={d => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
                                        y={d => yScale(d.article_count)}
                                        stroke={articleColor}
                                        strokeWidth={2}
                                        curve={curveLinear}
                                    />
                                    {data.map((d, i) => (
                                        <Circle
                                            key={`article-${i}`}
                                            cx={(xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
                                            cy={yScale(d.article_count)}
                                            r={
                                                hovered?.label === d.month && hovered.series === 'article' ? 6 : 4
                                            }
                                            fill={
                                                hovered?.label === d.month && hovered.series === 'article'
                                                    ? '#0041a8'
                                                    : articleColor
                                            }
                                            onMouseEnter={() =>
                                                setHovered({
                                                    x: (xScale(d.month) ?? 0) + xScale.bandwidth() / 2,
                                                    y: yScale(d.article_count),
                                                    value: d.article_count,
                                                    label: d.month,
                                                    series: 'article',
                                                })
                                            }
                                            onMouseLeave={() => setHovered(null)}
                                            className="transition-[r,fill] duration-200 ease-in-out"
                                        />
                                    ))}
                                </>
                            )}

                            {visibleLines.statement && (
                                <>
                                    <LinePath
                                        data={data}
                                        x={d => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
                                        y={d => yScale(d.statement_count)}
                                        stroke={statementColor}
                                        strokeWidth={2}
                                        curve={curveLinear}
                                    />
                                    {data.map((d, i) => (
                                        <Circle
                                            key={`statement-${i}`}
                                            cx={(xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
                                            cy={yScale(d.statement_count)}
                                            r={
                                                hovered?.label === d.month && hovered.series === 'statement' ? 6 : 4
                                            }
                                            fill={
                                                hovered?.label === d.month && hovered.series === 'statement'
                                                    ? '#b0003a'
                                                    : statementColor
                                            }
                                            onMouseEnter={() =>
                                                setHovered({
                                                    x: (xScale(d.month) ?? 0) + xScale.bandwidth() / 2,
                                                    y: yScale(d.statement_count),
                                                    value: d.statement_count,
                                                    label: d.month,
                                                    series: 'statement',
                                                })
                                            }
                                            onMouseLeave={() => setHovered(null)}
                                            className="transition-[r,fill] duration-200 ease-in-out"
                                        />
                                    ))}
                                </>
                            )}

                            {visibleLines.cumulativeArticle && (
                                <>
                                    <LinePath
                                        data={cumulativeData}
                                        x={d => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
                                        y={d => yScale(d.cumulative_article)}
                                        stroke="#0041a8"
                                        strokeDasharray="5,5"
                                        strokeWidth={2}
                                        curve={curveLinear}
                                    />
                                    {cumulativeData.map((d, i) => (
                                        <Circle
                                            key={`cumulative-article-${i}`}
                                            cx={(xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
                                            cy={yScale(d.cumulative_article)}
                                            r={hovered?.label === d.month && hovered.series === 'cumulativeArticle' ? 6 : 4}
                                            fill={hovered?.label === d.month && hovered.series === 'cumulativeArticle' ? '#002a6a' : '#0041a8'}
                                            onMouseEnter={() => setHovered({
                                                x: (xScale(d.month) ?? 0) + xScale.bandwidth() / 2,
                                                y: yScale(d.cumulative_article),
                                                value: d.cumulative_article,
                                                label: d.month,
                                                series: 'cumulativeArticle',
                                            })}
                                            onMouseLeave={() => setHovered(null)}
                                            className="transition-[r,fill] duration-200 ease-in-out"
                                        />
                                    ))}
                                </>
                            )}

                            {visibleLines.cumulativeStatement && (
                                <>
                                    <LinePath
                                        data={cumulativeData}
                                        x={d => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
                                        y={d => yScale(d.cumulative_statement)}
                                        stroke="#b0003a"
                                        strokeDasharray="5,5"
                                        strokeWidth={2}
                                        curve={curveLinear}
                                    />
                                    {cumulativeData.map((d, i) => (
                                        <Circle
                                            key={`cumulative-statement-${i}`}
                                            cx={(xScale(d.month) ?? 0) + xScale.bandwidth() / 2}
                                            cy={yScale(d.cumulative_statement)}
                                            r={hovered?.label === d.month && hovered.series === 'cumulativeStatement' ? 6 : 4}
                                            fill={hovered?.label === d.month && hovered.series === 'cumulativeStatement' ? '#7a001f' : '#b0003a'}
                                            onMouseEnter={() => setHovered({
                                                x: (xScale(d.month) ?? 0) + xScale.bandwidth() / 2,
                                                y: yScale(d.cumulative_statement),
                                                value: d.cumulative_statement,
                                                label: d.month,
                                                series: 'cumulativeStatement',
                                            })}
                                            onMouseLeave={() => setHovered(null)}
                                            className="transition-[r,fill] duration-200 ease-in-out"
                                        />
                                    ))}
                                </>
                            )}

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
                        </Group>
                    </svg>
                )}
            </div>

            <div className="mb-4 md:mb-0 md:ml-4 min-w-[180px]">
                <div className="mt-2">
                    {[
                        { key: 'article', label: 'Article Count', color: articleColor },
                        { key: 'statement', label: 'Statement Count', color: statementColor },
                        { key: 'cumulativeArticle', label: 'Cumulative Article', color: '#0041a8' },
                        { key: 'cumulativeStatement', label: 'Cumulative Statement', color: '#b0003a' },
                    ].map(({ key, label, color }) => (
                        <label key={key} className="flex items-center mb-[6px]">
                            <input
                                type="checkbox"
                                checked={visibleLines[key as keyof typeof visibleLines]}
                                onChange={() =>
                                    setVisibleLines(prev => ({
                                        ...prev,
                                        [key]: !prev[key as keyof typeof visibleLines],
                                    }))
                                }
                            />
                            <span
                                className="w-3 h-3 inline-block ml-2 mr-1.5"
                                style={{ backgroundColor: color }}
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}