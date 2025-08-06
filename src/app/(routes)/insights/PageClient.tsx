"use client";
import Insight from '@/app/components/insight/Insight';

type PaperClientProps = {
    initialData: any;
};

export default function PageClient({ initialData }: PaperClientProps) {
    const statistics = initialData.items.statistics
    const programming_languages_with_usage = initialData.items.programming_languages_with_usage
    const packages_with_usage = initialData.items.packages_with_usage
    const data_types_with_usage = initialData.items.data_types_with_usage
    const components_with_usage = initialData.items.components_with_usage
    const concepts_with_usage = initialData.items.concepts_with_usage
    const articles_statements_per_month = initialData.items.articles_statements_per_month
    return (
        <div className="px-[10%]">
            <Insight
                articles_statements_per_month={articles_statements_per_month}
                components_with_usage={components_with_usage}
                concepts_with_usage={concepts_with_usage}
                data={initialData}
                all_statistics={statistics}
                programming_languages_with_usage={programming_languages_with_usage}
                packages_with_usage={packages_with_usage}
                data_types_with_usage={data_types_with_usage} />
        </div>
    );
}