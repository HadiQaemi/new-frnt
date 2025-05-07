'use client'

import { useMatomoInit } from "@/app/hooks/useMatomoInit";
import { usePageTracking } from "@/app/hooks/usePageTracking";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const MatomoComponent = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useMatomoInit();
    usePageTracking(pathname, searchParams.toString());

    return null;
};

export default function Matomo() {
    return (
        <Suspense>
            <MatomoComponent />
        </Suspense>
    );
}