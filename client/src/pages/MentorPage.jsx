import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ScrollReveal from '../components/common/ScrollReveal';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  User,
  Compass,
  Layers,
  Flame,
  CheckCircle2,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { mentorAPI } from '../services/api';
import { useCIE } from '../context/CIEContext';
import { useAuth } from '../context/AuthContext';

export const MentorPage = () => {
  const { user } = useAuth();
  const { profile, roadmap, todaysFocus } = useCIE();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [providerStatus, setProviderStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const res = await mentorAPI.getConversation();
      if (res.data?.success) {
        setMessages(res.data.conversation?.messages || []);
        setProviderStatus(res.data.providerStatus);
      }
    } catch (err) {
      console.warn('Error fetching mentor chat:', err.message);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query || !query.trim() || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: query.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await mentorAPI.sendMessage(query.trim());
      if (res.data?.success) {
        setMessages(prev => [...prev, res.data.message]);
      }
    } catch (err) {
      console.error('Failed to send mentor message:', err.message);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I ran into a temporary hiccup processing your request. Please try asking again!',
          suggestions: ['What should I study next?', 'Explain my active topic']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear conversation history?')) {
      try {
        await mentorAPI.clearHistory();
        await fetchConversation();
      } catch (err) {
        console.warn('Error clearing history:', err.message);
      }
    }
  };

  const activeSuggestions = messages.length > 0
    ? messages[messages.length - 1]?.suggestions || []
    : [];

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-140px)] bg-white">
      {/* Header */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="teal" icon={Bot}>
                AI Career Mentor
              </Badge>
              <span className="text-xs text-[#087F73] font-semibold bg-[#E5F7F4] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Cpu className="w-3 h-3" /> {providerStatus?.activeProvider || 'CIE Heuristic Intelligence'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B172A] tracking-tight mt-1">
              Personalized Engineering Mentor
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              icon={Trash2}
            >
              Reset Chat
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Chat Layout: Left Live Context Pills + Right Chat Stream */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Left Telemetry Context Panel */}
        <div className="hidden lg:flex flex-col space-y-4 lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-[#0B172A] flex items-center gap-1.5 pb-2 border-b border-[#F1F5F9]">
              <Sparkles className="w-3.5 h-3.5 text-[#12B8A6]" />
              Live Student Context Fed to AI
            </h3>

            <div className="space-y-2">
              <div>
                <span className="text-[#64748B] block text-[11px]">Target Career Track</span>
                <strong className="text-[#0B172A]">{profile?.targetDomain || 'Fullstack'}</strong>
              </div>

              <div>
                <span className="text-[#64748B] block text-[11px]">Weekly Availability</span>
                <strong className="text-[#087F73]">{profile?.weeklyHours || 14} hours / week</strong>
              </div>

              <div>
                <span className="text-[#64748B] block text-[11px]">Today's Focus Topic</span>
                <strong className="text-[#0B172A]">{todaysFocus?.topic?.title || 'Core Foundations'}</strong>
              </div>

              <div>
                <span className="text-[#64748B] block text-[11px]">Roadmap Workload Units</span>
                <strong className="text-amber-800">{roadmap?.remainingUnits || 0} units remaining</strong>
              </div>
            </div>
          </div>

          <div className="bg-[#E5F7F4]/60 rounded-2xl border border-[#12B8A6]/20 p-4 text-xs text-[#087F73]">
            <p className="font-bold mb-1">💡 Coaching Tip</p>
            <p className="text-[11px] leading-relaxed">
              Ask your mentor to break down complicated algorithmic patterns, analyze space-time complexity, or review your resume readiness.
            </p>
          </div>
        </div>

        {/* Right Chat Stream */}
        <Card className="lg:col-span-3 bg-white p-4 sm:p-6 flex flex-col justify-between shadow-sm border-[#E2E8F0] h-full min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scrollbar-thin">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                      isUser
                        ? 'bg-[#0B172A] text-white'
                        : 'bg-[#E5F7F4] text-[#087F73]'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[82%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#0B172A] text-white rounded-tr-none'
                        : 'bg-[#F8FAFC] text-[#0B172A] border border-[#E2E8F0] rounded-tl-none whitespace-pre-line shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E5F7F4] text-[#087F73] flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl rounded-tl-none text-xs text-[#64748B] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#12B8A6] animate-pulse" />
                  <span>AI Mentor is reasoning...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          {activeSuggestions && activeSuggestions.length > 0 && (
            <div className="pt-2 pb-3 border-t border-[#F1F5F9] flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-[#64748B] uppercase shrink-0">Suggestions:</span>
              {activeSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="px-3 py-1 rounded-xl bg-[#E5F7F4] hover:bg-[#D0F0EB] text-[#087F73] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border border-[#12B8A6]/20"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9]"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask your career mentor anything about preparation, system design, or interview strategies..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm focus:outline-none focus:border-[#12B8A6] bg-[#F8FAFC]"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputText.trim() || isLoading}
              icon={Send}
              className="shrink-0 shadow-xs"
            >
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default MentorPage;
