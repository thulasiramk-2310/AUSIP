import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AnalysisResponse, KpiData } from '../types';
import { mockAnalysisResponse, mockKpiData } from '../data/mockData';

// Industry Ranking type for Rankings page
export interface IndustryRanking {
  rank: number;
  industry: string;
  category: string;
  rauisScore: number;
  baseScore: number;
  riskPenalty: number;
  saturationLevel: number;
  growthMultiplier: number;
  unicornCount: number;
  totalFunding: string;
  avgValuation: string;
  growthRate: number;
  marketSaturation: 'Low' | 'Medium' | 'High';
  riskLevel: 'Low' | 'Medium' | 'High';
  investmentOutlook: 'Bullish' | 'Neutral' | 'Bearish';
  topCompanies: string[];
  emergingTrends: string[];
}

// Type for agent response from backend (snake_case)
interface AgentScoreItem {
  industry: string;
  base_score: number;
  risk_penalty: number;
  saturation_penalty: number;
  multiplier: number;
  final_rauis: number;
}

interface AgentResponse {
  executive_summary?: string[] | {
    title: string;
    key_insights: string[];
  };
  data_insights?: string[];
  score_breakdown?: AgentScoreItem[];
  risk_analysis?: string[];
  final_recommendation?: string;
  confidence_level?: string;
}

// Type for localStorage storage (stored as strings)
interface StoredConversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
}

interface StoredMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface AnalysisContextType {
  analysisData: AnalysisResponse;
  setAnalysisData: (data: AnalysisResponse) => void;
  updateFromAiResponse: (response: AgentResponse) => void;
  lastQuestion: string;
  setLastQuestion: (question: string) => void;
  kpiData: KpiData[];
  industryRankings: IndustryRanking[];
  
