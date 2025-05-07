import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorState = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm animate-fade-in">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Statements</h2>
            <p className="text-gray-600 mb-4 text-center">
                There was a problem loading the statements. Please try again later.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Retry
            </button>
        </div>
    );
};

export default ErrorState;