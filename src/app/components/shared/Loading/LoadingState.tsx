import React from 'react';
import StatementSkeleton from './StatementSkeleton';

const LoadingState = () => {
    return (
        <div className="animate-fade-in">
            <div className="flex items-center space-x-2 mb-6">
                <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>
            <StatementSkeleton />
        </div>
    );
};

export default LoadingState;