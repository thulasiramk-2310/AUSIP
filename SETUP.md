# AI Unicorn Market Intelligence Platform

Production-ready SaaS dashboard for AI-powered unicorn market analysis.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - API client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn installed

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ai-unicorn-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Start development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── KpiCard.tsx
│   ├── QuestionInput.tsx
│   ├── ExecutiveSummary.tsx
│   ├── ScoreTable.tsx
│   ├── RauisBarChart.tsx
│   ├── GrowthLineChart.tsx
│   ├── CountryPieChart.tsx
│   ├── RiskPanel.tsx
│   └── LoadingSpinner.tsx
├── layout/              # Layout components
│   ├── Sidebar.tsx
│   └── Layout.tsx
├── pages/               # Page components
│   └── Dashboard.tsx
├── types/               # TypeScript definitions
│   └── index.ts
├── data/                # Mock data
│   └── mockData.ts
├── services/            # API services
│   └── api.ts
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Features

- **4 KPI Cards** with animated counters
- **AI Question Input** for strategic analysis
- **Executive Summary** with key insights
- **Sortable Score Table** with RAUIS metrics
- **Interactive Charts**:
  - Bar Chart (RAUIS comparison)
  - Line Chart (Growth trajectory)
  - Pie Chart (Geographic distribution)
- **Risk Panel** with collapsible view
- **Responsive Design** - Mobile, tablet, and desktop
- **Dark Theme** - Premium Bloomberg-inspired UI

## API Integration

The app is ready for backend integration. Update the `.env` file with your API endpoint:

```env
VITE_API_BASE_URL=https://your-api-url.com/api
```

API endpoint expected:
```
POST /ask
Body: { question: string }
Response: AnalysisResponse
```

## Design System

### Colors
- Background: `#0F172A`
- Card Background: `#1E293B`
- Accent Blue: `#3B82F6`
- Success Green: `#22C55E`
- Warning Amber: `#F59E0B`
- Risk Red: `#EF4444`

### Typography
- Font Family: Inter
- Rounded corners: `rounded-2xl`
- Shadows: `shadow-xl`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## License

MIT
