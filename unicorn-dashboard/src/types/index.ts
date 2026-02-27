export interface KpiData {
    label: string;
    value: number | string;
    subtitle: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
}

export interface ScoreRow {
    industry: string;
    baseScore: number;
    risk: number;
    saturation: number;
    multiplier: number;
    finalRauis: number;
}

export interface GrowthPoint {
    year: string;
    count: number;
}

export interface CountryShare {
    name: string;
    value: number;
    color: string;
}

export interface RiskItem {
    label: string;
    level: 'low' | 'medium' | 'high';
    description: string;
}

export interface AiResponse {
    summary: {
        title: string;
        insights: string[];
    };
    scores: ScoreRow[];
    growth: GrowthPoint[];
    countries: CountryShare[];
    risks: RiskItem[];
}

export type SortDirection = 'asc' | 'desc';
export type SortKey = keyof ScoreRow;
