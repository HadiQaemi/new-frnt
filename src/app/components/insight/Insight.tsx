'use client';

import React, { useEffect, useState } from "react";
import WordCloudChart from "./InsightCharts/WordCloudChart";
import PieChart from "./InsightCharts/PieChart";
import BarChart from "./InsightCharts/BarChart";
import DualLineChart from "./InsightCharts/DualLineChart";
import MultiSelect, { ResearchField } from "../shared/MultiSelect";
import { REBORN_API_URL } from "@/app/lib/config/constants";

interface InsightProps {
    data: any;
    statistics: any;
    programming_languages: any;
    num_packages: any;
    data_types: any;
    all_components: any;
    all_concepts: any;
    articles_statements_per_month: any;
}


export default function Insight({ all_concepts, all_components, statistics, programming_languages, num_packages, data_types, articles_statements_per_month }: InsightProps) {
    const [components, setComponents] = useState(all_components);
    const [concepts, setConcepts] = useState(all_concepts);
    const [selectedResearchFieldsConcepts, setSelectedResearchFieldsConcepts] = useState<ResearchField[]>([]);
    const [selectedResearchFieldsComponents, setSelectedResearchFieldsComponents] = useState<ResearchField[]>([]);
    const buildQueryParams = (query: any[]) => {
        const ids = query.map(item => item.research_field_id);
        const queryParams = ids.map(id => `research_fields=${id}`).join('&');
        return queryParams;
    };
    const fetchData = async (servie: string, query: any[]) => {
        try {
            const queryParams = buildQueryParams(query);
            let url = `${REBORN_API_URL}/insight/${servie}/?${queryParams}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            console.log(false);
        }
    };
    useEffect(() => {
        if (selectedResearchFieldsComponents.length) {
            fetchData("get_research_components", selectedResearchFieldsComponents).then((data) => {
                setComponents(data.items)
            });
        } else {
            setComponents(all_components)
        }
        if (selectedResearchFieldsConcepts.length) {
            fetchData("get_research_concepts", selectedResearchFieldsConcepts).then((data) => {
                setConcepts(data.items)
            });
        } else {
            setConcepts(all_concepts)
        }
    }, [selectedResearchFieldsComponents, selectedResearchFieldsConcepts]);
    return (
        <div className="max-w-6xl mx-auto p-5">
            <div className="text-center mt-4 mb-8">
                <h1 className="text-4xl font-bold mb-2">Insights</h1>
            </div>
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
                <div className="p-2 mb-4 border-t border-r border-b border-[#0041a8] border-l-[10px] border-l-[#0041a8] my-1 h-[350px]">
                    <span className={`bg-[#0041a8] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                        Monthly Articles and Statements
                    </span>
                    <div>
                        <DualLineChart data={articles_statements_per_month} />
                    </div>
                </div>
            </div>
            <div className="my-6">
                <div className="p-2 mb-4 border-t border-r border-b border-[#e86161] border-l-[10px] border-l-[#e86161] my-1">
                    <span className={`bg-[#e86161] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                        Programming languages
                    </span>
                    <div className="grid justify-center items-center mx-auto my-0 h-[450px] mb-5">
                        <PieChart width={400} height={400} data={programming_languages} />
                    </div>

                    <div className="p-2 mb-4 border-t border-r border-b border-[#ff7f0e] border-l-[10px] border-l-[#ff7f0e] my-1 h-[350px]">
                        <span className={`bg-[#ff7f0e] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                            R packages
                        </span>
                        <div>
                            <BarChart chartData={num_packages["R"]} color="#ff7f0e" hover="#cb640a" />
                        </div>
                    </div>
                    <div className="p-2 mb-4 border-t border-r border-b border-[#1f77b4] border-l-[10px] border-l-[#1f77b4] my-1 h-[350px]">
                        <span className={`bg-[#1f77b4] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                            Python packages
                        </span>
                        <div>
                            <BarChart chartData={num_packages["Python"]} color="#1f77b4" hover="#0e4871" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="my-6">
                <div className="p-2 mb-4 border-t border-r border-b border-[#68cbb0] border-l-[10px] border-l-[#68cbb0] my-1">
                    <span className={`bg-[#68cbb0] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                        Data types
                    </span>
                    <div>
                        <BarChart chartData={data_types} />
                    </div>
                </div>
            </div>
            <div className="my-6">
                <div className="p-2 mb-4 border-t border-r border-b border-[#9467bd] border-l-[10px] border-l-[#9467bd] my-1">
                    <span className={`bg-[#9467bd] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                        Concepts
                    </span>
                    <MultiSelect
                        selectedFields={selectedResearchFieldsConcepts}
                        onChange={setSelectedResearchFieldsConcepts}
                        placeholder="Select research fields..."
                    />
                    <WordCloudChart words={concepts} />
                </div>
            </div>
            <div className="my-6">
                <div className="p-2 mb-4 border-t border-r border-b border-[#8c564b] border-l-[10px] border-l-[#8c564b] my-1">
                    <span className={`bg-[#8c564b] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                        Components
                    </span>
                    <MultiSelect
                        selectedFields={selectedResearchFieldsComponents}
                        onChange={setSelectedResearchFieldsComponents}
                        placeholder="Select research fields..."
                    />
                    <WordCloudChart words={components} />
                </div>
            </div>
        </div>
    );
};