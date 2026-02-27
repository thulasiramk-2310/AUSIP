import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ScoreRow } from '../types';

interface RauisBarChartProps {
    data: ScoreRow[];
}

function getBarColor(score: number) {
    if (score >= 85) return '#22C55E';
    if (score >= 70) return '#3B82F6';
    if (score >= 55) return '#F59E0B';
    return '#EF4444';
}

export default function RauisBarChart({ data }: RauisBarChartProps) {
    const chartData = data.map((d) => ({ name: d.industry, score: d.finalRauis }));

    return (
        <div className="bg-[#1E293B] rounded-2xl p-6 shadow-xl border border-[#334155]/50">
            <h3 className="text-lg font-bold text-white mb-4">RAUIS Score Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                        angle={-25}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0F172A',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#F1F5F9',
                            fontSize: '13px',
                        }}
                        cursor={{ fill: '#334155', fillOpacity: 0.2 }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {chartData.map((entry, index) => (
                            <Cell key={index} fill={getBarColor(entry.score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
