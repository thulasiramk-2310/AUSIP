import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface QuestionInputProps {
    onSubmit: (question: string) => void;
    isLoading: boolean;
}

export default function QuestionInput({ onSubmit, isLoading }: QuestionInputProps) {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && !isLoading) {
            onSubmit(question.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-3 items-center bg-[#1E293B] rounded-2xl p-2 border border-[#334155]/50 focus-within:border-[#3B82F6]/50 transition-colors duration-300 shadow-xl">
                <div className="flex-shrink-0 pl-3">
                    <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a strategic investment question…"
                    className="flex-1 bg-transparent text-white placeholder-[#64748B] text-base py-3 px-1 outline-none"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    className="flex-shrink-0 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner />
                            <span>Analyzing</span>
                        </>
                    ) : (
                        <span>Analyze</span>
                    )}
                </button>
            </div>
        </form>
    );
}
