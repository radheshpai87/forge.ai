import React, { useState, useRef, useEffect } from 'react';
import { useConversation, Message } from '../contexts/ConversationContext';
import { chat, ChatMessage as GeminiChatMessage } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Loader } from './Loader';
import { SparklesIcon } from './icons/SparklesIcon';
import { Theme } from '../types';

interface AnalyzeViewProps {
  theme: Theme;
}

const AnalyzeView: React.FC<AnalyzeViewProps> = ({ theme }) => {
  const { currentConversation, conversations, addMessage, clearCurrentConversation, createNewConversation, switchConversation } = useConversation();
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      await addMessage('user', userMessage);

      const history: GeminiChatMessage[] = [
        ...(currentConversation?.messages.map(msg => ({
          role: msg.role === 'user' ? ('user' as const) : ('model' as const),
          parts: msg.content
        })) || []),
        { role: 'user' as const, parts: userMessage }
      ];

      const response = await chat(userMessage, history);
      await addMessage('assistant', response);
    } catch (error: any) {
      await addMessage('assistant', `Sorry, I encountered an error: ${error.message}`);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    switchConversation(conversationId);
    setActiveTab('analyze');
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          <span className="gemini-gradient-text">Forge AI</span> Analysis
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Analyze problems and chat with your AI co-pilot
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'analyze'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Analyze
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'history'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          History
        </button>
      </div>

      {activeTab === 'analyze' ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-end mb-4 gap-2">
            <button
              onClick={clearCurrentConversation}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-all duration-200"
              title="Clear current conversation"
            >
              Clear
            </button>
            <button
              onClick={createNewConversation}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Start new conversation"
            >
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-6 space-y-6 min-h-0">
            {currentConversation?.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <SparklesIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Start analyzing
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Describe a problem you want to analyze, ask questions about your startup strategy, get market insights, or explore opportunities. I'll remember our entire conversation!
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 w-full max-w-2xl">
                  {[
                    "Analyze the problem of food waste in restaurants",
                    "How can I validate my SaaS startup idea?",
                    "What's the market opportunity for AI in healthcare?",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(suggestion)}
                      className="text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-all duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {currentConversation?.messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose dark:prose-invert max-w-none">
                          <MarkdownRenderer content={message.content} />
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-white/10">
                      <Loader />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-white/10 pt-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a problem to analyze or ask a question... (Shift+Enter for new line)"
                rows={1}
                className="flex-1 resize-none px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 border-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for a new line
            </p>
          </form>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversation History</h3>
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No conversations yet. Start analyzing to create your first conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleConversationClick(conv.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentConversation?.id === conv.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conv.messages[0]?.content.substring(0, 60) || 'New Conversation'}
                        {conv.messages[0]?.content.length > 60 ? '...' : ''}
                      </p>
                      <p className={`text-xs mt-1 ${
                        currentConversation?.id === conv.id
                          ? 'text-white/70 dark:text-black/70'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''} • {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {currentConversation?.id === conv.id && (
                      <span className="text-xs px-2 py-1 rounded bg-white/20 dark:bg-black/20">Active</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyzeView;
