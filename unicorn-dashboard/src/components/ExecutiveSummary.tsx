interface ExecutiveSummaryProps {
    title: string;
    insights: string[];
}

export default function ExecutiveSummary({ title, insights }: ExecutiveSummaryProps) {
    return (
        <div className="bg-[#1E293B] rounded-2xl p-6 shadow-xl border-l-4 border-[#3B82F6] border-t border-r border-b border-t-[#334155]/50 border-r-[#334155]/50 border-b-[#334155]/50">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <ul className="space-y-3">
                {insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#CBD5E1] leading-relaxed">
                        <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                        {insight}
                    </li>
                ))}
            </ul>
        </div>
    );
}
