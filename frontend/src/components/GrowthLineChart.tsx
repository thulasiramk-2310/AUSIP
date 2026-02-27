import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface GrowthLineChartProps {
  data: ChartDataPoint[];
}

export default function GrowthLineChart({ data }: GrowthLineChartProps) {
  return (
    <div className="bg-dark-card rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Unicorn Growth Trajectory</h3>
        <p className="text-sm text-gray-400">Historical growth pattern analysis</p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#fff',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 5 }}
            activeDot={{ r: 7, fill: '#60A5FA' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
