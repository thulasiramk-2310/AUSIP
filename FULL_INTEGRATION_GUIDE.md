# 🚀 Complete Integration Guide

## Stack Overview

```
Frontend (React + TypeScript + Tailwind)
          ↓
    http://localhost:3001
          ↓
Backend (FastAPI + Python)
          ↓
    http://localhost:8000
          ↓
Elasticsearch Agent API
          ↓
    Your Kibana Agent
          ↓
Elasticsearch + LLM
          ↓
Structured JSON Response
```

---

## 📋 Prerequisites Setup

### Step 1: Get Elasticsearch Credentials

#### A. Get Agent ID
1. Open Kibana
2. Go to: **Stack Management → AI → Agents**
3. Select your agent
4. Copy the **Agent ID** (looks like: `agent-123abc456def`)

#### B. Create API Key
1. Kibana: **Stack Management → Security → API Keys**
2. Click **Create API Key**
3. Name: `unicorn-backend-key`
4. Set privileges:
   - Read access to your index
   - Agent execution permissions
5. Copy the **API Key**

#### C. Get Cluster URL
1. Elastic Cloud Dashboard
2. Copy your **Elasticsearch endpoint**
3. Example: `https://abc123.us-central1.gcp.cloud.es.io`

---

## 🔧 Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `backend/.env`:

```env
ELASTIC_BASE_URL=https://your-actual-cluster-url.es.io
ELASTIC_API_KEY=your_actual_api_key_here
ELASTIC_AGENT_ID=your_actual_agent_id_here
PORT=8000
```

### 3. Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 4. Test Backend

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "elastic-agent-backend"
}
```

Test ask endpoint:
```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Which sector is better for investment?"}'
```

---

## 🎨 Frontend Setup (Already Done)

Frontend is already configured at `http://localhost:3001`

Check `.env` in frontend root:
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## ✅ Full Stack Test

### Terminal 1: Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
npm run dev
```

### Browser Test
1. Open: http://localhost:3001
2. Type question: "Is AI better than Fintech for long-term investment?"
3. Click **Analyze**
4. Watch the magic happen! ✨

---

## 🔍 Expected Data Flow

### 1. User Input
```
Frontend: "Which sector has better potential?"
```

### 2. Frontend → Backend
```http
POST http://localhost:8000/ask
{
  "question": "Which sector has better potential?"
}
```

### 3. Backend → Elasticsearch Agent
```http
POST https://your-cluster/_agents/agent-123abc/_run
{
  "input": {
    "question": "Which sector has better potential?"
  }
}
```

### 4. Agent Response (Example)
```json
{
  "output": {
    "executive_summary": [
      "AI shows strong growth trajectory",
      "Fintech maintains market leadership"
    ],
    "score_breakdown": [
      {
        "industry": "AI",
        "base_score": 85,
        "risk_penalty": 3,
        "saturation_penalty": 2,
        "multiplier": 1.15,
        "final_rauis": 92.5
      }
    ],
    "risk_analysis": ["Market volatility detected"],
    "final_recommendation": "Diversified AI investment recommended",
    "confidence_level": "high"
  }
}
```

### 5. Backend Transforms & Returns
```json
{
  "response": { ... }
}
```

### 6. Frontend Displays
- Executive Summary card
- Score Table
- RAUIS Bar Chart
- Risk Panel
- Final Recommendation

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### "Missing Elasticsearch configuration"
- Verify `.env` file exists in `backend/` folder
- Check all 3 variables are filled

### Agent execution fails
- Test Agent in Kibana first
- Verify API key permissions
- Check Agent ID is correct

### Frontend can't connect
- Verify backend is running on port 8000
- Check CORS settings in `backend/app/main.py`
- Verify `.env` in frontend has correct URL

### Timeout errors
- Agent queries might take 10-30 seconds
- Timeout set to 60s by default
- Check Elasticsearch cluster health

---

## 📁 File Structure

```
d:\Elastic 2\
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI routes
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py             # Data models
│   │   └── services/
│   │       ├── __init__.py
│   │       └── elastic_agent.py       # Agent client
│   ├── .env                           # ← Configure this!
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── src/                               # Frontend
│   ├── api/
│   │   ├── axios.ts
│   │   └── askService.ts
│   ├── components/
│   ├── pages/
│   └── ...
├── .env                               # Frontend config
└── package.json
```

---

## 🚀 Production Deployment

### Backend
```bash
# Use Gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

### Environment Variables (Production)
- Store in platform secrets (Railway, Render, etc.)
- Never commit `.env` files
- Use separate API keys for production

---

## 🎉 You're Ready!

1. ✅ Backend with Elasticsearch Agent integration
2. ✅ Frontend with API client
3. ✅ Full data transformation pipeline
4. ✅ Error handling & loading states
5. ✅ Production-ready architecture

**Start both servers and test your AI-powered unicorn market intelligence platform!**
