import { useEffect, useRef } from 'react';
import { init, push } from '@socialgouv/matomo-next';
import { useConsentStore } from '../(routes)/Matomo/consentStore';

const GLOBAL_MATOMO_STATE = {
    isInitialized: false,
    currentConsent: false,
};

export const useMatomoInit = () => {
    const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_TRACKER_URL;
    const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_TRACKER_SITE_ID;
    const isTracking = useConsentStore((state) => state.isTracking);

    useEffect(() => {
        if (!MATOMO_URL || !MATOMO_SITE_ID) return;

        if (!GLOBAL_MATOMO_STATE.isInitialized) {
            init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID });
            GLOBAL_MATOMO_STATE.isInitialized = true;
        }

        if (GLOBAL_MATOMO_STATE.currentConsent !== isTracking) {
            if (isTracking) {
                push(['setConsentGiven']);
            } else {
                push(['forgetConsentGiven']);
            }
            GLOBAL_MATOMO_STATE.currentConsent = isTracking;
        }

        return () => {
            if (GLOBAL_MATOMO_STATE.isInitialized) {
                push(['HeatmapSessionRecording::disable']);
            }
        };
    }, [MATOMO_URL, MATOMO_SITE_ID, isTracking]);
};

