import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Calendar, ArrowRight, CheckCircle2, Circle, Eye, Sparkles } from 'lucide-react';
import { topicAPI } from '../../services/api';

export const TopicCalendarWidget = () => {
  const [calendarDays, setCalendarDays] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const [calRes, todayRes] = await Promise.all([
          topicAPI.getCalendarOverview(),
          topicAPI.getTopicByDate()
        ]);
        if (calRes.data?.success) {
          setCalendarDays(calRes.data.calendarDays.slice(-14));
        }
        if (todayRes.data?.success) {
          setActiveTopic(todayRes.data.topic);
        }
      } catch (err) {
        console.warn('Error fetching calendar widget data:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  const getStatusColor = (day) => {
    if (day.status === 'viewed') {
      return 'bg-[#12B8A6] text-white hover:bg-[#087F73] border-[#12B8A6]';
    }
    if (day.status === 'unviewed') {
      return 'bg-[#E5F7F4] text-[#087F73] hover:bg-[#D0F0EB] border-[#12B8A6]/40';
    }
    return 'bg-[#F8FAFC] text-[#94A3B8] hover:bg-slate-100 border-[#E2E8F0]';
  };

  return (
    <Card className="bg-white border-[#E2E8F0] card-interactive">
      <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#E5F7F4] text-[#087F73]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#0B172A]">Industry Awareness Calendar</h3>
              <span className="text-[10px] text-[#64748B] font-semibold bg-[#F1F5F9] px-2 py-0.5 rounded-full">History, not streaks</span>
            </div>
            <p className="text-xs text-[#64748B]">Explore modern tech architectures published daily</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/topics')}
          icon={ArrowRight}
          iconPosition="right"
        >
          View All Topics
        </Button>
      </div>

      {/* Date History Grid */}
      <div className="py-4">
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
          {calendarDays.map((day) => (
            <button
              key={day.date}
              onClick={() => navigate(`/dashboard/topics?date=${day.date}`)}
              title={`${day.date}: ${day.topic?.title || 'No topic'} (${day.status})`}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${getStatusColor(
                day
              )} ${day.isToday ? 'ring-2 ring-[#0B172A] ring-offset-1' : ''}`}
            >
              <span className="text-[9px] uppercase font-bold opacity-80">{day.dayOfWeek}</span>
              <span className="text-xs font-extrabold">{day.dayOfMonth}</span>
              {day.status === 'viewed' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Today's Featured Industry Topic Snippet */}
      {activeTopic && (
        <div className="mt-2 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F73] bg-[#E5F7F4] px-2 py-0.5 rounded-md">
                Today's Concept: {activeTopic.category}
              </span>
              {activeTopic.isViewed && (
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Read
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-[#0B172A] truncate">
              {activeTopic.title}
            </h4>
            <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
              {activeTopic.summary}
            </p>
          </div>

          <Button
            variant="pale-teal"
            size="sm"
            onClick={() => navigate(`/dashboard/topics?date=${activeTopic.date}`)}
            className="shrink-0"
          >
            Read Deep-Dive
          </Button>
        </div>
      )}
    </Card>
  );
};

export default TopicCalendarWidget;
