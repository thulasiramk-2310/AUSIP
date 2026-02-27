import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KpiData } from '../types';
import { useEffect, useState } from 'react';

interface KpiCardProps {
  data: KpiData;
}

export default function KpiCard({ data }: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (typeof data.value === 'number') {
      const duration = 1500;
      const steps = 60;
      const increment = data.value / steps;
      const targetValue = data.value;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setDisplayValue(targetValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [data.value]);

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-accent-green' : data.trend === 'down' ? 'text-accent-red' : 'text-gray-400';

  return (
    <div className="bg-dark-card rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">{data.title}</h3>
        <TrendIcon className={`w-5 h-5 ${trendColor}`} />
      </div>
      
      <div className="mb-2">
        <p className="text-4xl font-bold text-white">
          {typeof data.value === 'number' ? displayValue.toLocaleString() : data.value}
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300">{data.subtitle}</p>
        <span className={`text-sm font-semibold ${trendColor}`}>{data.trendValue}</span>
      </div>
    </div>
  );
}
