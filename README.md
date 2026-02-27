# AUSIP - AI Unicorn Stratergy Intelligent Platform

> A comprehensive AI-powered platform for competitive intelligence, strategic analysis, and data-driven insights using Elasticsearch and advanced analytics.

---

## Overview

AUSIP combines powerful data scraping, intelligent analysis, and interactive visualization to help organizations make informed strategic decisions. The platform integrates with Elasticsearch and Kibana to provide real-time insights and AI-driven recommendations.

---

## Project Structure

```
AUSIP/
├── frontend/          # React + TypeScript dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── api/           # API services
│   │   └── ...
│   └── ...
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── services/      # Business logic & AI agents
│   │   ├── models/        # Data models
│   │   └── main.py        # API entry point
│   └── ...
└── README.md
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Configure your environment variables:
```bash
# Create .env file with:
ELASTICSEARCH_URL=your_elasticsearch_url
ELASTICSEARCH_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key  # Optional for AI features
```

Start the backend server:
```bash
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 3. Access the Platform

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## Features

### Frontend
- **Interactive Dashboard**: Real-time analytics and visualizations
- **AI Chat Interface**: Natural language queries powered by AI agents
- **Alerts Management**: Monitor and manage Kibana alerts
- **Reports Generation**: Export comprehensive analysis reports
- **User Authentication**: Secure login and user management
- **Responsive Design**: Modern UI with Tailwind CSS

### Backend
- **FastAPI Framework**: High-performance async API
- **Elasticsearch Integration**: Advanced search and analytics
- **AI Agent Services**: Intelligent data analysis and recommendations
- **Kibana Alerts**: Automated alert monitoring and management
- **Report Generation**: Dynamic PDF and data export
- **RESTful API**: Well-documented endpoints with OpenAPI

---

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts (Data Visualization)
- Axios

### Backend
- Python 3.9+
- FastAPI
- Elasticsearch
- Pydantic
- SQLAlchemy
- OpenAI API (Optional)

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout

### Data & Analysis
- `POST /api/ask` - AI-powered query interface
- `GET /api/alerts` - Fetch Kibana alerts
- `POST /api/reports/generate` - Generate analysis reports

### Health Check
- `GET /health` - Service health status

For complete API documentation, visit http://localhost:8000/docs when the backend is running.

---

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Elasticsearch Configuration
ELASTICSEARCH_URL=https://your-elasticsearch-instance
ELASTICSEARCH_API_KEY=your_api_key

# OpenAI Configuration (Optional)
OPENAI_API_KEY=sk-your-openai-key

# Database Configuration
DATABASE_URL=sqlite:///./ausip.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

---

## Development

### Running Tests

Backend tests:
```bash
cd backend
pytest
```

Frontend tests:
```bash
cd frontend
npm test
```

### Building for Production

Frontend build:
```bash
cd frontend
npm run build
```

### Code Style

The project follows standard Python and TypeScript/React conventions. Use ESLint and Prettier for frontend code formatting.

---

## Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Port 5173)    │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│  FastAPI Backend│
│  (Port 8000)    │
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
┌──────────────┐  ┌────────────┐
│ Elasticsearch│  │  OpenAI    │
│   Kibana     │  │  API       │
└──────────────┘  └────────────┘
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is part of AUSIP - AI Unicorn Stratergy Intelligent Platform.

---

## Support

For issues and questions:
- Create an issue in the repository
- Check the documentation at `/docs`
- Review API documentation at http://localhost:8000/docs

