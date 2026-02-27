export interface ScoreBreakdownItem {
  industry: string;
  base_score: number;
  risk_penalty: number;
  saturation_penalty: number;
  multiplier: number;
  final_rauis: number;
}

export interface ApiResponse {
  response: {
    executive_summary: string[];
    data_insights: string[];
    score_breakdown: ScoreBreakdownItem[];
    risk_analysis: string[];
    final_recommendation: string;
    confidence_level: string;
  };
}

export interface AskRequest {
  question: string;
}
