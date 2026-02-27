import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Award, Target, AlertTriangle, BarChart3, Filter, Search } from 'lucide-react';
import { useAnalysis, IndustryRanking } from '../context/AnalysisContext';

type SortField = keyof IndustryRanking;
type FilterCategory = 'All' | 'AI & Data' | 'Healthcare' | 'Finance' | 'Enterprise' | 'Consumer' | 'Emerging Tech';

export default function RankingsPage() {
  const { industryRankings, lastQuestion } = useAnalysis();
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryRanking | null>(null);

  // Use AI rankings if available, otherwise use mock data
  const rankings = industryRankings.length > 0 ? industryRankings : getMockRankings();
  const isAiData = industryRankings.length > 0;

  const filteredAndSortedRankings = useMemo(() => {
    let filtered = [...rankings];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.topCompanies.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [rankings, selectedCategory, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRauisColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskBadgeColor = (level: string): string => {
    if (level === 'Low') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (level === 'Medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getOutlookIcon = (outlook: string) => {
    if (outlook === 'Bullish') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (outlook === 'Bearish') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <BarChart3 className="w-4 h-4 text-blue-400" />;
  };

  const categories: FilterCategory[] = ['All', 'AI & Data', 'Healthcare', 'Finance', 'Enterprise', 'Consumer', 'Emerging Tech'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Industry Rankings</h1>
          <p className="text-gray-400">Comprehensive RAUIS-based industry analysis and investment attractiveness scores</p>
          {isAiData && lastQuestion && (
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-blue-400 text-sm">🤖 AI Analysis: "{lastQuestion.substring(0, 50)}{lastQuestion.length > 50 ? '...' : ''}"</span>
            </div>
          )}
          {!isAiData && (
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-gray-500/10 border border-gray-500/20 rounded-lg">
              <span className="text-gray-400 text-sm">📊 Showing default market overview - Ask AI a question to see custom rankings</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Top Scorer</span>
          </div>
          <p className="text-2xl font-bold text-white">{rankings[0]?.industry || 'N/A'}</p>
          <p className="text-sm text-gray-400 mt-1">RAUIS: {rankings[0]?.rauisScore || 0}</p>
        </div>
        
        <div className="bg-dark-card border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Fastest Growing</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {[...rankings].sort((a, b) => b.growthRate - a.growthRate)[0]?.industry || 'N/A'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            +{[...rankings].sort((a, b) => b.growthRate - a.growthRate)[0]?.growthRate || 0}% YoY
          </p>
        </div>
        
        <div className="bg-dark-card border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Industries</span>
          </div>
          <p className="text-2xl font-bold text-white">{rankings.length}</p>
          <p className="text-sm text-gray-400 mt-1">Tracked Sectors</p>
        </div>
        
        <div className="bg-dark-card border border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">High Risk</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {rankings.filter(r => r.riskLevel === 'High').length}
          </p>
          <p className="text-sm text-gray-400 mt-1">Industries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search industries or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-dark-card border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <button onClick={() => handleSort('rank')} className="flex items-center space-x-1 hover:text-white">
                    <span>Rank</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  <button onClick={() => handleSort('industry')} className="flex items-center space-x-1 hover:text-white">
                    <span>Industry</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                  <button onClick={() => handleSort('rauisScore')} className="flex items-center justify-end space-x-1 hover:text-white w-full">
                    <span>RAUIS Score</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                  <button onClick={() => handleSort('unicornCount')} className="flex items-center justify-end space-x-1 hover:text-white w-full">
                    <span>Unicorns</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                  <button onClick={() => handleSort('growthRate')} className="flex items-center justify-end space-x-1 hover:text-white w-full">
                    <span>Growth Rate</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Risk Level</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Outlook</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRankings.map((ranking) => (
                <tr 
                  key={ranking.industry}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {ranking.rank === 1 && <Award className="w-5 h-5 text-yellow-400" />}
                      {ranking.rank === 2 && <Award className="w-5 h-5 text-gray-400" />}
                      {ranking.rank === 3 && <Award className="w-5 h-5 text-orange-400" />}
                      <span className="text-white font-semibold">#{ranking.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{ranking.industry}</p>
                      <p className="text-xs text-gray-400">{ranking.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-lg font-bold ${getRauisColor(ranking.rauisScore)}`}>
                      {ranking.rauisScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white">{ranking.unicornCount}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {ranking.growthRate > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={ranking.growthRate > 0 ? 'text-green-400' : 'text-red-400'}>
                        {ranking.growthRate > 0 ? '+' : ''}{ranking.growthRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getRiskBadgeColor(ranking.riskLevel)}`}>
                        {ranking.riskLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-1">
                      {getOutlookIcon(ranking.investmentOutlook)}
                      <span className="text-sm text-gray-300">{ranking.investmentOutlook}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedIndustry(ranking)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedIndustry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedIndustry(null)}>
          <div className="bg-dark-card border border-gray-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-700 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedIndustry.industry}</h2>
                <p className="text-gray-400">{selectedIndustry.category}</p>
              </div>
              <button
                onClick={() => setSelectedIndustry(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">RAUIS Score</p>
                    <p className={`text-2xl font-bold ${getRauisColor(selectedIndustry.rauisScore)}`}>
                      {selectedIndustry.rauisScore}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Unicorn Count</p>
                    <p className="text-2xl font-bold text-white">{selectedIndustry.unicornCount}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Funding</p>
                    <p className="text-2xl font-bold text-white">{selectedIndustry.totalFunding}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Avg Valuation</p>
                    <p className="text-2xl font-bold text-white">{selectedIndustry.avgValuation}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Growth Rate</p>
                    <p className={`text-2xl font-bold ${selectedIndustry.growthRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedIndustry.growthRate > 0 ? '+' : ''}{selectedIndustry.growthRate}%
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Multiplier</p>
                    <p className="text-2xl font-bold text-white">{selectedIndustry.growthMultiplier}x</p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Score Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Base Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${selectedIndustry.baseScore}%` }}
                        />
                      </div>
                      <span className="text-white w-12 text-right">{selectedIndustry.baseScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Risk Penalty</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${selectedIndustry.riskPenalty}%` }}
                        />
                      </div>
                      <span className="text-white w-12 text-right">-{selectedIndustry.riskPenalty}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Saturation Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${selectedIndustry.saturationLevel}%` }}
                        />
                      </div>
                      <span className="text-white w-12 text-right">{selectedIndustry.saturationLevel}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Companies */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Notable Unicorns</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIndustry.topCompanies.map((company, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                      {company}
                    </span>
                  ))}
                </div>
              </div>

              {/* Emerging Trends */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Emerging Trends</h3>
                <ul className="space-y-2">
                  {selectedIndustry.emergingTrends.map((trend, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-gray-300">{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Investment Recommendation */}
              <div className={`border rounded-lg p-4 ${
                selectedIndustry.investmentOutlook === 'Bullish' 
                  ? 'bg-green-500/10 border-green-500/30'
                  : selectedIndustry.investmentOutlook === 'Bearish'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {getOutlookIcon(selectedIndustry.investmentOutlook)}
                  <h3 className="text-lg font-semibold text-white">Investment Outlook: {selectedIndustry.investmentOutlook}</h3>
                </div>
                <p className="text-gray-300">
                  {selectedIndustry.investmentOutlook === 'Bullish' && 
                    `Strong investment opportunity with high RAUIS score (${selectedIndustry.rauisScore}). Market shows healthy growth potential with manageable risk levels.`
                  }
                  {selectedIndustry.investmentOutlook === 'Neutral' && 
                    `Moderate investment opportunity. Consider market conditions and diversification strategies before commitment.`
                  }
                  {selectedIndustry.investmentOutlook === 'Bearish' && 
                    `Caution advised. High risk levels and/or market saturation detected. Thorough due diligence recommended.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data generator for fallback
function getMockRankings(): IndustryRanking[] {
  return [
    {
      rank: 1,
      industry: 'Generative AI & Foundation Models',
      category: 'AI & Data',
      rauisScore: 94.2,
      baseScore: 95,
      riskPenalty: 12,
      saturationLevel: 35,
      growthMultiplier: 1.85,
      unicornCount: 87,
      totalFunding: '$124.5B',
      avgValuation: '$3.2B',
      growthRate: 156.3,
      marketSaturation: 'Medium',
      riskLevel: 'Medium',
      investmentOutlook: 'Bullish',
      topCompanies: ['OpenAI', 'Anthropic', 'Cohere', 'Stability AI', 'Character.AI'],
      emergingTrends: [
        'Multi-modal AI systems combining text, image, and video',
        'Enterprise adoption accelerating with custom fine-tuning',
        'Regulatory frameworks emerging for AI safety and ethics',
        'Open-source models challenging proprietary leaders'
      ]
    },
    {
      rank: 2,
      industry: 'Quantum Computing',
      category: 'Emerging Tech',
      rauisScore: 91.8,
      baseScore: 92,
      riskPenalty: 28,
      saturationLevel: 15,
      growthMultiplier: 1.72,
      unicornCount: 23,
      totalFunding: '$18.3B',
      avgValuation: '$2.8B',
      growthRate: 89.4,
      marketSaturation: 'Low',
      riskLevel: 'High',
      investmentOutlook: 'Bullish',
      topCompanies: ['IonQ', 'Rigetti Computing', 'PsiQuantum', 'Atom Computing', 'Xanadu'],
      emergingTrends: [
        'Error correction breakthroughs enabling practical applications',
        'Cloud-based quantum computing services expanding',
        'Focus on drug discovery and materials science',
        'Hybrid quantum-classical algorithms gaining traction'
      ]
    },
    {
      rank: 3,
      industry: 'Climate Tech & Carbon Management',
      category: 'Emerging Tech',
      rauisScore: 89.5,
      baseScore: 88,
      riskPenalty: 18,
      saturationLevel: 28,
      growthMultiplier: 1.68,
      unicornCount: 64,
      totalFunding: '$89.2B',
      avgValuation: '$2.4B',
      growthRate: 78.2,
      marketSaturation: 'Medium',
      riskLevel: 'Medium',
      investmentOutlook: 'Bullish',
      topCompanies: ['Climeworks', 'Northvolt', 'Redwood Materials', 'Form Energy', 'Watershed'],
      emergingTrends: [
        'Direct air capture scaling with improved economics',
        'Battery recycling and circular economy models',
        'Corporate carbon accounting platforms',
        'Green hydrogen production innovations'
      ]
    },
    {
      rank: 4,
      industry: 'Healthcare AI & Precision Medicine',
      category: 'Healthcare',
      rauisScore: 87.3,
      baseScore: 89,
      riskPenalty: 22,
      saturationLevel: 42,
      growthMultiplier: 1.55,
      unicornCount: 112,
      totalFunding: '$156.7B',
      avgValuation: '$3.8B',
      growthRate: 68.9,
      marketSaturation: 'Medium',
      riskLevel: 'Medium',
      investmentOutlook: 'Bullish',
      topCompanies: ['Tempus AI', 'Freenome', 'Recursion Pharmaceuticals', 'Insitro', 'PathAI'],
      emergingTrends: [
        'AI-powered drug discovery reducing time to market',
        'Genomic data analysis at scale',
        'Personalized treatment protocols based on patient data',
        'Real-world evidence platforms for clinical trials'
      ]
    },
    {
      rank: 5,
      industry: 'Cybersecurity & Zero Trust',
      category: 'Enterprise',
      rauisScore: 85.6,
      baseScore: 86,
      riskPenalty: 16,
      saturationLevel: 58,
      growthMultiplier: 1.42,
      unicornCount: 98,
      totalFunding: '$98.4B',
      avgValuation: '$2.9B',
      growthRate: 52.3,
      marketSaturation: 'High',
      riskLevel: 'Low',
      investmentOutlook: 'Bullish',
      topCompanies: ['Wiz', 'Snyk', 'Lacework', 'Transmit Security', 'Exabeam'],
      emergingTrends: [
        'Zero Trust architecture becoming enterprise standard',
        'AI-powered threat detection and response',
        'Cloud-native security tools',
        'Identity and access management consolidation'
      ]
    },
    {
      rank: 6,
      industry: 'Autonomous Systems & Robotics',
      category: 'AI & Data',
      rauisScore: 83.4,
      baseScore: 84,
      riskPenalty: 24,
      saturationLevel: 38,
      growthMultiplier: 1.58,
      unicornCount: 71,
      totalFunding: '$76.8B',
      avgValuation: '$2.6B',
      growthRate: 64.7,
      marketSaturation: 'Medium',
      riskLevel: 'High',
      investmentOutlook: 'Neutral',
      topCompanies: ['Aurora Innovation', 'Nuro', 'Figure AI', 'Skydio', 'Built Robotics'],
      emergingTrends: [
        'Warehouse automation accelerating post-pandemic',
        'Last-mile delivery robots in urban areas',
        'Humanoid robots for manufacturing',
        'Agricultural robotics for labor shortages'
      ]
    },
    {
      rank: 7,
      industry: 'Fintech & Embedded Finance',
      category: 'Finance',
      rauisScore: 81.2,
      baseScore: 82,
      riskPenalty: 28,
      saturationLevel: 72,
      growthMultiplier: 1.35,
      unicornCount: 156,
      totalFunding: '$245.3B',
      avgValuation: '$3.1B',
      growthRate: 42.1,
      marketSaturation: 'High',
      riskLevel: 'Medium',
      investmentOutlook: 'Neutral',
      topCompanies: ['Stripe', 'Plaid', 'Chime', 'Klarna', 'Revolut'],
      emergingTrends: [
        'Banking-as-a-Service platforms expanding',
        'Crypto infrastructure maturing',
        'Real-time payments becoming standard',
        'AI-powered fraud detection and risk management'
      ]
    },
    {
      rank: 8,
      industry: 'Space Tech & Satellite Infrastructure',
      category: 'Emerging Tech',
      rauisScore: 79.8,
      baseScore: 81,
      riskPenalty: 32,
      saturationLevel: 22,
      growthMultiplier: 1.48,
      unicornCount: 34,
      totalFunding: '$42.7B',
      avgValuation: '$2.5B',
      growthRate: 71.3,
      marketSaturation: 'Low',
      riskLevel: 'High',
      investmentOutlook: 'Neutral',
      topCompanies: ['SpaceX', 'Relativity Space', 'Rocket Lab', 'Planet Labs', 'AST SpaceMobile'],
      emergingTrends: [
        'Small satellite constellations for global connectivity',
        '3D-printed rockets reducing launch costs',
        'Space-based data services for climate monitoring',
        'Lunar and asteroid mining exploration'
      ]
    },
    {
      rank: 9,
      industry: 'Web3, Blockchain & Crypto Infrastructure',
      category: 'Emerging Tech',
      rauisScore: 76.5,
      baseScore: 78,
      riskPenalty: 42,
      saturationLevel: 68,
      growthMultiplier: 1.22,
      unicornCount: 89,
      totalFunding: '$134.6B',
      avgValuation: '$2.7B',
      growthRate: 28.6,
      marketSaturation: 'High',
      riskLevel: 'High',
      investmentOutlook: 'Neutral',
      topCompanies: ['Chainlink', 'Alchemy', 'Magic Eden', 'LayerZero', 'Fireblocks'],
      emergingTrends: [
        'Enterprise blockchain adoption for supply chain',
        'Layer 2 scaling solutions improving transaction speeds',
        'Decentralized identity and data ownership',
        'Real-world asset tokenization gaining momentum'
      ]
    },
    {
      rank: 10,
      industry: 'EdTech & Skills Development',
      category: 'Consumer',
      rauisScore: 74.3,
      baseScore: 75,
      riskPenalty: 26,
      saturationLevel: 64,
      growthMultiplier: 1.28,
      unicornCount: 67,
      totalFunding: '$67.9B',
      avgValuation: '$2.1B',
      growthRate: 38.4,
      marketSaturation: 'High',
      riskLevel: 'Medium',
      investmentOutlook: 'Neutral',
      topCompanies: ['Coursera', 'Duolingo', 'Udemy', 'Guild Education', 'Articulate'],
      emergingTrends: [
        'AI-powered personalized learning paths',
        'Micro-credentials and skills-based hiring',
        'Corporate upskilling programs expanding',
        'Virtual reality for immersive training'
      ]
    },
    {
      rank: 11,
      industry: 'Food Tech & Alternative Proteins',
      category: 'Consumer',
      rauisScore: 72.1,
      baseScore: 73,
      riskPenalty: 34,
      saturationLevel: 52,
      growthMultiplier: 1.32,
      unicornCount: 45,
      totalFunding: '$34.2B',
      avgValuation: '$1.9B',
      growthRate: 44.2,
      marketSaturation: 'Medium',
      riskLevel: 'High',
      investmentOutlook: 'Neutral',
      topCompanies: ['Impossible Foods', 'Perfect Day', 'Apeel Sciences', 'Eat Just', 'Motif FoodWorks'],
      emergingTrends: [
        'Precision fermentation scaling production',
        'Plant-based seafood alternatives emerging',
        'Food waste reduction technologies',
        'Cellular agriculture for lab-grown meat'
      ]
    },
    {
      rank: 12,
      industry: 'Proptech & Smart Buildings',
      category: 'Enterprise',
      rauisScore: 69.8,
      baseScore: 71,
      riskPenalty: 22,
      saturationLevel: 58,
      growthMultiplier: 1.18,
      unicornCount: 52,
      totalFunding: '$52.8B',
      avgValuation: '$2.3B',
      growthRate: 32.7,
      marketSaturation: 'High',
      riskLevel: 'Medium',
      investmentOutlook: 'Neutral',
      topCompanies: ['WeWork', 'Opendoor', 'Compass', 'Procore', 'SmartRent'],
      emergingTrends: [
        'IoT sensors for energy optimization',
        'Digital twins for building management',
        'Flexible workspace solutions',
        'Green building certification platforms'
      ]
    },
    {
      rank: 13,
      industry: 'Supply Chain & Logistics Tech',
      category: 'Enterprise',
      rauisScore: 67.4,
      baseScore: 69,
      riskPenalty: 18,
      saturationLevel: 66,
      growthMultiplier: 1.15,
      unicornCount: 78,
      totalFunding: '$78.3B',
      avgValuation: '$2.4B',
      growthRate: 28.9,
      marketSaturation: 'High',
      riskLevel: 'Low',
      investmentOutlook: 'Neutral',
      topCompanies: ['Flexport', 'Project44', 'Convoy', 'FourKites', 'Shippo'],
      emergingTrends: [
        'Real-time supply chain visibility platforms',
        'AI-powered demand forecasting',
        'Sustainable logistics and carbon tracking',
        'Autonomous vehicles for freight'
      ]
    },
    {
      rank: 14,
      industry: 'Gaming & Metaverse Platforms',
      category: 'Consumer',
      rauisScore: 64.9,
      baseScore: 67,
      riskPenalty: 36,
      saturationLevel: 74,
      growthMultiplier: 1.12,
      unicornCount: 93,
      totalFunding: '$112.4B',
      avgValuation: '$2.8B',
      growthRate: 18.3,
      marketSaturation: 'High',
      riskLevel: 'High',
      investmentOutlook: 'Bearish',
      topCompanies: ['Epic Games', 'Roblox', 'Discord', 'Niantic', 'Unity Technologies'],
      emergingTrends: [
        'Cross-platform gaming experiences',
        'User-generated content monetization',
        'Virtual real estate and digital goods',
        'Cloud gaming reducing hardware barriers'
      ]
    },
    {
      rank: 15,
      industry: 'E-commerce Enablement',
      category: 'Consumer',
      rauisScore: 62.3,
      baseScore: 64,
      riskPenalty: 24,
      saturationLevel: 82,
      growthMultiplier: 1.08,
      unicornCount: 124,
      totalFunding: '$156.8B',
      avgValuation: '$2.6B',
      growthRate: 14.6,
      marketSaturation: 'High',
      riskLevel: 'Medium',
      investmentOutlook: 'Bearish',
      topCompanies: ['Shopify', 'Faire', 'Instacart', 'Gopuff', 'Getir'],
      emergingTrends: [
        'Social commerce integration with TikTok and Instagram',
        'Quick commerce and ultra-fast delivery',
        'AI-powered product recommendations',
        'Sustainability and ethical sourcing tracking'
      ]
    }
  ];
}
