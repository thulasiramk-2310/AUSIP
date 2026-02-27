import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, TrendingUp, Search, Plus, Trash2, Clock } from 'lucide-react';
import { askQuestion } from '../api/askService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAnalysis, Message } from '../context/AnalysisContext';

export default function AiChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [dashboardUpdated, setDashboardUpdated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const {
    updateFromAiResponse,
    setLastQuestion,
    conversations,
    currentConversationId,
    currentMessages,
    createNewConversation,
    switchConversation,
    addMessage,
    deleteConversation,
  } = useAnalysis();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    if (isLoading) {
      setLoadingTime(0);
      loadingTimerRef.current = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, [isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const questionText = input.trim();
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    setDashboardUpdated(false);

    try {
      const response = await askQuestion(questionText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response.final_recommendation,
        timestamp: new Date(),
      };

      addMessage(aiMessage);
      
      // Update dashboard with AI response
      updateFromAiResponse(response.response);
      setLastQuestion(questionText);
      setDashboardUpdated(true);
      
      // Hide the notification after 5 seconds
      setTimeout(() => setDashboardUpdated(false), 5000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${errorMsg}\n\nThis might be due to:\n• Agent processing taking longer than expected (try a simpler question)\n• Network connectivity issues\n• Kibana Agent Builder is busy\n\nPlease try again.`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date
  const today = new Date();
  const todayConversations = filteredConversations.filter((conv) => {
    const convDate = new Date(conv.updatedAt);
    return convDate.toDateString() === today.toDateString();
  });

  const olderConversations = filteredConversations.filter((conv) => {
    const convDate = new Date(conv.updatedAt);
    return convDate.toDateString() !== today.toDateString();
  });

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Conversation History Sidebar */}
      <div className="w-80 bg-[#27272A] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Conversations</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 text-white placeholder-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={createNewConversation}
            className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {todayConversations.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">Today</h3>
              {todayConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => switchConversation(conv.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group hover:bg-[#3F3F46] ${
                    conv.id === currentConversationId
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm line-clamp-2 flex-1 ${
                        conv.id === currentConversationId ? 'text-blue-300 font-medium' : 'text-gray-300'
                      }`}
                    >
                      {conv.title}
                    </p>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
              ))}
            </div>
          )}

          {olderConversations.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-2">Previous</h3>
              {olderConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => switchConversation(conv.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group hover:bg-[#3F3F46] ${
                    conv.id === currentConversationId
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm line-clamp-2 flex-1 ${
                        conv.id === currentConversationId ? 'text-blue-300 font-medium' : 'text-gray-300'
                      }`}
                    >
                      {conv.title}
                    </p>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </button>
              ))}
            </div>
          )}

          {filteredConversations.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">AI Unicorn Strategy Agent</h1>
          <p className="text-gray-300">Powered by AWS Bedrock Claude via Kibana Agent Builder</p>
        </div>

      {/* Info Banner */}
      <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
        <p className="text-sm text-blue-400">
          <Sparkles className="w-4 h-4 inline mr-2" />
          <strong>Note:</strong> Complex questions may take 60-120 seconds as the agent searches your Elasticsearch data and generates insights.
        </p>
      </div>

      {/* Dashboard Updated Notification */}
      {dashboardUpdated && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 animate-pulse">
          <p className="text-sm text-green-400">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            <strong>Dashboard Updated!</strong> Switch to the Dashboard tab to see the analysis visualizations.
          </p>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 bg-[#27272A] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentMessages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
                <p className="text-gray-300 max-w-md">
                  Ask me anything about unicorn companies, market trends, valuations, or investment strategies.
                </p>
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-gray-400">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      'What are the top 3 AI unicorns?',
                      'Compare Fintech vs AI valuations',
                      'Geographic distribution of unicorns'
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-[#3F3F46] text-gray-200 hover:text-white rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-300">bedrock-claude</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl px-6 py-4">
                <div className="flex items-center gap-3">
                  <LoadingSpinner />
                  <div className="text-sm text-gray-400">
                    <div>Analyzing your question...</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {loadingTime}s {loadingTime > 30 && '• Complex queries may take up to 3 minutes'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                disabled={isLoading}
                rows={1}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Unicorn Strategy Agent
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