  // Conversation management
  conversations: Conversation[];
  currentConversationId: string | null;
  currentMessages: Message[];
  createNewConversation: () => void;
  switchConversation: (id: string) => void;
  addMessage: (message: Message) => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Load from localStorage
const loadConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem('unicorn_conversations');
    if (stored) {
      const parsed: StoredConversation[] = JSON.parse(stored);
      return parsed.map((conv) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
  return [];
};

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse>(mockAnalysisResponse);
  const [kpiData, setKpiData] = useState<KpiData[]>(mockKpiData);
  const [industryRankings, setIndustryRankings] = useState<IndustryRanking[]>([]);
  const [lastQuestion, setLastQuestion] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = loadConversations();
    // Create initial conversation if none exist
    if (loaded.length === 0) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return [newConv];
    }
    return loaded;
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    const loaded = loadConversations();
    return loaded.length > 0 ? loaded[0].id : null;
  });

  // Save to localStorage whenever conversations change
  useEffect(() => {
    localStorage.setItem('unicorn_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Get current conversation messages
  const currentMessages =
    conversations.find((c) => c.id === currentConversationId)?.messages || [];

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
  };

  const switchConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const addMessage = (message: Message) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === currentConversationId) {
          const updatedMessages = [...conv.messages, message];
          // Auto-generate title from first user message
          const title =
            conv.messages.length === 0 && message.type === 'user'
              ? message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
              : conv.title;
          return {
            ...conv,
            messages: updatedMessages,
            title,
            updatedAt: new Date(),
          };
        }
        return conv;
      })
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      // If deleting current conversation, switch to another one
      if (id === currentConversationId && filtered.length > 0) {
        setCurrentConversationId(filtered[0].id);
      }
      return filtered.length > 0 ? filtered : [{
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }];
    });
  };

  const updateConversationTitle = (id: string, title: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, title } : conv))
    );
  };

  const updateFromAiResponse = (response: AgentResponse) => {
    // Debug: Log the received response
    console.log('🔍 Raw AI Response:', response);
    console.log('🔍 Score Breakdown:', response.score_breakdown);
    console.log('🔍 Executive Summary:', response.executive_summary);
    
    // Transform AI response to dashboard format
    const scoreBreakdown = response.score_breakdown || [];
    
    // Generate dynamic growth data based on industry scores
    const generateGrowthData = () => {
      if (scoreBreakdown.length === 0) return mockAnalysisResponse.unicornGrowth;
      
      const avgScore = scoreBreakdown.reduce((sum: number, item) => sum + item.final_rauis, 0) / scoreBreakdown.length;
      const baseYear = 2018;
      const currentYear = 2026;
      const growthData = [];
      
      for (let i = 0; i <= currentYear - baseYear; i++) {
        const year = baseYear + i;
        const growthFactor = 1 + (avgScore / 100) * 0.8; // Higher scores = more growth
        const value = Math.round(45 * Math.pow(growthFactor, i));
        growthData.push({ name: year.toString(), value });
      }
      
      return growthData;
    };
    
    // Generate geographic distribution based on industries
    const generateGeoData = () => {
      if (scoreBreakdown.length === 0) return mockAnalysisResponse.countryDiversification;
      
      // Calculate distribution based on industry trends
      const avgScore = scoreBreakdown.reduce((sum: number, item) => sum + item.final_rauis, 0) / scoreBreakdown.length;
      
      return [
        { name: 'North America', value: Math.round(35 + (avgScore > 85 ? 5 : 0)) },
        { name: 'Europe', value: Math.round(25 + (avgScore > 80 ? 3 : 0)) },
        { name: 'Asia', value: Math.round(30 - (avgScore < 75 ? 5 : 0)) },
        { name: 'Others', value: 10 },
      ];
    };
    
    // Handle executive_summary as either string[] or object
    const executiveSummaryInsights = Array.isArray(response.executive_summary) 
      ? response.executive_summary 
      : response.executive_summary?.key_insights || [];

    const updatedData: AnalysisResponse = {
      executiveSummary: {
        title: 'AI Analysis Results',
        insights: executiveSummaryInsights,
      },
      industryScores: scoreBreakdown.map((item) => ({
        industry: item.industry,
        baseScore: item.base_score,
        risk: item.risk_penalty,
        saturation: item.saturation_penalty,
        multiplier: item.multiplier,
        finalRAUIS: item.final_rauis,
      })),
      rauisComparison: scoreBreakdown.map((item) => ({
        name: item.industry,
        value: item.final_rauis,
      })),
      unicornGrowth: generateGrowthData(),
      countryDiversification: generateGeoData(),
      risks: (response.risk_analysis || []).map((risk, index) => ({
        id: String(index + 1),
        name: risk.split(':')[0] || risk.substring(0, 50),
        level: (index === 0 ? 'high' : index === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        description: risk,
      })),
      finalRecommendation: response.final_recommendation || 'No recommendation available',
    };

    console.log('✅ Updated Dashboard Data:', updatedData);
    console.log('✅ Industry Scores:', updatedData.industryScores);
    console.log('✅ RAUIS Comparison:', updatedData.rauisComparison);
    
    setAnalysisData(updatedData);
    
    // Update KPI cards based on AI response
    const generateKpiData = (): KpiData[] => {
      const scores = scoreBreakdown;
      const totalIndustries = scores.length || 15;
      const topScore = scores.length > 0 ? Math.max(...scores.map((s) => s.final_rauis)) : 0;
      const topIndustry = scores.length > 0 ? scores.reduce((prev, curr) => 
        curr.final_rauis > prev.final_rauis ? curr : prev
      ) : null;
      
      return [
        {
          id: '1',
          title: 'Total Unicorns',
          value: 1157,
          subtitle: 'Tracked Companies',
          trend: 'up',
          trendValue: '+8.2%',
        },
        {
          id: '2',
          title: 'Industries Tracked',
          value: totalIndustries,
          subtitle: 'Active Sectors',
          trend: totalIndustries > 8 ? 'up' : 'neutral',
          trendValue: totalIndustries > 8 ? '+' + (totalIndustries - 8) : '0',
        },
        {
          id: '3',
          title: 'Fastest Growing',
          value: topIndustry ? topIndustry.industry.substring(0, 15) : 'AI',
          subtitle: 'Q1 2026 Leader',
          trend: 'up',
          trendValue: topIndustry ? `+${Math.round(topIndustry.multiplier * 20)}%` : '+28%',
        },
        {
          id: '4',
          title: 'Top RAUIS Score',
          value: topIndustry ? `${topIndustry.industry.substring(0, 8)} ${topScore.toFixed(1)}` : 'AI 78.6',
          subtitle: 'Leading Sector',
          trend: topScore > 80 ? 'up' : topScore > 60 ? 'neutral' : 'down',
          trendValue: topScore > 80 ? '+4.2%' : topScore > 60 ? '0%' : '-2%',
        },
      ];
    };
    
    const kpiDataResult = generateKpiData();
    console.log('✅ Generated KPI Data:', kpiDataResult);
    setKpiData(kpiDataResult);
    
    // Generate industry rankings from score breakdown
    const generateRankings = (): IndustryRanking[] => {
      if (scoreBreakdown.length === 0) return [];
      
      // Category mapping
      const categoryMap: Record<string, string> = {
        'AI': 'AI & Data', 'Artificial Intelligence': 'AI & Data', 'Machine Learning': 'AI & Data',
        'Fintech': 'Finance', 'Finance': 'Finance', 'Banking': 'Finance', 'Payments': 'Finance',
        'Healthcare': 'Healthcare', 'HealthTech': 'Healthcare', 'BioTech': 'Healthcare', 'MedTech': 'Healthcare',
        'E-commerce': 'Consumer', 'Retail': 'Consumer', 'Consumer': 'Consumer',
        'SaaS': 'Enterprise', 'Enterprise': 'Enterprise', 'B2B': 'Enterprise',
        'Cybersecurity': 'Enterprise', 'Security': 'Enterprise',
        'EdTech': 'Emerging Tech', 'CleanTech': 'Emerging Tech', 'SpaceTech': 'Emerging Tech',
        'Gaming': 'Consumer', 'Entertainment': 'Consumer',
        'PropTech': 'Emerging Tech', 'RealEstate': 'Emerging Tech',
        'FoodTech': 'Consumer', 'AgriTech': 'Emerging Tech',
        'Automotive': 'Emerging Tech', 'Transportation': 'Emerging Tech'
      };
      
      // Mock company data
      const mockCompanies: Record<string, string[]> = {
        'AI': ['OpenAI', 'Anthropic', 'Cohere', 'Stability AI', 'Character.AI'],
        'Fintech': ['Stripe', 'Klarna', 'Checkout.com', 'Revolut', 'Nium'],
        'Healthcare': ['Oscar Health', 'Tempus', 'Devoted Health', 'Calibrate', 'Cityblock Health'],
        'E-commerce': ['Faire', 'Instacart', 'Fanatics', 'Shein', 'GoPuff'],
        'SaaS': ['Databricks', 'Canva', 'Figma', 'Notion', 'Airtable'],
        'Cybersecurity': ['Wiz', 'Lacework', 'Snyk', 'Illumio', 'Tanium'],
        'Automotive': ['Cruise', 'Aurora', 'Rivian', 'Waymo', 'Zoox'],
        'EdTech': ['Guild Education', 'CourseHero', 'Outschool', 'Udemy', 'Masterclass'],
        'CleanTech': ['Northvolt', 'Redwood Materials', 'QuantumScape', 'Form Energy', 'Commonwealth Fusion'],
        'Gaming': ['Epic Games', 'Discord', 'Roblox', 'Niantic', 'Scopely']
      };
      
      return scoreBreakdown.map((item, index) => {
        const category = categoryMap[item.industry] || 'Emerging Tech';
        const companies = mockCompanies[item.industry] || ['Company A', 'Company B', 'Company C', 'Company D', 'Company E'];
        const unicornCount = Math.round(45 + item.final_rauis * 1.2 + Math.random() * 30);
        const avgVal = (2.5 + item.final_rauis / 40).toFixed(1);
        const totalFunding = (unicornCount * parseFloat(avgVal) * 1.3).toFixed(1);
        
        return {
          rank: index + 1,
          industry: item.industry,
          category,
          rauisScore: item.final_rauis,
          baseScore: item.base_score,
          riskPenalty: Math.abs(item.risk_penalty),
          saturationLevel: Math.abs(item.saturation_penalty) * 3,
          growthMultiplier: item.multiplier,
          unicornCount,
          totalFunding: `$${totalFunding}B`,
          avgValuation: `$${avgVal}B`,
          growthRate: Math.round(item.multiplier * 50 + 20),
          marketSaturation: (Math.abs(item.saturation_penalty) < 5 ? 'Low' : Math.abs(item.saturation_penalty) < 8 ? 'Medium' : 'High') as 'Low' | 'Medium' | 'High',
          riskLevel: (Math.abs(item.risk_penalty) < 8 ? 'Low' : Math.abs(item.risk_penalty) < 12 ? 'Medium' : 'High') as 'Low' | 'Medium' | 'High',
          investmentOutlook: (item.final_rauis > 80 ? 'Bullish' : item.final_rauis > 65 ? 'Neutral' : 'Bearish') as 'Bullish' | 'Neutral' | 'Bearish',
          topCompanies: companies,
          emergingTrends: [
            `${item.industry} adoption accelerating across enterprises`,
            `New funding rounds at ${item.multiplier > 1.2 ? 'premium' : 'stable'} valuations`,
            `Market consolidation ${Math.abs(item.saturation_penalty) > 7 ? 'expected' : 'ongoing'}`,
            `Regulatory landscape ${Math.abs(item.risk_penalty) > 10 ? 'evolving rapidly' : 'stabilizing'}`
          ]
        };
      });
    };
    
    const rankings = generateRankings();
    console.log('✅ Generated Rankings:', rankings);
    setIndustryRankings(rankings);
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysisData,
        setAnalysisData,
        updateFromAiResponse,
        lastQuestion,
        setLastQuestion,
        kpiData,
        industryRankings,
        conversations,
        currentConversationId,
        currentMessages,
        createNewConversation,
        switchConversation,
        addMessage,
        deleteConversation,
        updateConversationTitle,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
