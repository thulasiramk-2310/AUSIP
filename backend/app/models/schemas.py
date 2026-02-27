from pydantic import BaseModel, Field
from typing import List, Optional


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)


class ScoreBreakdownItem(BaseModel):
    industry: str
    base_score: float
    risk_penalty: float
    saturation_penalty: float
    multiplier: float
    final_rauis: float


class AgentResponse(BaseModel):
    executive_summary: List[str]
    data_insights: List[str]
    score_breakdown: List[ScoreBreakdownItem]
    risk_analysis: List[str]
    final_recommendation: str
    confidence_level: str


class ApiResponse(BaseModel):
    response: AgentResponse
