'use client';

import React, { useMemo, useState } from "react";
import LanguagePieChart from "./InsightCharts/LanguagePieChart";
import InsightBarChart from "./InsightCharts/InsightBarChart";
import { Wordcloud } from '@visx/wordcloud';
import { scaleLog, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import WordCloudChart from "./InsightCharts/WordCloudChart";

interface InsightProps {
    data: any;
    statistics: any;
    programming_languages: any;
    num_packages: any;
    data_types: any;
    components: any;
    concepts: any;
}

type WordData = {
    text: string;
    value: number;
};

export default function Insight({ components, concepts, statistics, programming_languages, num_packages, data_types }: InsightProps) {
    const words: WordData[] = [
        { text: 'Next.js', value: 1000 },
        { text: 'React', value: 800 },
        { text: 'TypeScript', value: 600 },
        { text: 'Visx', value: 400 },
        { text: 'WordCloud', value: 300 },
        { text: 'Frontend', value: 200 },
        { text: 'JavaScript', value: 150 },
        { text: 'D3', value: 100 },
        { text: 'WebDev', value: 80 },
        { text: 'Visualization', value: 60 },
    ];
    const width = 700;
    const height = 400;
    const fontScale = scaleLog()
        .domain([Math.min(...words.map(w => w.value)), Math.max(...words.map(w => w.value))])
        .range([12, 60]);
    const colorScale = scaleOrdinal(schemeCategory10);
    const [selectedWord, setSelectedWord] = useState<any>(null);
    const stableRandom = useMemo(() => Math.random(), []);
    const seededRandom = () => stableRandom;
    return (
        <>
            <div className="text-center mt-4 mb-8">
                <h1 className="text-4xl font-bold mb-2">Insights</h1>
            </div>
            <div className="container mx-auto px-4 mb-6">
                <div className="my-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(statistics).map(([label, value]: [any, any], index) => (
                            <div
                                key={index}
                                className="p-6 bg-gray-100 border border-[#e9ebf2] text-center"
                            >
                                <div className="text-3xl font-bold text-gray-800">
                                    {value}
                                </div>
                                <div className="text-xl text-gray-600 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="my-6">
                    <div className="bg-white border border-[#e9ebf2] rounded grid gap-4 p-4">
                        <div className="justify-center h-[250px] mb-5">
                            <div className="text-2xl mb-3 text-center">Languages</div>
                            <LanguagePieChart chartData={programming_languages} />
                        </div>

                        <div className="grid grid-rows-2 gap-4 h-[500px]">
                            <div>
                                <div className="text-2xl mb-3 text-center">R packages</div>
                                <InsightBarChart
                                    chartData={num_packages["R"]}
                                    color={"#f2afb2"}
                                    fillColor={"#bab8e1"}
                                />
                            </div>
                            <div>
                                <div className="text-2xl mb-3 text-center">Python packages</div>
                                <InsightBarChart
                                    chartData={num_packages["Python"]}
                                    color={"#68cbb0"}
                                    fillColor={"#70ebce"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-6">
                    <div className="bg-white text-center rounded border border-[#e9ebf2] p-4">
                        <div className="text-2xl mb-3">
                            Data types
                        </div>
                        <div className="h-[400px]">
                            <InsightBarChart chartData={data_types} color={'#68cbb0'} fillColor={'#68cbb0'} />
                        </div>
                    </div>
                </div>
                <WordCloudChart words={concepts} />
            </div>
        </>
    );
};