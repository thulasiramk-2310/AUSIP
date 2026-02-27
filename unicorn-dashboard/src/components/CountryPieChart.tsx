import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CountryShare } from '../types';

interface CountryPieChartProps {
    data: CountryShare[];
}

export default function CountryPieChart({ data }: CountryPieChartProps) {
    return (
        <div className="bg-[#1E293B] rounded-2xl p-6 shadow-xl border border-[#334155]/50">
            <h3 className="text-lg font-bold text-white mb-4">Country Diversification</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0F172A',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#F1F5F9',
                            fontSize: '13px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Share']}
                    />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
