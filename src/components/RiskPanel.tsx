import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { RiskItem } from '../types';
import { useState } from 'react';

interface RiskPanelProps {
  risks: RiskItem[];
}

export default function RiskPanel({ risks }: RiskPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-accent-red';
      case 'medium': return 'bg-accent-amber';
      case 'low': return 'bg-accent-green';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-dark-card rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 border-b border-gray-700 cursor-pointer hover:bg-[#3F3F46]/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent-red/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-accent-red" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Risk Analysis</h2>
            <p className="text-sm text-gray-300">{risks.length} factors identified</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-300" />
        )}
      </div>

      {isExpanded && (
        <div className="p-6 space-y-4">
          {risks.map((risk) => (
            <div key={risk.id} className="flex items-start space-x-4 p-4 rounded-xl bg-gray-800/50 hover:bg-[#3F3F46] transition-colors">
              <div className={`w-3 h-3 rounded-full ${getRiskColor(risk.level)} mt-1.5 flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{risk.name}</h3>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    risk.level === 'high' ? 'bg-accent-red/20 text-accent-red' :
                    risk.level === 'medium' ? 'bg-accent-amber/20 text-accent-amber' :
                    'bg-accent-green/20 text-accent-green'
                  }`}>
                    {risk.level.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{risk.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
