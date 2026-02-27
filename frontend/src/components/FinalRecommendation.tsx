import { CheckSquare } from 'lucide-react';

interface FinalRecommendationProps {
  recommendation: string;
}

export default function FinalRecommendation({ recommendation }: FinalRecommendationProps) {
  return (
    <div className="bg-dark-card rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-accent-amber/20 rounded-xl flex items-center justify-center">
          <CheckSquare className="w-6 h-6 text-accent-amber" />
        </div>
        <h3 className="text-xl font-bold text-white">Final Recommendation</h3>
      </div>
      
      <p className="text-gray-300 leading-relaxed">
        {recommendation}
      </p>
    </div>
  );
}
