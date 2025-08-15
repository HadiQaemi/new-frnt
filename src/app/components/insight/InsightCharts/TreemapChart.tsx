'use client';

import React, { useState, useMemo } from 'react';
import { Treemap } from '@visx/hierarchy';
import { hierarchy } from 'd3-hierarchy';
import { treemapSquarify } from 'd3-hierarchy';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

type WordData = {
    text: any;
    value: any;
    definition: any;
    label: any;
    see_also?: any;
    operations?: any;
    matrices?: any;
    object_of_interests?: any;
    properties?: any;
    units?: any;
};

interface TreemapNode {
    name: string;
    value?: number;
    children?: TreemapNode[];
    data?: WordData;
}

interface TreemapChartProps {
    words: WordData[];
    width?: number;
    height?: number;
}

const colorScale = scaleOrdinal(schemeCategory10);

export default function TreemapChart({
    words,
    width = 800,
    height = 500
}: TreemapChartProps) {
    const [hoveredWord, setHoveredWord] = useState<{ word: WordData; x: number; y: number } | null>(null);

    const hierarchicalData: TreemapNode = useMemo(() => {
        return {
            name: 'Root',
            children: words.map(word => ({
                name: word.text || word.label,
                value: word.value,
                data: word
            }))
        };
    }, [words]);

    const wrapText = (text: string, maxWidth: number, fontSize: number) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        const charWidth = fontSize * 0.6;
        const maxCharsPerLine = Math.floor(maxWidth / charWidth);

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length <= maxCharsPerLine) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word.substring(0, maxCharsPerLine));
                    currentLine = word.substring(maxCharsPerLine);
                }
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines;
    };

    const formatWordInfo = (word: WordData) => {
        let info = '';

        if (word.definition) {
            info += word.definition;
            if (!word.definition.endsWith('.')) info += '.';
        }

        if (word.properties && word.properties.length > 0) {
            info += `${word.properties.map((p: any) => p.label).join(', ')}`;
        }

        // if (word.operations && word.operations.length > 0) {
        //     info += ` Operations: ${word.operations.map((o: any) => o.label).join(', ')}.`;
        // }

        if (word.object_of_interests && word.object_of_interests.length > 0) {
            info += ` of ${word.object_of_interests.map((o: any) => o.label).join(', ')}`;
        }

        if (word.units && word.units.length > 0) {
            info += ` [${word.units.map((u: any) => u.label).join(', ')}]`;
        }

        return info.trim();
    };

    const root = useMemo(() =>
        hierarchy(hierarchicalData)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0)),
        [hierarchicalData]
    );

    return (
        <div className="relative flex flex-col items-center justify-center w-full">
            {/* Hover tooltip */}
            {hoveredWord && (
                <div
                    className="absolute z-10 bg-black bg-opacity-90 text-white p-3 rounded-md shadow-lg max-w-xs pointer-events-none"
                    style={{
                        left: hoveredWord.x + 15,
                        top: hoveredWord.y - 10,
                        transform: hoveredWord.x > width - 200 ? 'translateX(-100%) translateX(-15px)' : 'none'
                    }}
                >
                    <div className="font-semibold mb-1">
                        {hoveredWord.word.label}: {hoveredWord.word.value}
                    </div>
                    {hoveredWord.word.definition && (
                        <div className="text-sm mb-2">{hoveredWord.word.definition}</div>
                    )}
                    {hoveredWord.word.properties && hoveredWord.word.properties.length > 0 && (
                        <>
                            {hoveredWord.word.properties.map((p: any) => p.label).join(', ')}
                        </>
                    )}
                    {/* {hoveredWord.word.operations && hoveredWord.word.operations.length > 0 && (
                        <>
                            {hoveredWord.word.operations.map((o: any) => o.label).join(', ')}
                        </>
                    )} */}
                    {hoveredWord.word.object_of_interests && hoveredWord.word.object_of_interests.length > 0 && (
                        <>
                            {` of `}{hoveredWord.word.object_of_interests.map((o: any) => o.label).join(', ')}
                        </>
                    )}
                    {hoveredWord.word.units && hoveredWord.word.units.length > 0 && (
                        <>
                            [{hoveredWord.word.units.map((u: any) => u.label).join(', ')}]
                        </>
                    )}
                </div>
            )}

            <div className="relative">
                <svg width={width} height={height}>
                    <Treemap<TreemapNode>
                        root={root}
                        size={[width, height]}
                        paddingInner={2}
                        paddingOuter={4}
                        paddingTop={20}
                        tile={treemapSquarify}
                    >
                        {treemap => (
                            <g>
                                {treemap.descendants()
                                    .reverse()
                                    .map((node, i) => {
                                        const nodeWidth = node.x1 - node.x0;
                                        const nodeHeight = node.y1 - node.y0;

                                        // Skip tiny nodes
                                        if (nodeWidth < 10 || nodeHeight < 10) return null;

                                        const isLeaf = !node.children;
                                        const isRoot = node.depth === 0;

                                        if (isRoot) return null;

                                        return (
                                            <g key={`node-${i}`}>
                                                <rect
                                                    x={node.x0}
                                                    y={node.y0}
                                                    width={nodeWidth}
                                                    height={nodeHeight}
                                                    fill={
                                                        isLeaf
                                                            ? colorScale(i.toString())
                                                            : 'rgba(255,255,255,0.2)'
                                                    }
                                                    stroke={isLeaf ? "white" : "#ddd"}
                                                    strokeWidth={isLeaf ? 1 : 2}
                                                    style={{
                                                        cursor: isLeaf ? 'pointer' : 'default',
                                                        opacity: isLeaf ? 0.8 : 0.3
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (isLeaf && node.data?.data) {
                                                            const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                                            const x = e.clientX - (rect?.left || 0);
                                                            const y = e.clientY - (rect?.top || 0);
                                                            setHoveredWord({
                                                                word: node.data.data,
                                                                x: x,
                                                                y: y
                                                            });
                                                        }
                                                    }}
                                                    onMouseMove={(e) => {
                                                        if (isLeaf && node.data?.data && hoveredWord) {
                                                            const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                                                            const x = e.clientX - (rect?.left || 0);
                                                            const y = e.clientY - (rect?.top || 0);
                                                            setHoveredWord({
                                                                word: node.data.data,
                                                                x: x,
                                                                y: y
                                                            });
                                                        }
                                                    }}
                                                    onMouseLeave={() => setHoveredWord(null)}
                                                />

                                                {isLeaf && nodeWidth > 40 && nodeHeight > 30 && (
                                                    <text
                                                        x={node.x0 + nodeWidth / 2}
                                                        y={node.y0 + 15}
                                                        fontSize={Math.min(nodeWidth / 6, 14)}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fill="white"
                                                        fontWeight="bold"
                                                        style={{
                                                            pointerEvents: 'none',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        {`${node.data?.name} (${node.value})`}
                                                    </text>
                                                )}

                                                {isLeaf && node.data?.data && nodeWidth > 60 && nodeHeight > 50 && (
                                                    (() => {
                                                        const wordInfo = formatWordInfo(node.data.data);
                                                        if (!wordInfo) return null;

                                                        const fontSize = Math.min(nodeWidth / 20, nodeHeight / 15, 10);
                                                        const availableWidth = nodeWidth - 8;
                                                        const availableHeight = nodeHeight - 35;
                                                        const lineHeight = fontSize * 1.2;
                                                        const maxLines = Math.floor(availableHeight / lineHeight);

                                                        if (maxLines < 1) return null;

                                                        const lines = wrapText(wordInfo, availableWidth, fontSize);
                                                        const displayLines = lines.slice(0, maxLines);

                                                        return (
                                                            <g>
                                                                {displayLines.map((line, lineIndex) => (
                                                                    <text
                                                                        key={lineIndex}
                                                                        x={node.x0 + 4}
                                                                        y={node.y0 + 30 + (lineIndex * lineHeight)}
                                                                        fontSize={fontSize}
                                                                        fill="white"
                                                                        style={{
                                                                            pointerEvents: 'none',
                                                                            userSelect: 'none'
                                                                        }}
                                                                    >
                                                                        {line}
                                                                        {lineIndex === maxLines - 1 && lines.length > maxLines && '...'}
                                                                    </text>
                                                                ))}
                                                            </g>
                                                        );
                                                    })()
                                                )}

                                                {!isLeaf && nodeWidth > 30 && nodeHeight > 20 && (
                                                    <text
                                                        x={node.x0 + nodeWidth / 2}
                                                        y={node.y0 + nodeHeight / 2}
                                                        fontSize={Math.min(nodeWidth / 10, 16)}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fill="#333"
                                                        fontWeight="normal"
                                                        style={{
                                                            pointerEvents: 'none',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        {node.data?.name}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}
                            </g>
                        )}
                    </Treemap>
                </svg>
            </div>
        </div>
    );
}