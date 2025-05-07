import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ConsentState {
    isTracking: boolean;
    setTracking: (value: boolean) => void;
}

export const useConsentStore = create<ConsentState>()(
    persist(
        (set) => ({
            isTracking: true,
            setTracking: (value) => set({ isTracking: value }),
        }),
        {
            name: 'matomo-consent-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);