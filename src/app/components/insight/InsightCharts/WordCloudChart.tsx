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
    console.log(words)
    const fontScale = scaleLog()
        .domain([Math.min(...words.map(w => w.value)), Math.max(...words.map(w => w.value))])
        .range([12, 60]);
    const width = 700;
    const height = 400;
    const [selectedWord, setSelectedWord] = useState<WordData | null>(null);

    const stableRandom = useMemo(() => Math.random(), []);
    const seededRandom = () => stableRandom;


    return (
        <div className="relative flex flex-col items-center justify-center w-full h-[400px]">
            {selectedWord && (
                <div className="absolute top-0 z-10 bg-white border rounded-md shadow-lg p-4 max-w-[50%]">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">{selectedWord.label}: <span className="underline font-black">{selectedWord.value}</span></h2>
                        <button
                            onClick={() => setSelectedWord(null)}
                            className="text-gray-600 hover:text-red-500 text-sm"
                        >
                            ✕
                        </button>
                    </div>
                    {selectedWord.definition && (
                        <p>{selectedWord.definition}{selectedWord.definition.slice(-1) === '.' ? '' : '.'}</p>
                    )}
                    {/* {selectedWord.see_also.length > 0 && (
                        <p>See also <a className='underline text-blue-600' target="_blank" href={selectedWord.see_also}>{selectedWord.see_also}</a></p>
                    )}
                    {selectedWord.operations.length > 0 && (
                        <p>operations <a className='underline text-blue-600' target="_blank" href={selectedWord.operations[0].see_also}>{selectedWord.operations[0].label}</a></p>
                    )}
                    {selectedWord.object_of_interests.length > 0 && (
                        <p>object_of_interests <a className='underline text-blue-600' target="_blank" href={selectedWord.object_of_interests[0].see_also}>{selectedWord.object_of_interests[0].label}</a></p>
                    )}
                    {selectedWord.properties.length > 0 && (
                        <p>properties <a className='underline text-blue-600' target="_blank" href={selectedWord.properties[0].see_also}>{selectedWord.properties[0].label}</a></p>
                    )}
                    {selectedWord.units.length > 0 && (
                        <p>units<a className='underline text-blue-600' target="_blank" href={selectedWord.units[0].see_also}>{selectedWord.units[0].label}</a></p>
                    )} */}
                    {selectedWord.properties != undefined && (
                        <>
                            {selectedWord.properties.length > 0 && (
                                <span><a className='underline text-blue-600' target="_blank" href={selectedWord.properties[0].see_also}>{selectedWord.properties[0].label}</a> of </span>
                            )}
                            {selectedWord.object_of_interests.length > 0 && (
                                <span><a className='underline text-blue-600' target="_blank" href={selectedWord.object_of_interests[0].see_also}>{selectedWord.object_of_interests[0].label}</a></span>
                            )}
                            {selectedWord.operations.length > 0 && (
                                <span> in <a className='underline text-blue-600' target="_blank" href={selectedWord.operations[0].see_also}>{selectedWord.operations[0].label}</a></span>
                            )}
                            {selectedWord.matrices.length > 0 && (
                                <span> in <a className='underline text-blue-600' target="_blank" href={selectedWord.matrices[0].see_also}>{selectedWord.matrices[0].label}</a></span>
                            )}

                            {selectedWord.units.length > 0 && (
                                <span> [<a className='underline text-blue-600' target="_blank" href={selectedWord.units[0].see_also}>{selectedWord.units[0].label}</a>]</span>
                            )}
                        </>
                    )}
                </div>
            )}
            <div className="relative">
                <svg width={width} height={height}>
                    <Wordcloud
                        words={words}
                        width={width}
                        height={height}
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
                                    style={{ cursor: 'pointer', userSelect: 'none', fontWeight: '500' }}
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
