import { useState } from 'react';
import KpiCard from '../components/KpiCard';
import QuestionInput from '../components/QuestionInput';
import ExecutiveSummary from '../components/ExecutiveSummary';
import ScoreTable from '../components/ScoreTable';
import RauisBarChart from '../components/RauisBarChart';
import GrowthLineChart from '../components/GrowthLineChart';
import CountryPieChart from '../components/CountryPieChart';
import RiskPanel from '../components/RiskPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import FinalRecommendation from '../components/FinalRecommendation';
import ErrorBanner from '../components/ErrorBanner';
import { mockKpiData, mockAnalysisResponse } from '../data/mockData';
import { askQuestion } from '../api/askService';
import { transformScoreBreakdown, transformToChartData } from '../utils/transformers';
import { AnalysisResponse } from '../types';

export default function Dashboard() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setShowResults(false);
    setError(null);
    
    try {
      const response = await askQuestion(question);
      
      const transformedData: AnalysisResponse = {
        executiveSummary: {
          title: 'Executive Summary',
          insights: response.response.executive_summary,
        },
        industryScores: transformScoreBreakdown(response.response.score_breakdown),
        rauisComparison: transformToChartData(response.response.score_breakdown),
        unicornGrowth: mockAnalysisResponse.unicornGrowth,
        countryDiversification: mockAnalysisResponse.countryDiversification,
        risks: response.response.risk_analysis.map((risk, index) => ({
          id: String(index + 1),
          name: risk,
          level: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
          description: risk,
        })),
        finalRecommendation: response.response.final_recommendation,
      };
      
      setAnalysisData(transformedData);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze question');
      setAnalysisData(mockAnalysisResponse);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Market Intelligence Dashboard</h1>
        <p className="text-gray-400">Real-time insights into unicorn market dynamics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {mockKpiData.map((kpi) => (
          <KpiCard key={kpi.id} data={kpi} />
        ))}
      </div>

      <QuestionInput
        question={question}
        onQuestionChange={setQuestion}
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
      />

      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      {isLoading && <LoadingSpinner />}

      {showResults && !isLoading && analysisData && (
        <div className="space-y-8">
          <ExecutiveSummary data={analysisData.executiveSummary} />

          <ScoreTable data={analysisData.industryScores} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RauisBarChart data={analysisData.rauisComparison} />
            <GrowthLineChart data={analysisData.unicornGrowth} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CountryPieChart data={analysisData.countryDiversification} />
            </div>
            <div className="space-y-6">
              <RiskPanel risks={analysisData.risks} />
              <FinalRecommendation recommendation={analysisData.finalRecommendation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
