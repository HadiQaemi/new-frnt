'use client';

import React, { useMemo, useState } from "react";
import LanguagePieChart from "./InsightCharts/LanguagePieChart";
import InsightBarChart from "./InsightCharts/InsightBarChart";
import { Wordcloud } from '@visx/wordcloud';
import { scaleLog, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import WordCloudChart from "./InsightCharts/WordCloudChart";
import PieChart from "./InsightCharts/PieChart";
import BarChart from "./InsightCharts/BarChart";

interface InsightProps {
    data: any;
    statistics: any;
    programming_languages: any;
    num_packages: any;
    data_types: any;
    components: any;
    concepts: any;
}

export default function Insight({ concepts, components, statistics, programming_languages, num_packages, data_types }: InsightProps) {
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
                        <div className="justify-center items-center mx-auto my-0 h-[450px] mb-5">
                            <div className="text-2xl mb-3 text-center">Languages</div>
                            <PieChart width={400} height={400} data={programming_languages} />
                        </div>

                        <div className="grid grid-rows-2 gap-4 h-[700px]">
                            <div>
                                <div className="text-2xl mb-3 text-center">R packages</div>
                                <BarChart chartData={num_packages["R"]} color="#ff7f0e" hover="#cb640a" />
                            </div>
                            <div>
                                <div className="text-2xl mb-3 text-center">Python packages</div>
                                <BarChart chartData={num_packages["Python"]} color="#1f77b4" hover="#0e4871" />
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
                            <BarChart chartData={data_types} />
                        </div>
                    </div>
                </div>
                <div className="my-6">
                    <div className="text-2xl mb-3 text-center">
                        Concepts
                    </div>
                    <WordCloudChart words={concepts} />
                </div>
                <div className="my-6">
                    <div className="text-2xl mb-3 text-center">
                        Components
                    </div>
                    <WordCloudChart words={components} />
                </div>
            </div>
        </>
    );
};