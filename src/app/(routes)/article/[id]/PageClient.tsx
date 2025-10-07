"use client";
import StatementList from '@/app/components/statements/StatementList';

type PaperClientProps = {
    initialData: any;
    id: string;
};

export default function PageClient({ initialData, id }: PaperClientProps) {
    return (
        <main className="w-full mx-auto pb-[50px] min-h-[calc(100vh-18.9rem)] lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl pt-[20px]">
            <StatementList data={initialData} statements={initialData.statements} isOpenSideSearch={false} />
        </main>
    );
}