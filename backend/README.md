# AI Unicorn Market Intelligence - Backend

FastAPI backend integrated with Elasticsearch Agent API.

## Setup

### 1. Get Elasticsearch Credentials

**Agent ID:**
1. Go to Kibana → Stack Management → AI → Agents
2. Open your agent
3. Copy Agent ID (e.g., `agent-123abc456def`)

**API Key:**
1. Kibana → Stack Management → Security → API Keys
2. Create API Key with name: `unicorn-backend-key`
3. Privileges: Read access to index + Agent execution
4. Copy the API key

**Cluster URL:**
1. From Elastic Cloud dashboard
2. Copy Elasticsearch endpoint URL
3. Example: `https://abc123.us-central1.gcp.cloud.es.io`

### 2. Configure Environment

Create `.env` file:
```env
ELASTIC_BASE_URL=https://your-cluster-url.es.io
ELASTIC_API_KEY=your_api_key_here
ELASTIC_AGENT_ID=your_agent_id_here
PORT=8000
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Run Server

```bash
# Development
uvicorn app.main:app --reload --port 8000

# Or
python -m app.main
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI routes
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   └── services/
│       └── elastic_agent.py # Elasticsearch Agent client
├── .env                     # Environment variables
├── .env.example            # Template
└── requirements.txt        # Dependencies
```

## API Endpoints

### POST /ask
Execute strategic analysis via Elasticsearch Agent.

**Request:**
```json
{
  "question": "Which sector has better investment potential?"
}
```

**Response:**
```json
{
  "response": {
    "executive_summary": ["...", "..."],
    "data_insights": ["...", "..."],
    "score_breakdown": [
      {
        "industry": "Fintech",
        "base_score": 82,
        "risk_penalty": 6,
        "saturation_penalty": 4,
        "multiplier": 1.08,
        "final_rauis": 78.6
      }
    ],
    "risk_analysis": ["...", "..."],
    "final_recommendation": "...",
    "confidence_level": "high"
  }
}
```

### GET /health
Health check endpoint.

### GET /
API information.

## Architecture Flow

```
Frontend (React)
    ↓
POST /ask
    ↓
FastAPI Backend
    ↓
Elasticsearch Agent API
    ↓
Agent (Tools + ES|QL + Search)
    ↓
LLM (GPT-4 / Claude)
    ↓
Structured Response
    ↓
Transform to Frontend Format
    ↓
Return to Frontend
```

## Testing

### Test Backend Only

```bash
# Terminal 1: Start backend
uvicorn app.main:app --reload

# Terminal 2: Test endpoint
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Is AI better than Fintech?"}'
```

### Test Full Stack

1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev` (in frontend folder)
3. Open http://localhost:3001
4. Type question and click "Analyze"

## Error Handling

- Network errors → 500 with error message
- Timeout (60s) → Exception caught
- Agent failures → Logged and returned to frontend
- Missing env vars → Server won't start

## Production Deployment

1. Update `.env` with production values
2. Set `PORT` environment variable
3. Use production ASGI server:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Troubleshooting

**"Missing Elasticsearch configuration"**
- Check .env file exists
- Verify all 3 variables are set

**"Agent execution failed"**
- Verify Agent ID is correct
- Check API key has proper permissions
- Ensure cluster URL is reachable

**CORS errors**
- Frontend URL added to CORS origins
- Check ports match (3000 or 3001)

## Security Notes

- Never commit `.env` file
- Rotate API keys regularly
- Use environment variables in production
- Add rate limiting for production
- Implement authentication if needed
