import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartDataPoint } from '../types';

interface CountryPieChartProps {
  data: ChartDataPoint[];
}

export default function CountryPieChart({ data }: CountryPieChartProps) {
  const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="bg-dark-card rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Geographic Distribution</h3>
        <p className="text-sm text-gray-400">Country diversification breakdown</p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#fff',
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
