import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartDataPoint } from '../types';

interface RauisBarChartProps {
  data: ChartDataPoint[];
}

export default function RauisBarChart({ data }: RauisBarChartProps) {
  const getBarColor = (value: number) => {
    if (value >= 90) return '#22C55E';
    if (value >= 80) return '#3B82F6';
    if (value >= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="bg-dark-card rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">RAUIS Score Comparison</h3>
        <p className="text-sm text-gray-400">Industry performance metrics</p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#fff',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
