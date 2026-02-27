import { useState } from 'react';
import type { RiskItem } from '../types';

interface RiskPanelProps {
    risks: RiskItem[];
}

const levelColors = {
    low: 'bg-[#22C55E]',
    medium: 'bg-[#F59E0B]',
    high: 'bg-[#EF4444]',
};

const levelLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
};

export default function RiskPanel({ risks }: RiskPanelProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-[#1E293B] rounded-2xl shadow-xl border border-[#334155]/50 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between border-b border-[#334155]/50 hover:bg-[#334155]/20 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <h3 className="text-lg font-bold text-white">Risk Analysis</h3>
                </div>
                <svg
                    className={`w-5 h-5 text-[#94A3B8] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-6 space-y-4">
                    {risks.map((risk) => (
                        <div key={risk.label} className="flex items-start gap-3">
                            <span className={`flex-shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full ${levelColors[risk.level]}`} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-white">{risk.label}</p>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${risk.level === 'low' ? 'bg-[#22C55E]/15 text-[#22C55E]' :
                                            risk.level === 'medium' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                                                'bg-[#EF4444]/15 text-[#EF4444]'
                                        }`}>
                                        {levelLabels[risk.level]}
                                    </span>
                                </div>
                                <p className="text-xs text-[#94A3B8] leading-relaxed">{risk.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
