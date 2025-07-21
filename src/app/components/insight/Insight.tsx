import React, { useState } from "react";
import LanguagePieChart from "./InsightCharts/LanguagePieChart";
import InsightBarChart from "./InsightCharts/InsightBarChart";

interface ChartDataItem {
    name: string;
    count: number;
}

interface ChartData {
    [key: string]: ChartDataItem[];
}

interface DataFile {
    message: {
        articles: string;
        statements: string;
        journals: string;
        authors: string;
        language_usage: ChartDataItem[];
        python_packages: ChartDataItem[];
        r_packages: ChartDataItem[];
        data_type_usage: ChartDataItem[];
    };
}

interface InsightProps {
    data: any;
    statistics: any;
    programming_languages: any;
    num_packages: any;
    data_types: any;
}

export default function Insight({ data, statistics, programming_languages, num_packages, data_types }: InsightProps) {
    const [pythonSelected, setPythonSelected] = useState<boolean>(false);

    return (
        <>
            <div className="text-center mt-4 mb-8">
                <h1 className="text-4xl font-bold mb-2">Insight</h1>
                <h3 className="text-lg text-gray-600">Insight to the data in the reborn database</h3>
            </div>
            <div className="container mx-auto px-4 mb-6">
                <div className="my-4">
                    <h3 className="text-2xl font-semibold mb-4">General statistics:</h3>
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
                    <h3 className="text-2xl font-semibold mb-4">Code package statistics:</h3>
                    <div className="bg-white border border-[#e9ebf2] rounded p-4 grid md:grid-cols-3 gap-4">
                        <div className="h-[400px]">
                            <div className="text-2xl mb-3">Language of the packages:</div>
                            <LanguagePieChart
                                chartData={programming_languages}
                                selectionChangeFunction={setPythonSelected}
                            />
                        </div>
                        <div className="h-[400px] col-span-2">
                            <div className="text-2xl mb-3">
                                Top {pythonSelected ? "Python" : "R"} packages:
                            </div>
                            <InsightBarChart
                                chartData={
                                    pythonSelected
                                        ? num_packages["Python"]
                                        : num_packages["R"]
                                }
                                color={
                                    pythonSelected
                                        ? "#68cbb0"
                                        : "#f2afb2"
                                }
                                fillColor={
                                    pythonSelected
                                        ? "#70ebce"
                                        : "#bab8e1"
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="my-6">
                    <div className="bg-white rounded border border-[#e9ebf2] p-4">
                        <div className="text-2xl mb-3">
                            reborn{" "}
                            <a
                                className="text-blue-600 hover:underline"
                                href="https://reborn.orkg.org/pages/help"
                            >
                                data types
                            </a>{" "}
                            usage:
                        </div>
                        <div className="h-[400px]">
                            <InsightBarChart chartData={data_types} color={'#68cbb0'} fillColor={'#68cbb0'} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};