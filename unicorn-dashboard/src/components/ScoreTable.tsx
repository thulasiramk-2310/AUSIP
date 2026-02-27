import { useState, useMemo } from 'react';
import type { ScoreRow, SortDirection, SortKey } from '../types';

interface ScoreTableProps {
    data: ScoreRow[];
}

const COLUMN_HEADERS: { key: SortKey; label: string }[] = [
    { key: 'industry', label: 'Industry' },
    { key: 'baseScore', label: 'Base Score' },
    { key: 'risk', label: 'Risk' },
    { key: 'saturation', label: 'Saturation' },
    { key: 'multiplier', label: 'Multiplier' },
    { key: 'finalRauis', label: 'Final RAUIS' },
];

function getRauisColor(score: number) {
    if (score >= 85) return 'text-[#22C55E]';
    if (score >= 70) return 'text-[#3B82F6]';
    if (score >= 55) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
}

export default function ScoreTable({ data }: ScoreTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('finalRauis');
    const [sortDir, setSortDir] = useState<SortDirection>('desc');

    const sorted = useMemo(() => {
        return [...data].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
    }, [data, sortKey, sortDir]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    return (
        <div className="bg-[#1E293B] rounded-2xl shadow-xl border border-[#334155]/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#334155]/50">
                <h3 className="text-lg font-bold text-white">Score Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#334155]/50">
                            {COLUMN_HEADERS.map(({ key, label }) => (
                                <th
                                    key={key}
                                    onClick={() => handleSort(key)}
                                    className="px-6 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                                >
                                    <div className="flex items-center gap-1">
                                        {label}
                                        {sortKey === key && (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d={sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]/30">
                        {sorted.map((row) => (
                            <tr key={row.industry} className="hover:bg-[#334155]/20 transition-colors">
                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{row.industry}</td>
                                <td className="px-6 py-4 text-[#CBD5E1]">{row.baseScore}</td>
                                <td className="px-6 py-4 text-[#CBD5E1]">{row.risk}</td>
                                <td className="px-6 py-4 text-[#CBD5E1]">{row.saturation}%</td>
                                <td className="px-6 py-4 text-[#CBD5E1]">{row.multiplier.toFixed(2)}x</td>
                                <td className={`px-6 py-4 font-bold ${getRauisColor(row.finalRauis)}`}>
                                    {row.finalRauis}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
