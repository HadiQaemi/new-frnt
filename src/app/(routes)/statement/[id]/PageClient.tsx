"use client";
import ErrorState from '@/app/components/shared/Loading/ErrorState';
import LoadingState from '@/app/components/shared/Loading/LoadingState';
import StatementList from '@/app/components/statements/StatementList';
import { getStatement } from '@/app/lib/api/statements';

type PaperClientProps = {
    id: string;
};

export default function PageClient({ id }: PaperClientProps) {
    const { data, isLoading, isError } = getStatement(id);
    return (
        <main className="w-full mx-auto p-4 pb-[50px] min-h-[calc(100vh-18.9rem)] lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
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