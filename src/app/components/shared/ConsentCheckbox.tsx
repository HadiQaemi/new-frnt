'use client';

import { useConsentStore } from '@/app/(routes)/Matomo/consentStore';
import React from 'react';

export const ConsentCheckbox = () => {
    const { isTracking, setTracking } = useConsentStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTracking(e.target.checked);
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id="matomo-consent"
                checked={isTracking}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="matomo-consent" className="text-sm text-gray-900 font-bold">
                You are currently opted {isTracking ? 'in' : 'out'}. {isTracking ? 'Uncheck' : 'Check'} this box to opt-{isTracking ? 'out' : 'in'}.
            </label>
        </div>
    );
};