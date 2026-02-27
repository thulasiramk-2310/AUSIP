import type { KpiData, AiResponse } from '../types';

export const kpiData: KpiData[] = [
    {
        label: 'Total Unicorns',
        value: 1342,
        subtitle: 'Globally tracked startups',
        trend: 'up',
        trendValue: '+12.4%',
    },
    {
        label: 'Industries Tracked',
        value: 48,
        subtitle: 'Across all verticals',
        trend: 'up',
        trendValue: '+3',
    },
    {
        label: 'Fastest Growing Sector',
        value: 'AI / ML',
        subtitle: 'Quarter-over-quarter',
        trend: 'up',
        trendValue: '+28.7%',
    },
    {
        label: 'Top RAUIS Score',
        value: 94.2,
        subtitle: 'Climate Tech sector',
        trend: 'up',
        trendValue: '+5.1',
    },
];

export const mockAiResponse: AiResponse = {
    summary: {
        title: 'Strategic Investment Analysis',
        insights: [
            'AI/ML sector shows strongest growth trajectory with 28.7% QoQ increase, driven by enterprise adoption and generative AI breakthroughs.',
            'Climate Tech presents the highest risk-adjusted score (94.2 RAUIS), indicating strong fundamentals despite regulatory headwinds.',
            'Fintech saturation in North America is reaching critical levels — consider emerging markets in Southeast Asia and LATAM for diversification.',
            'Healthcare AI is an emerging outlier with low saturation and high multiplier potential, suggesting early-mover advantage windows.',
        ],
    },
    scores: [
        { industry: 'AI / ML', baseScore: 88, risk: 12, saturation: 35, multiplier: 1.42, finalRauis: 92.1 },
        { industry: 'Climate Tech', baseScore: 91, risk: 18, saturation: 22, multiplier: 1.38, finalRauis: 94.2 },
        { industry: 'Fintech', baseScore: 76, risk: 24, saturation: 68, multiplier: 0.92, finalRauis: 64.3 },
        { industry: 'Healthcare AI', baseScore: 82, risk: 15, saturation: 18, multiplier: 1.35, finalRauis: 88.7 },
        { industry: 'Cybersecurity', baseScore: 79, risk: 20, saturation: 45, multiplier: 1.12, finalRauis: 74.8 },
        { industry: 'EdTech', baseScore: 65, risk: 28, saturation: 55, multiplier: 0.85, finalRauis: 52.1 },
        { industry: 'SpaceTech', baseScore: 72, risk: 32, saturation: 12, multiplier: 1.48, finalRauis: 78.4 },
        { industry: 'Biotech', baseScore: 85, risk: 22, saturation: 30, multiplier: 1.25, finalRauis: 84.6 },
    ],
    growth: [
        { year: '2018', count: 310 },
        { year: '2019', count: 425 },
        { year: '2020', count: 520 },
        { year: '2021', count: 842 },
        { year: '2022', count: 968 },
        { year: '2023', count: 1105 },
        { year: '2024', count: 1248 },
        { year: '2025', count: 1342 },
    ],
    countries: [
        { name: 'United States', value: 42, color: '#3B82F6' },
        { name: 'China', value: 18, color: '#EF4444' },
        { name: 'India', value: 12, color: '#22C55E' },
        { name: 'United Kingdom', value: 8, color: '#F59E0B' },
        { name: 'Germany', value: 6, color: '#8B5CF6' },
        { name: 'Others', value: 14, color: '#64748B' },
    ],
    risks: [
        { label: 'Saturation Risk', level: 'medium', description: 'Fintech and EdTech sectors approaching saturation in primary markets' },
        { label: 'Volatility Risk', level: 'high', description: 'Macro-economic uncertainty driving valuation corrections in late-stage unicorns' },
        { label: 'Regulatory Risk', level: 'low', description: 'AI governance frameworks stabilizing across major economies' },
    ],
};
