import { useEffect, useState, useRef } from 'react';
import type { KpiData } from '../types';

interface KpiCardProps {
    data: KpiData;
    delay?: number;
}

function useCountUp(end: number, duration = 1500, delay = 0) {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const startTime = performance.now();
            const animate = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setCount(eased * end);
                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(animate);
                }
            };
            frameRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(frameRef.current);
        };
    }, [end, duration, delay]);

    return count;
}

const TrendIcon = ({ trend }: { trend: KpiData['trend'] }) => {
    if (trend === 'up') {
        return (
            <svg className="w-4 h-4 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
        );
    }
    if (trend === 'down') {
        return (
            <svg className="w-4 h-4 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        );
    }
    return (
        <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
    );
};

export default function KpiCard({ data, delay = 0 }: KpiCardProps) {
    const isNumber = typeof data.value === 'number';
    const animatedValue = useCountUp(isNumber ? (data.value as number) : 0, 1500, delay);

    const displayValue = isNumber
        ? Number.isInteger(data.value)
            ? Math.round(animatedValue).toLocaleString()
            : animatedValue.toFixed(1)
        : data.value;

    return (
        <div className="group bg-[#1E293B] rounded-2xl p-6 shadow-xl border border-[#334155]/50 hover:border-[#3B82F6]/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default">
            <p className="text-sm font-medium text-[#94A3B8] mb-1 tracking-wide uppercase">
                {data.label}
            </p>
            <p className="text-3xl font-bold text-white mt-2 mb-3 tracking-tight">
                {displayValue}
            </p>
            <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748B]">{data.subtitle}</p>
                <div className="flex items-center gap-1">
                    <TrendIcon trend={data.trend} />
                    <span className={`text-xs font-semibold ${data.trend === 'up' ? 'text-[#22C55E]' : data.trend === 'down' ? 'text-[#EF4444]' : 'text-[#94A3B8]'
                        }`}>
                        {data.trendValue}
                    </span>
                </div>
            </div>
        </div>
    );
}
