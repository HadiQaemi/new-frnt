'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Wordcloud } from '@visx/wordcloud';
import { scaleLog, scaleOrdinal } from 'd3-scale';
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

interface WordCloudChartProps {
    words: WordData[];
}

const colorScale = scaleOrdinal(schemeCategory10);

export default function WordCloudChart({ words }: WordCloudChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 700, height: 400 });

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const updateSize = useCallback(() => {
        if (containerRef.current && isMobile) {
            const { offsetWidth } = containerRef.current;
            const height = Math.max(200, offsetWidth * 0.6);
            setDimensions({ width: offsetWidth, height });
        } else {
            setDimensions({ width: 700, height: 400 }); // fixed for desktop
        }
    }, [isMobile]);

    useEffect(() => {
        updateSize();
        if (!isMobile) return;

        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, [isMobile, updateSize]);

    const fontScale = scaleLog()
        .domain([Math.min(...words.map(w => w.value)), Math.max(...words.map(w => w.value))])
        .range([12, 60]);

    const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
    const stableRandom = useMemo(() => Math.random(), []);
    const seededRandom = () => stableRandom;

    return (
        <div
            ref={containerRef}
            className="relative flex flex-col items-center justify-center w-full h-auto mt-4"
        >
            {selectedWord && (
                <div className="absolute top-0 z-10 bg-white border rounded-md shadow-lg p-4 max-w-[90%]">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">
                            {selectedWord.label}:{' '}
                            <span className="underline font-black">{selectedWord.value}</span>
                        </h2>
                        <button
                            onClick={() => setSelectedWord(null)}
                            className="text-gray-600 hover:text-red-500 text-sm"
                        >
                            ✕
                        </button>
                    </div>
                    {selectedWord.definition && (
                        <p>
                            {selectedWord.definition}
                            {selectedWord.definition.slice(-1) === '.' ? '' : '.'}
                        </p>
                    )}
                    {selectedWord.properties != undefined && (
                        <>
                            {selectedWord.properties.length > 0 && (
                                <span>
                                    <a
                                        className="underline text-blue-600"
                                        target="_blank"
                                        href={selectedWord.properties[0].see_also}
                                    >
                                        {selectedWord.properties[0].label}
                                    </a>{' '}
                                    of{' '}
                                </span>
                            )}
                            {selectedWord.object_of_interests.length > 0 && (
                                <span>
                                    <a
                                        className="underline text-blue-600"
                                        target="_blank"
                                        href={selectedWord.object_of_interests[0].see_also}
                                    >
                                        {selectedWord.object_of_interests[0].label}
                                    </a>
                                </span>
                            )}
                            {selectedWord.operations.length > 0 && (
                                <span>
                                    {' '}
                                    in{' '}
                                    <a
                                        className="underline text-blue-600"
                                        target="_blank"
                                        href={selectedWord.operations[0].see_also}
                                    >
                                        {selectedWord.operations[0].label}
                                    </a>
                                </span>
                            )}
                            {selectedWord.matrices.length > 0 && (
                                <span>
                                    {' '}
                                    in{' '}
                                    <a
                                        className="underline text-blue-600"
                                        target="_blank"
                                        href={selectedWord.matrices[0].see_also}
                                    >
                                        {selectedWord.matrices[0].label}
                                    </a>
                                </span>
                            )}
                            {selectedWord.units.length > 0 && (
                                <span>
                                    {' '}
                                    [
                                    <a
                                        className="underline text-blue-600"
                                        target="_blank"
                                        href={selectedWord.units[0].see_also}
                                    >
                                        {selectedWord.units[0].label}
                                    </a>
                                    ]
                                </span>
                            )}
                        </>
                    )}
                </div>
            )}

            <svg width={dimensions.width} height={dimensions.height}>
                <Wordcloud
                    words={words}
                    width={dimensions.width}
                    height={dimensions.height}
                    font="Arial"
                    fontSize={(d) => fontScale(d.value)}
                    padding={2}
                    spiral="archimedean"
                    rotate={0}
                    random={seededRandom}
                >
                    {(cloudWords) =>
                        cloudWords.map((word, i) => (
                            <text
                                key={i}
                                transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                                fontSize={word.size}
                                fontFamily={word.font}
                                fill={colorScale(i.toString())}
                                textAnchor="middle"
                                style={{
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    fontWeight: '500',
                                }}
                                onClick={() => {
                                    const original = word as unknown as WordData;
                                    setSelectedWord(original);
                                }}
                            >
                                {word.text}
                            </text>
                        ))
                    }
                </Wordcloud>
            </svg>
        </div>
    );
}
