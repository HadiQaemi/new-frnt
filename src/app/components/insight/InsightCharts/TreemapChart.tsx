'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
    minHeight?: number;
    maxHeight?: number;
}

const colorScale = scaleOrdinal(schemeCategory10);

export default function TreemapChart({
    words,
    width,
    height,
    minHeight = 400,
    maxHeight = 800
}: TreemapChartProps) {
    const [hoveredWord, setHoveredWord] = useState<{ word: WordData; x: number; y: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: width || 800, height: height || 500 });

    // Handle responsive sizing
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const aspectRatio = 1.6; // 16:10 aspect ratio

                let newWidth = width || containerWidth;
                let newHeight = height || Math.max(minHeight, Math.min(maxHeight, newWidth / aspectRatio));

                // Ensure minimum dimensions for readability
                if (newWidth < 300) {
                    newWidth = 300;
                    newHeight = Math.max(minHeight, 300 / aspectRatio);
                }

                setDimensions({ width: newWidth, height: newHeight });
            }
        };

        updateDimensions();

        const handleResize = () => {
            updateDimensions();
        };

        window.addEventListener('resize', handleResize);

        // Use ResizeObserver for more accurate container size detection
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [width, height, minHeight, maxHeight]);

    // Transform word data into hierarchical structure for treemap
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

    // Helper function to wrap text into multiple lines (responsive)
    const wrapText = (text: string, maxWidth: number, fontSize: number) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        // Responsive character width estimation
        const charWidth = fontSize * (dimensions.width < 600 ? 0.7 : 0.6);
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
                    // Word is too long, break it
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

    // Helper function to format word information
    const formatWordInfo = (word: WordData) => {
        let info = '';

        if (word.definition) {
            info += word.definition;
            if (!word.definition.endsWith('.')) info += '.';
        }

        if (word.properties && word.properties.length > 0) {
            info += ` Properties: ${word.properties.map((p: any) => p.label).join(', ')}.`;
        }

        if (word.operations && word.operations.length > 0) {
            info += ` Operations: ${word.operations.map((o: any) => o.label).join(', ')}.`;
        }

        if (word.object_of_interests && word.object_of_interests.length > 0) {
            info += ` Object of Interest: ${word.object_of_interests.map((o: any) => o.label).join(', ')}.`;
        }

        if (word.units && word.units.length > 0) {
            info += ` Units: ${word.units.map((u: any) => u.label).join(', ')}.`;
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
        <div ref={containerRef} className="relative flex flex-col items-center justify-center w-full">
            {/* Hover tooltip */}
            {hoveredWord && (
                <div
                    className="absolute z-10 bg-black bg-opacity-90 text-white p-3 rounded-md shadow-lg pointer-events-none"
                    style={{
                        left: hoveredWord.x + 15,
                        top: hoveredWord.y - 10,
                        transform: hoveredWord.x > dimensions.width - 250 ? 'translateX(-100%) translateX(-15px)' : 'none',
                        maxWidth: dimensions.width < 600 ? '250px' : '300px',
                        fontSize: dimensions.width < 600 ? '12px' : '14px'
                    }}
                >
                    <div className="font-semibold mb-1">
                        {hoveredWord.word.label} ({hoveredWord.word.value})
                    </div>
                    {hoveredWord.word.definition && (
                        <div className="text-sm mb-2">{hoveredWord.word.definition}</div>
                    )}
                    {hoveredWord.word.properties && hoveredWord.word.properties.length > 0 && (
                        <div className="text-xs mb-1">
                            <strong>Properties:</strong> {hoveredWord.word.properties.map((p: any) => p.label).join(', ')}
                        </div>
                    )}
                    {hoveredWord.word.operations && hoveredWord.word.operations.length > 0 && (
                        <div className="text-xs mb-1">
                            <strong>Operations:</strong> {hoveredWord.word.operations.map((o: any) => o.label).join(', ')}
                        </div>
                    )}
                    {hoveredWord.word.object_of_interests && hoveredWord.word.object_of_interests.length > 0 && (
                        <div className="text-xs mb-1">
                            <strong>Objects:</strong> {hoveredWord.word.object_of_interests.map((o: any) => o.label).join(', ')}
                        </div>
                    )}
                    {hoveredWord.word.units && hoveredWord.word.units.length > 0 && (
                        <div className="text-xs">
                            <strong>Units:</strong> {hoveredWord.word.units.map((u: any) => u.label).join(', ')}
                        </div>
                    )}
                </div>
            )}

            <div className="relative w-full overflow-hidden">
                <svg
                    width="100%"
                    height={dimensions.height}
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    className="max-w-full h-auto"
                >
                    <Treemap<TreemapNode>
                        root={root}
                        size={[dimensions.width, dimensions.height]}
                        paddingInner={dimensions.width < 600 ? 1 : 2}
                        paddingOuter={dimensions.width < 600 ? 2 : 4}
                        paddingTop={dimensions.width < 600 ? 15 : 20}
                        tile={treemapSquarify}
                    >
                        {treemap => (
                            <g>
                                {treemap.descendants()
                                    .reverse()
                                    .map((node, i) => {
                                        const nodeWidth = node.x1 - node.x0;
                                        const nodeHeight = node.y1 - node.y0;

                                        // Skip tiny nodes (responsive thresholds)
                                        const minNodeSize = dimensions.width < 600 ? 20 : 10;
                                        if (nodeWidth < minNodeSize || nodeHeight < minNodeSize) return null;

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

                                                {/* Main word label at top */}
                                                {isLeaf && nodeWidth > (dimensions.width < 600 ? 60 : 40) && nodeHeight > (dimensions.width < 600 ? 40 : 30) && (
                                                    <text
                                                        x={node.x0 + nodeWidth / 2}
                                                        y={node.y0 + (dimensions.width < 600 ? 12 : 15)}
                                                        fontSize={Math.min(nodeWidth / (dimensions.width < 600 ? 8 : 6), dimensions.width < 600 ? 12 : 14)}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fill="white"
                                                        fontWeight="bold"
                                                        style={{
                                                            pointerEvents: 'none',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        {/* {`${node.data?.name} (${node.value})`} */}
                                                        {`${node.data?.name}`}
                                                    </text>
                                                )}

                                                {/* Word information at bottom of rectangle */}
                                                {isLeaf && node.data?.data && nodeWidth > (dimensions.width < 600 ? 80 : 60) && nodeHeight > (dimensions.width < 600 ? 60 : 50) && (
                                                    (() => {
                                                        const wordInfo = formatWordInfo(node.data.data);
                                                        if (!wordInfo) return null;

                                                        const fontSize = Math.min(nodeWidth / (dimensions.width < 600 ? 25 : 20), nodeHeight / (dimensions.width < 600 ? 20 : 15), dimensions.width < 600 ? 8 : 10);
                                                        const availableWidth = nodeWidth - (dimensions.width < 600 ? 6 : 8); // padding
                                                        const availableHeight = nodeHeight - (dimensions.width < 600 ? 25 : 35); // space for title
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
                                                                        x={node.x0 + (dimensions.width < 600 ? 3 : 4)}
                                                                        y={node.y0 + (dimensions.width < 600 ? 25 : 30) + (lineIndex * lineHeight)}
                                                                        fontSize={fontSize}
                                                                        fill="white"
                                                                        style={{
                                                                            pointerEvents: 'none',
                                                                            userSelect: 'none'
                                                                        }}
                                                                    >
                                                                        {/* {line}
                                                                        {lineIndex === maxLines - 1 && lines.length > maxLines && '...'} */}
                                                                    </text>
                                                                ))}
                                                            </g>
                                                        );
                                                    })()
                                                )}

                                                {/* Group labels for non-leaf nodes */}
                                                {!isLeaf && nodeWidth > (dimensions.width < 600 ? 40 : 30) && nodeHeight > (dimensions.width < 600 ? 25 : 20) && (
                                                    <text
                                                        x={node.x0 + nodeWidth / 2}
                                                        y={node.y0 + nodeHeight / 2}
                                                        fontSize={Math.min(nodeWidth / (dimensions.width < 600 ? 12 : 10), dimensions.width < 600 ? 14 : 16)}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fill="#333"
                                                        fontWeight="normal"
                                                        style={{
                                                            pointerEvents: 'none',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        {node.data?.name} {(node.value)}
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