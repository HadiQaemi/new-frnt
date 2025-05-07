'use client';

import { ConsentCheckbox } from '@/app/components/shared/ConsentCheckbox';
import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const RichTextRenderer = ({ htmlContent }: { htmlContent: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = htmlContent;

            const placeholder = containerRef.current.querySelector('#consent-checkbox-placeholder');
            if (placeholder) {
                const root = createRoot(placeholder);
                root.render(<ConsentCheckbox />);
            }
        }
    }, [htmlContent]);

    return <div className="px-[10%]" ref={containerRef} />;
};

export default RichTextRenderer;