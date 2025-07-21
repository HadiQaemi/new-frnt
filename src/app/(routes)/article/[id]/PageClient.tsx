"use client";
import StatementList from '@/app/components/statements/StatementList';

type PaperClientProps = {
    initialData: any;
    id: string;
};

export default function PageClient({ initialData, id }: PaperClientProps) {
    return (
        <main className="w-full mx-auto p-4 bg-[#e9ebf2] pb-[50px] min-h-[calc(100vh-18.9rem)]">
            <StatementList data={initialData} statements={initialData.statements} isOpenSideSearch={false} />
        </main>
    );
}