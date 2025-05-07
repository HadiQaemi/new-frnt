import { useEffect } from 'react';
import { push } from '@socialgouv/matomo-next';
import { useConsentStore } from '../(routes)/Matomo/consentStore';

export const usePageTracking = (pathname: string, searchParams: string) => {
    const isTracking = useConsentStore((state) => state.isTracking);

    useEffect(() => {
        if (!pathname || !isTracking) return;

        const url = `${pathname}${searchParams ? `?${searchParams}` : ''}`;
        push(['setCustomUrl', url]);
        push(['trackPageView']);
    }, [pathname, searchParams, isTracking]);
};