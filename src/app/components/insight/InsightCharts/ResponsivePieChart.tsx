"use client";

import React, { useRef, useState, useEffect } from "react";
import PieChart from "./PieChart"; // your existing PieChart component

type PieChartData = {
    label: string;
    count: number;
};

interface ResponsivePieChartProps {
    data: PieChartData[];
    minHeight?: number;
}

const ResponsivePieChart: React.FC<ResponsivePieChartProps> = ({
    data,
    minHeight = 320,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState<{ width: number; height: number }>({
        width: 320,
        height: minHeight,
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect) {
                    setSize({
                        width: entry.contentRect.width,
                        height: minHeight,
                    });
                }
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [minHeight]);

    return (
        <div ref={containerRef}>
            {size.width > 0 && (
                <PieChart data={data} width={size.width} height={size.height} />
            )}
        </div>
    );
};

export default ResponsivePieChart;
