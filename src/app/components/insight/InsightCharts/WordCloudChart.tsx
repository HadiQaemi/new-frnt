'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Wordcloud } from '@visx/wordcloud';
import { scaleLog, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

type WordData = {
    text: any;
    value: any;
    definition: any;
    label: any;
};

interface WordCloudChartProps {
    words: WordData[];
}

const colorScale = scaleOrdinal(schemeCategory10);
export default function WordCloudChart({ words }: WordCloudChartProps) {
    const fontScale = scaleLog()
        .domain([Math.min(...words.map(w => w.value)), Math.max(...words.map(w => w.value))])
        .range([12, 60]);
    const width = 700;
    const height = 400;
    const [selectedWord, setSelectedWord] = useState<WordData | null>(null);

    const stableRandom = useMemo(() => Math.random(), []);
    const seededRandom = () => stableRandom;


    return (
        <div className="relative flex flex-col items-center justify-center w-full h-[500px]">
            {selectedWord && (
                <div className="absolute top-0 z-10 bg-white border rounded-md shadow-lg p-4 max-w-[50%]">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">{selectedWord.text}</h2>
                        <button
                            onClick={() => setSelectedWord(null)}
                            className="text-gray-600 hover:text-red-500 text-sm"
                        >
                            ✕
                        </button>
                    </div>
                    {selectedWord.label && (
                        <p><strong>label:</strong> {selectedWord.label}</p>
                    )}
                    {selectedWord.definition && (
                        <p><strong>definition:</strong> {selectedWord.definition}</p>
                    )}
                </div>
            )}
            <div className="relative">
                <svg width={width} height={height}>
                    <Wordcloud
                        words={words}
                        width={width}
                        height={height}
                        font="Impact"
                        fontSize={(d) => fontScale(d.value)}
                        padding={2}
                        spiral="archimedean"
                        rotate={seededRandom}
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
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
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
        </div>
    );
}
