import { ScoreBreakdownItem } from '../types/api';
import { IndustryScore, ChartDataPoint } from '../types';

export function transformScoreBreakdown(items: ScoreBreakdownItem[]): IndustryScore[] {
  return items.map((item) => ({
    industry: item.industry,
    baseScore: item.base_score,
    risk: item.risk_penalty,
    saturation: item.saturation_penalty,
    multiplier: item.multiplier,
    finalRAUIS: item.final_rauis,
  }));
}

export function transformToChartData(items: ScoreBreakdownItem[]): ChartDataPoint[] {
  return items.map((item) => ({
    name: item.industry,
    value: item.final_rauis,
  }));
}
