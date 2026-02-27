export interface KpiData {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
}

export interface IndustryScore {
  industry: string;
  baseScore: number;
  risk: number;
  saturation: number;
  multiplier: number;
  finalRAUIS: number;
}

export interface ExecutiveSummary {
  title: string;
  insights: string[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface RiskItem {
  id: string;
  name: string;
  level: 'high' | 'medium' | 'low';
  description: string;
}

export interface AnalysisResponse {
  executiveSummary: ExecutiveSummary;
  industryScores: IndustryScore[];
  rauisComparison: ChartDataPoint[];
  unicornGrowth: ChartDataPoint[];
  countryDiversification: ChartDataPoint[];
  risks: RiskItem[];
  finalRecommendation: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}
