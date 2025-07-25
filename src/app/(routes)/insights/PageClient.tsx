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
    return (
        <div className="px-[10%]">
            <Insight components={components} concepts={concepts} data={initialData} statistics={statistics} programming_languages={pl} num_packages={num_packages} data_types={data_types} />
        </div>
    );
}