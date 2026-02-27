# 🔌 Backend Integration Guide

## Connecting to Elasticsearch Backend

### Current State
- ✅ Frontend is fully functional with mock data
- ✅ API service is pre-configured
- ✅ Type-safe interfaces are defined
- ⏭️ Ready to connect to your backend

---

## Step 1: Configure API Endpoint

```bash
# Create .env file in project root
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env
```

Or update your existing `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Step 2: API Endpoint Requirements

### Question Analysis Endpoint

```http
POST /ask
Content-Type: application/json

Request Body:
{
  "question": "Which sector has the best investment potential?"
}

Response Body (JSON):
{
  "executiveSummary": {
    "title": "string",
    "insights": ["string", "string", ...]
  },
  "industryScores": [
    {
      "industry": "string",
      "baseScore": number,
      "risk": number,
      "saturation": number,
      "multiplier": number,
      "finalRAUIS": number
    }
  ],
  "rauisComparison": [
    { "name": "string", "value": number }
  ],
  "unicornGrowth": [
    { "name": "string", "value": number }
  ],
  "countryDiversification": [
    { "name": "string", "value": number }
  ],
  "risks": [
    {
      "id": "string",
      "name": "string",
      "level": "high" | "medium" | "low",
      "description": "string"
    }
  ]
}
```

---

## Step 3: Update Dashboard Component

Replace mock data usage in `src/pages/Dashboard.tsx`:

```typescript
import { useState } from 'react';
import { analyzeQuestion } from '../services/api';
import { AnalysisResponse } from '../types';
// ... other imports

export default function Dashboard() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setShowResults(false);
    
    try {
      // Call real API instead of mock
      const response = await analyzeQuestion(question);
      setAnalysisData(response);
      setShowResults(true);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze question. Please try again.');
      // Optionally fall back to mock data
      // setAnalysisData(mockAnalysisResponse);
      // setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Use analysisData instead of mockAnalysisResponse in render
  const displayData = analysisData || mockAnalysisResponse;

  return (
    // ... rest of component using displayData
  );
}
```

---

## Step 4: CORS Configuration

Ensure your backend allows requests from your frontend:

```python
# Python/Flask example
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3001"])

# Or for Django
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3001",
]
```

```javascript
// Node.js/Express example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3001'
}));
```

---

## Step 5: Elasticsearch Query Example

Sample backend implementation:

```python
from elasticsearch import Elasticsearch
from flask import Flask, request, jsonify

app = Flask(__name__)
es = Elasticsearch(['http://localhost:9200'])

@app.route('/api/ask', methods=['POST'])
def analyze_question():
    data = request.get_json()
    question = data.get('question', '')
    
    # Your Elasticsearch query logic
    results = es.search(index='unicorns', body={
        'query': {
            'match': {
                'description': question
            }
        }
    })
    
    # Transform results to match frontend interface
    response = {
        'executiveSummary': {
            'title': 'Analysis Results',
            'insights': extract_insights(results)
        },
        'industryScores': calculate_scores(results),
        'rauisComparison': aggregate_rauis(results),
        'unicornGrowth': get_growth_data(),
        'countryDiversification': get_country_stats(results),
        'risks': identify_risks(results)
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=8000)
```

---

## Step 6: Error Handling

The frontend is ready to handle errors gracefully:

```typescript
// API service includes error handling
try {
  const response = await analyzeQuestion(question);
  // Success
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network error:', error.message);
    }
  }
}
```

---

## Step 7: Testing the Integration

1. **Start your backend**:
   ```bash
   python backend/app.py  # or your backend command
   ```

2. **Verify backend is running**:
   ```bash
   curl http://localhost:8000/api/ask \
     -H "Content-Type: application/json" \
     -d '{"question":"test"}'
   ```

3. **Test in frontend**:
   - Type a question in the dashboard
   - Click "Analyze"
   - Check browser console for any errors
   - Verify data displays correctly

---

## Step 8: Environment Variables

For production deployment:

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api

# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## TypeScript Interface Reference

See `src/types/index.ts` for complete type definitions:

```typescript
export interface AnalysisResponse {
  executiveSummary: ExecutiveSummary;
  industryScores: IndustryScore[];
  rauisComparison: ChartDataPoint[];
  unicornGrowth: ChartDataPoint[];
  countryDiversification: ChartDataPoint[];
  risks: RiskItem[];
}
```

---

## Debugging Tips

1. **Check browser console** for API errors
2. **Use browser DevTools Network tab** to inspect requests/responses
3. **Verify CORS headers** in response
4. **Test backend endpoint independently** before frontend integration
5. **Use mock data fallback** during development

---

## Performance Optimization

```typescript
// Add request timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
});

// Add request/response interceptors for loading states
api.interceptors.request.use(config => {
  // Show global loading indicator
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    // Handle global errors
    return Promise.reject(error);
  }
);
```

---

## Ready to Connect!

Once your Elasticsearch backend is ready:
1. Update `.env` file
2. Modify `Dashboard.tsx` to use real API
3. Test thoroughly
4. Deploy both frontend and backend

The frontend is production-ready and waiting for your backend integration! 🚀
