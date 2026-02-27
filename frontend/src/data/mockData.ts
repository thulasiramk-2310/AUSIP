import { KpiData, AnalysisResponse, User } from '../types';

export const mockKpiData: KpiData[] = [
  {
    id: '1',
    title: 'Total Unicorns',
    value: 1157,
    subtitle: 'Tracked Companies',
    trend: 'up',
    trendValue: '+8.2%',
  },
  {
    id: '2',
    title: 'Industries Tracked',
    value: 15,
    subtitle: 'Active Sectors',
    trend: 'neutral',
    trendValue: '0%',
  },
  {
    id: '3',
    title: 'Fastest Growing',
    value: 'Fintech',
    subtitle: 'Q1 2026 Leader',
    trend: 'up',
    trendValue: '+28.4%',
  },
  {
    id: '4',
    title: 'Top RAUIS Score',
    value: 'AI 78.6',
    subtitle: 'Leading Sector',
    trend: 'up',
    trendValue: '+4.2%',
  },
];

export const mockAnalysisResponse: AnalysisResponse = {
  executiveSummary: {
    title: 'Executive Summary',
    insights: [
      'AI shows higher post-2020 acceleration',
      'Fintech leads in overall market scale.',
      'Both sectors have moderate risk factors.',
    ],
  },
  industryScores: [
    {
      industry: 'Fintech',
      baseScore: 82,
      risk: 6,
      saturation: 4,
      multiplier: 1.08,
      finalRAUIS: 78.6,
    },
    {
      industry: 'AI',
      baseScore: 74,
      risk: 3,
      saturation: 1,
      multiplier: 1.12,
      finalRAUIS: 79.9,
    },
  ],
  rauisComparison: [
    { name: 'Fintech', value: 78.6 },
    { name: 'AI', value: 79.9 },
  ],
  unicornGrowth: [
    { name: '2018', value: 45 },
    { name: '2019', value: 62 },
    { name: '2021', value: 78 },
    { name: '2021', value: 88 },
    { name: '2023', value: 95 },
    { name: '2025', value: 108 },
  ],
  countryDiversification: [
    { name: 'North America', value: 35 },
    { name: 'Europe', value: 25 },
    { name: 'Asia', value: 30 },
    { name: 'Others', value: 10 },
  ],
  risks: [
    {
      id: '1',
      name: 'Saturation risk emerging',
      level: 'medium',
      description: 'Market showing early signs of saturation',
    },
    {
      id: '2',
      name: 'Volatility detected in AI sector',
      level: 'high',
      description: 'Increased volatility in AI investments',
    },
    {
      id: '3',
      name: 'Regulatory concerns in fintech',
      level: 'high',
      description: 'New regulatory frameworks affecting fintech',
    },
  ],
  finalRecommendation: 'Diversify with cautious AI investment.',
};

export const mockUser: User = {
  name: 'Alexandra Chen',
  email: 'a.chen@unicorninsights.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandra',
};