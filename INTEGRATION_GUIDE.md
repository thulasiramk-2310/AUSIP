# Backend Integration Guide

## Setup

1. **Environment Configuration**
```bash
# .env file already created
VITE_API_BASE_URL=http://localhost:8000
```

2. **Start Backend**
```bash
# Start your FastAPI backend on port 8000
python main.py  # or uvicorn main:app --reload
```

3. **Start Frontend**
```bash
npm run dev
```

## Architecture

```
Frontend (React + TypeScript)
├── src/api/
│   ├── axios.ts           # Axios instance with interceptors
│   └── askService.ts      # API service functions
├── src/types/
│   └── api.ts             # Backend response types
├── src/utils/
│   └── transformers.ts    # Data transformation functions
└── src/pages/
    └── Dashboard.tsx      # Integrated with backend

Backend (FastAPI)
└── POST /ask
    ├── Request: { question: string }
    └── Response: ApiResponse
```

## API Flow

1. User types question
2. Clicks "Analyze"
3. `askQuestion()` called
4. POST to `/ask` endpoint
5. Response transformed
6. Data mapped to components
7. Charts and tables render

## Response Transformation

Backend → Frontend:
```typescript
{
  executive_summary: string[]     → ExecutiveSummary.insights
  score_breakdown: Array<{}>      → ScoreTable.data
  score_breakdown: Array<{}>      → RauisBarChart.data (transformed)
  risk_analysis: string[]         → RiskPanel.risks
  final_recommendation: string    → FinalRecommendation.recommendation
}
```

## Error Handling

- Network errors → ErrorBanner
- Server errors → ErrorBanner
- Fallback to mock data on error
- 30s timeout
- User-friendly messages

## Testing

```bash
# Test backend endpoint
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Which sector is better?"}'
```

## Production

Update `.env` for production:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```
