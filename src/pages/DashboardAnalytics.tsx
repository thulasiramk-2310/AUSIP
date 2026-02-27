import KpiCard from '../components/KpiCard';
import ScoreTable from '../components/ScoreTable';
import RauisBarChart from '../components/RauisBarChart';
import GrowthLineChart from '../components/GrowthLineChart';
import CountryPieChart from '../components/CountryPieChart';
import { useAnalysis } from '../context/AnalysisContext';
import { Sparkles } from 'lucide-react';

export default function DashboardAnalytics() {
  const { analysisData, kpiData, lastQuestion } = useAnalysis();

  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Market Intelligence Dashboard</h1>
        <p className="text-gray-400">Real-time insights into unicorn market dynamics</p>
      </div>

      {/* AI Question Banner */}
      {lastQuestion && (
        <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-purple-400 mb-1">AI Analysis for:</p>
              <p className="text-white">{lastQuestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Executive Summary */}
      {analysisData.executiveSummary && (
        <div className="mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            {analysisData.executiveSummary.title}
          </h2>
          <div className="space-y-2">
            {analysisData.executiveSummary.insights.map((insight, idx) => (
              <p key={idx} className="text-gray-300 leading-relaxed">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Score Table */}
      <ScoreTable data={analysisData.industryScores} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <RauisBarChart data={analysisData.rauisComparison} />
        <GrowthLineChart data={analysisData.unicornGrowth} />
      </div>

      {/* Geographic Distribution */}
      <div className="mt-8">
        <CountryPieChart data={analysisData.countryDiversification} />
      </div>

      {/* Risk Analysis */}
      {analysisData.risks && analysisData.risks.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {analysisData.risks.map((risk) => (
            <div
              key={risk.id}
              className="bg-[#27272A] rounded-xl p-6 border-l-4"
              style={{
                borderColor:
                  risk.level === 'high'
                    ? '#EF4444'
                    : risk.level === 'medium'
                    ? '#F59E0B'
                    : '#10B981',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{risk.name}</h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    risk.level === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : risk.level === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {risk.level.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-400">{risk.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Final Recommendation */}
      {analysisData.finalRecommendation && (
        <div className="mt-8 bg-[#27272A] rounded-2xl p-6 border border-green-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Final Recommendation</h2>
          <p className="text-gray-300 leading-relaxed">{analysisData.finalRecommendation}</p>
        </div>
      )}
    </div>
  );
}
