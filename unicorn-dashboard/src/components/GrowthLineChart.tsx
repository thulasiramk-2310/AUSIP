import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import type { GrowthPoint } from '../types';

interface GrowthLineChartProps {
    data: GrowthPoint[];
}

export default function GrowthLineChart({ data }: GrowthLineChartProps) {
    return (
        <div className="bg-[#1E293B] rounded-2xl p-6 shadow-xl border border-[#334155]/50">
            <h3 className="text-lg font-bold text-white mb-4">Unicorn Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="year"
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0F172A',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            color: '#F1F5F9',
                            fontSize: '13px',
                        }}
                    />
                    <Area type="monotone" dataKey="count" stroke="none" fill="url(#growthGradient)" />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        strokeWidth={2.5}
                        dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#0F172A' }}
                        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#0F172A' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
