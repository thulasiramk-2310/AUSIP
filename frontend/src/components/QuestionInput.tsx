import { Search, Sparkles } from 'lucide-react';

interface QuestionInputProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export default function QuestionInput({ question, onQuestionChange, onAnalyze, isLoading }: QuestionInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onAnalyze();
    }
  };

  return (
    <div className="bg-dark-card rounded-2xl p-8 shadow-xl border border-gray-700 mb-8">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Strategic Analysis</h2>
          <p className="text-sm text-gray-400">Get insights powered by advanced market intelligence</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="Ask a strategic investment question..."
            className="w-full pl-12 pr-4 py-4 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all placeholder:text-gray-400"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="px-8 py-4 bg-gradient-to-r from-accent-blue to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-blue/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
    </div>
  );
}
