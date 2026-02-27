import { useState } from 'react';
import KpiCard from '../components/KpiCard';
import QuestionInput from '../components/QuestionInput';
import ExecutiveSummary from '../components/ExecutiveSummary';
import ScoreTable from '../components/ScoreTable';
import RauisBarChart from '../components/RauisBarChart';
import GrowthLineChart from '../components/GrowthLineChart';
import CountryPieChart from '../components/CountryPieChart';
import RiskPanel from '../components/RiskPanel';
import { kpiData, mockAiResponse } from '../data/mockData';
import { askQuestion } from '../data/api';
import type { AiResponse } from '../types';

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [aiResult, setAiResult] = useState<AiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAskQuestion = async (question: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await askQuestion(question);
            setAiResult(result);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-sm text-[#94A3B8] mt-1">AI-powered unicorn market intelligence at a glance.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {kpiData.map((kpi, i) => (
                    <KpiCard key={kpi.label} data={kpi} delay={i * 200} />
                ))}
            </div>

            {/* Ask AI Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-white mb-3">Ask AI</h2>
                    <QuestionInput onSubmit={handleAskQuestion} isLoading={isLoading} />
                </div>

                {error && (
                    <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl p-4 text-sm text-[#EF4444]">
                        {error}
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-10 h-10 border-3 border-[#334155] border-t-[#3B82F6] rounded-full animate-spin" />
                        <p className="text-sm text-[#94A3B8]">Analyzing market intelligence…</p>
                    </div>
                )}

                {aiResult && !isLoading && (
                    <div className="space-y-6">
                        {/* Executive Summary */}
                        <ExecutiveSummary
                            title={aiResult.summary.title}
                            insights={aiResult.summary.insights}
                        />

                        {/* Score Table */}
                        <ScoreTable data={aiResult.scores} />

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RauisBarChart data={aiResult.scores} />
                            <GrowthLineChart data={aiResult.growth} />
                        </div>

                        {/* Bottom Row: Pie Chart + Risk Panel */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CountryPieChart data={aiResult.countries} />
                            <RiskPanel risks={aiResult.risks} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
