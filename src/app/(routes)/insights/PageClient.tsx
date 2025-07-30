"use client";
import Insight from '@/app/components/insight/Insight';

type PaperClientProps = {
    initialData: any;
};

export default function PageClient({ initialData }: PaperClientProps) {
    const statistics = initialData.items.statistics
    const pl = initialData.items.num_programming_languages
    const num_packages = initialData.items.num_packages
    const data_types = initialData.items.data_types
    const components = initialData.items.components
    const concepts = initialData.items.concepts
    const articles_statements_per_month = initialData.items.articles_statements_per_month
    return (
        <div className="px-[10%]">
            <Insight articles_statements_per_month={articles_statements_per_month} all_components={components} all_concepts={concepts} data={initialData} statistics={statistics} programming_languages={pl} num_packages={num_packages} data_types={data_types} />
        </div>
    );
}