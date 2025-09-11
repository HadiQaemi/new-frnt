'use client';

import React, { useEffect, useState } from "react";
import WordCloudChart from "./InsightCharts/WordCloudChart";
import BarChart from "./InsightCharts/BarChart";
import DualLineChart from "./InsightCharts/DualLineChart";
import MultiSelect, { ResearchField } from "../shared/MultiSelect";
import { REBORN_API_URL } from "@/app/lib/config/constants";
import ResponsivePieChart from "./InsightCharts/ResponsivePieChart";
import TreemapChart from "./InsightCharts/TreemapChart";

interface InsightProps {
    data: any;
    all_statistics: any;
    programming_languages_with_usage: any;
    packages_with_usage: any;
    data_types_with_usage: any;
    components_with_usage: any;
    concepts_with_usage: any;
    articles_statements_per_month: any;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Insight(
    {
        concepts_with_usage,
        components_with_usage,
        all_statistics,
        programming_languages_with_usage,
        packages_with_usage,
        data_types_with_usage,
        articles_statements_per_month
    }: InsightProps) {

    // Initialize with default empty values to prevent null access
    const [concepts, setConcepts] = useState(concepts_with_usage || {});
    const [components, setComponents] = useState(components_with_usage || {});
    const [programmingLanguages, setProgrammingLanguages] = useState(programming_languages_with_usage || {});
    const [packages, setPackages] = useState(packages_with_usage || {});
    const [dataTypes, setDataTypes] = useState(data_types_with_usage || {});
    const [articlesStatementsPerMonth, setArticlesStatementsPerMonth] = useState(articles_statements_per_month || []);
    const [statistics, setStatistics] = useState(all_statistics || {});
    const [selectedResearchFieldsConcepts, setSelectedResearchFieldsConcepts] = useState<ResearchField[]>([]);
    const [selectedResearchFieldsComponents, setSelectedResearchFieldsComponents] = useState<ResearchField[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buildQueryParams = (query: any[]) => {
        const ids = query.map(item => item.research_field_id);
        const queryParams = ids.map(id => `research_fields=${id}`).join('&');
        return queryParams;
    };

    const fetchData = async (query: any[]) => {
        // Skip API calls during build time (when window is undefined)
        if (typeof window === 'undefined') {
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const queryParams = buildQueryParams(query);
            let url = `${REBORN_API_URL}/insight/get_research_insights/?${queryParams}`;

            const response = await fetch(url, {
                cache: 'no-store',
                // Add timeout and better error handling
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data || typeof data !== "object") {
                throw new Error('Invalid response format');
            }

            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
            return { items: [] };
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedResearchFieldsConcepts.length) {
            fetchData(selectedResearchFieldsConcepts).then((data) => {
                if (!data || !data.items) {
                    return;
                }
                const { items } = data;
                setConcepts(items.concepts_with_usage || {});
                setComponents(items.components_with_usage || {});
                setProgrammingLanguages(items.programming_languages_with_usage || {});
                setPackages(items.packages_with_usage || {});
                setDataTypes(items.data_types_with_usage || {});
                setArticlesStatementsPerMonth(items.articles_statements_per_month || []);
                setStatistics(items.statistics || {});
            });
        } else {
            setConcepts(concepts_with_usage || {});
            setComponents(components_with_usage || {});
            setProgrammingLanguages(programming_languages_with_usage || {});
            setPackages(packages_with_usage || {});
            setDataTypes(data_types_with_usage || {});
            setArticlesStatementsPerMonth(articles_statements_per_month || []);
            setStatistics(all_statistics || {});
        }
    }, [selectedResearchFieldsComponents, selectedResearchFieldsConcepts]);

    // Helper function to safely check if data exists and has content
    const hasData = (data: any) => {
        if (!data) return false;
        if (Array.isArray(data)) return data.length > 0;
        if (typeof data === 'object') return Object.keys(data).length > 0;
        return false;
    };

    return (
        <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mt-4 mb-8">
                <h1 className="text-4xl font-bold mb-2">Insights</h1>
            </div>

            <div className="mt-4 mb-8">
                <MultiSelect
                    selectedFields={selectedResearchFieldsConcepts}
                    onChange={setSelectedResearchFieldsConcepts}
                    placeholder="Select research fields..."
                />
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    Error loading data: {error}
                </div>
            )}

            {isLoading && (
                <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    Loading insights...
                </div>
            )}

            <div className="my-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(statistics).map(([label, value]: [any, any], index) => (
                        <div
                            key={index}
                            className="p-6 bg-gray-100 border border-[#e9ebf2] text-center"
                        >
                            <div className="text-3xl font-bold text-gray-800">
                                {value || 0}
                            </div>
                            <div className="text-xl text-gray-600 mt-1">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto py-5">
                {hasData(articlesStatementsPerMonth) && (
                    <div className="my-6">
                        <div className="p-2 mb-4 border-t border-r border-b border-[#0041a8] border-l-[10px] border-l-[#0041a8] my-1 min-h-[350px]">
                            <span className={`bg-[#0041a8] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                                Trends
                            </span>
                            <div>
                                <DualLineChart data={articlesStatementsPerMonth} />
                            </div>
                        </div>
                    </div>
                )}

                {hasData(programmingLanguages) && (
                    <div className="my-6">
                        <div className="p-2 mb-4 border-t border-r border-b border-[#e86161] border-l-[10px] border-l-[#e86161] my-1">
                            <span className={`bg-[#e86161] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                                Programming languages
                            </span>
                            <div className="grid justify-center items-center mx-auto my-0 h-[450px] mb-5">
                                <ResponsivePieChart data={programmingLanguages} />
                            </div>

                            {packages?.["R"] && hasData(packages["R"]) && (
                                <div className="p-2 mb-4 border-t border-r border-b border-[#ff7f0e] border-l-[10px] border-l-[#ff7f0e] my-1 h-[350px]">
                                    <span className={`bg-[#ff7f0e] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                                        R packages
                                    </span>
                                    <div>
                                        <BarChart chartData={packages["R"]} color="#ff7f0e" hover="#cb640a" />
                                    </div>
                                </div>
                            )}

                            {packages?.["Python"] && hasData(packages["Python"]) && (
                                <div className="p-2 mb-4 border-t border-r border-b border-[#1f77b4] border-l-[10px] border-l-[#1f77b4] my-1 h-[350px]">
                                    <span className={`bg-[#1f77b4] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                                        Python packages
                                    </span>
                                    <div>
                                        <BarChart chartData={packages["Python"]} color="#1f77b4" hover="#0e4871" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasData(dataTypes) && (
                    <div className="my-6">
                        <div className="p-2 mb-4 border-t border-r border-b border-[#68cbb0] border-l-[10px] border-l-[#68cbb0] my-1">
                            <span className={`bg-[#68cbb0] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                                Data types
                            </span>
                            <div>
                                <BarChart chartData={dataTypes} />
                            </div>
                        </div>
                    </div>
                )}

                {hasData(concepts) && (
                    <div className="my-6">
                        <div className="p-2 mb-4 border-t border-r border-b border-[#9467bd] border-l-[10px] border-l-[#9467bd] my-1">
                            <span className={`bg-[#9467bd] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                                Concepts
                            </span>
                            <TreemapChart words={concepts} width={900} height={600} />
                        </div>
                    </div>
                )}

                {hasData(components) && (
                    <div className="my-6">
                        <div className="p-2 mb-4 border-t border-r border-b border-[#8c564b] border-l-[10px] border-l-[#8c564b] my-1">
                            <span className={`bg-[#8c564b] relative -top-[18px] -left-[18px] p-1 text-[12px] text-white pl-4`}>
                                Components
                            </span>
                            <TreemapChart words={components} width={900} height={600} />
                        </div>
                    </div>
                )}

                {/* Show message when no data is available */}
                {!hasData(programmingLanguages) && !hasData(dataTypes) && !hasData(concepts) && !hasData(components) && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                        No insights data available. Try selecting some research fields above.
                    </div>
                )}
            </div>
        </div>
    );
};