import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ScrollReveal from '../components/common/ScrollReveal';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  Building,
  Info
} from 'lucide-react';
import { topicAPI } from '../services/api';

export const TodaysTopicPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');

  const [activeTopic, setActiveTopic] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'browse'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopicAndCalendar = async (targetDate) => {
    setIsLoading(true);
    try {
      const [topicRes, calRes, allRes] = await Promise.all([
        topicAPI.getTopicByDate(targetDate),
        topicAPI.getCalendarOverview(),
        topicAPI.getAllTopics({ category: selectedCategory, search: searchQuery })
      ]);

      if (topicRes.data?.success) {
        setActiveTopic(topicRes.data.topic);
      }
      if (calRes.data?.success) {
        setCalendarDays(calRes.data.calendarDays);
      }
      if (allRes.data?.success) {
        setAllTopics(allRes.data.topics);
      }
    } catch (err) {
      console.warn('Error fetching topic data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicAndCalendar(dateParam);
  }, [dateParam, selectedCategory]);

  const handleSelectDate = (dateStr) => {
    setSearchParams({ date: dateStr });
  };

  const handleMarkViewed = async () => {
    if (!activeTopic) return;
    try {
      await topicAPI.markViewed(activeTopic._id);
      setActiveTopic({ ...activeTopic, isViewed: true });
      setCalendarDays(prev =>
        prev.map(d => (d.date === activeTopic.date ? { ...d, status: 'viewed' } : d))
      );
    } catch (err) {
      console.warn('Failed to mark topic viewed:', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in bg-white">
      {/* Header */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1F5F9]">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" icon={CalendarIcon}>
                Industry Awareness Engine
              </Badge>
              <span className="text-xs text-[#64748B]">Historical navigation • Not a streak mechanism</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B172A] tracking-tight mt-1">
              Today's Topic & Historical Calendar
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Real-world software engineering concepts, high-throughput architectures, and emerging technologies.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex gap-1.5 p-1 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-[#12B8A6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B172A]'
              }`}
            >
              Daily & Calendar
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'browse'
                  ? 'bg-[#12B8A6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B172A]'
              }`}
            >
              Browse Archive
            </button>
          </div>
        </div>
      </ScrollReveal>

      {activeTab === 'daily' ? (
        <div className="space-y-6">
          {/* Historical Date Calendar */}
          <ScrollReveal direction="up" delay={80}>
            <Card className="bg-white p-5 border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#12B8A6]" />
                  <h3 className="font-bold text-xs sm:text-sm text-[#0B172A]">Historical Date Matrix (Past 30 Days)</h3>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#12B8A6]" /> Read</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E5F7F4] border border-[#12B8A6]" /> Available</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F1F5F9]" /> No Topic</span>
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
                {calendarDays.map((day) => {
                  const isSelected = activeTopic && activeTopic.date === day.date;
                  return (
                    <button
                      key={day.date}
                      onClick={() => handleSelectDate(day.date)}
                      title={`${day.date}: ${day.topic?.title || 'No topic'} (${day.status})`}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                        day.status === 'viewed'
                          ? 'bg-[#12B8A6] text-white border-[#12B8A6]'
                          : day.status === 'unviewed'
                          ? 'bg-[#E5F7F4] text-[#087F73] border-[#12B8A6]/40 hover:bg-[#D0F0EB]'
                          : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
                      } ${isSelected ? 'ring-3 ring-[#0B172A] scale-105 z-10' : ''}`}
                    >
                      <span className="text-[8px] uppercase font-bold opacity-80">{day.month} {day.dayOfMonth}</span>
                      <span className="text-xs font-black">{day.dayOfWeek}</span>
                      {day.status === 'viewed' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </ScrollReveal>

          {/* Active Topic Deep-Dive */}
          {activeTopic ? (
            <ScrollReveal direction="up" delay={140}>
              <Card className="bg-white p-6 sm:p-8 space-y-6 border-[#E2E8F0] shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="teal">{activeTopic.category}</Badge>
                      <span className="text-xs text-[#64748B] font-medium">Published: {activeTopic.date}</span>
                      {activeTopic.isViewed ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Read
                        </span>
                      ) : (
                        <span className="text-xs text-[#087F73] font-semibold bg-[#E5F7F4] px-2 py-0.5 rounded-full">
                          Unread
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B172A] tracking-tight">
                      {activeTopic.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-[#087F73] mt-1">
                      {activeTopic.headline}
                    </p>
                  </div>

                  {!activeTopic.isViewed && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={handleMarkViewed}
                      className="shrink-0 shadow-xs"
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>

                {/* Summary */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A] mb-1">Executive Summary</h4>
                  <p className="text-xs sm:text-sm text-[#0B172A] leading-relaxed">
                    {activeTopic.summary}
                  </p>
                </div>

                {/* Deep Dive Content */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B172A]">Architectural Deep Dive</h3>
                  <div className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line space-y-3 font-normal">
                    {activeTopic.deepDiveContent}
                  </div>
                </div>

                {/* Why It Matters In Industry */}
                <div className="p-4 rounded-2xl bg-[#E5F7F4]/40 border border-[#12B8A6]/20 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#087F73] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Why It Matters In Industry
                  </h4>
                  <p className="text-xs sm:text-sm text-[#0B172A] leading-relaxed">
                    {activeTopic.whyItMattersInIndustry}
                  </p>
                </div>

                {/* Real World Use Cases */}
                {activeTopic.realWorldUseCases && activeTopic.realWorldUseCases.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A]">Production Case Studies</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeTopic.realWorldUseCases.map((cs, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-xs hover:border-[#CBD5E1] transition-all">
                          <span className="font-bold text-[#087F73] flex items-center gap-1 mb-1">
                            <Building className="w-3.5 h-3.5" /> {cs.company}
                          </span>
                          <p className="text-[#64748B] leading-relaxed">{cs.useCase}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Takeaways */}
                {activeTopic.keyTakeaways && activeTopic.keyTakeaways.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A]">Key Architectural Takeaways</h4>
                    <ul className="space-y-1.5 text-xs text-[#334155]">
                      {activeTopic.keyTakeaways.map((k, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#12B8A6] mt-0.5 shrink-0" />
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </ScrollReveal>
          ) : (
            <Card className="text-center py-12 border-[#E2E8F0]">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#0B172A]">No Topic Available for This Date</h3>
              <p className="text-xs text-[#64748B] mt-1">Select another day on the calendar matrix above.</p>
            </Card>
          )}
        </div>
      ) : (
        /* Browse All Archive */
        <div className="space-y-6">
          <ScrollReveal direction="down" delay={60}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search topics (e.g. Kafka, Redis, Docker, Caching)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#12B8A6] bg-white"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-xs bg-white focus:outline-none focus:border-[#12B8A6]"
              >
                <option value="All">All Categories</option>
                <option value="Backend">Backend</option>
                <option value="Databases">Databases</option>
                <option value="DevOps">DevOps</option>
                <option value="Security">Security</option>
                <option value="SystemDesign">System Design</option>
              </select>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTopics.map((item, idx) => (
              <ScrollReveal key={item._id} direction="up" delay={80 + idx * 40}>
                <Card
                  onClick={() => {
                    setActiveTab('daily');
                    handleSelectDate(item.date);
                  }}
                  className="p-5 bg-white border-[#E2E8F0] hover:border-[#12B8A6] cursor-pointer card-interactive"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="teal">{item.category}</Badge>
                    <span className="text-[11px] text-[#64748B]">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0B172A]">{item.title}</h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mt-1">{item.summary}</p>
                  <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex justify-between text-xs">
                    <span className="text-[#087F73] font-semibold hover:underline">Read Concept →</span>
                    {item.isViewed && <span className="text-emerald-700 font-bold">✓ Read</span>}
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysTopicPage;
