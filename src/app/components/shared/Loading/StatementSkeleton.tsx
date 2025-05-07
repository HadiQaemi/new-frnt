import React from 'react';

const StatementSkeleton = () => {
    return (
        <div className="flex gap-4 animate-fade-in">
            <div className="w-[30%] bg-white rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
                            <div className="h-10 bg-gray-100 rounded w-full border border-gray-200"></div>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-6">
                        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div className="w-[70%] space-y-4">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatementSkeleton;