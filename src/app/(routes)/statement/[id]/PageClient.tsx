"use client";
import ErrorState from '@/app/components/shared/Loading/ErrorState';
import LoadingState from '@/app/components/shared/Loading/LoadingState';
import StatementList from '@/app/components/statements/StatementList';
import { getStatement } from '@/app/lib/api/statements';

type PaperClientProps = {
    initialData: any;
    id: string;
};

export default function PageClient({ initialData, id }: PaperClientProps) {
    const { data = initialData, isLoading, isError } = getStatement(id);
    return (
        <main className="w-full mx-auto p-4 bg-[#e9ebf2] pb-[50px] min-h-[calc(100vh-18.9rem)]">
            {isLoading ? (
                <LoadingState />
            ) : isError ? (
                <ErrorState />
            ) : !data ? (
                <div className="animate-fade-in text-center py-8 text-gray-600">
                    No statements found
                </div>
            ) : (
                <div className="animate-fade-in">
                    <StatementList data={data} statements={data.statements} isOpenSideSearch={false} statementId={id} />
                </div>
            )}
        </main>
    );
}