import { CheckCircle2, Lightbulb } from 'lucide-react';
import { ExecutiveSummary as ExecutiveSummaryType } from '../types';

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryType;
}

export default function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  return (
    <div className="bg-dark-card rounded-2xl p-8 shadow-xl border-l-4 border-accent-blue mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent-blue/20 rounded-xl flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-accent-blue" />
        </div>
        <h2 className="text-2xl font-bold text-white">{data.title}</h2>
      </div>

      <div className="space-y-4">
        {data.insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3 group">
            <CheckCircle2 className="w-5 h-5 text-accent-green mt-0.5 flex-shrink-0" />
            <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
