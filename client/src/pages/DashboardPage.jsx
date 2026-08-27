import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCIE } from '../context/CIEContext';
import ReadinessCard from '../components/dashboard/ReadinessCard';
import TodaysFocusCard from '../components/dashboard/TodaysFocusCard';
import TopicCalendarWidget from '../components/dashboard/TopicCalendarWidget';
import MatchedOpportunitiesWidget from '../components/dashboard/MatchedOpportunitiesWidget';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ScrollReveal from '../components/common/ScrollReveal';
import { Bot, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { roadmap, refreshAll } = useCIE();
  const navigate = useNavigate();

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in bg-white">
      {/* Welcome Banner */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B172A] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Your adaptive career companion is actively managing your preparation workload.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="teal" icon={Sparkles}>
              CIE Status: Active & Synced
            </Badge>
          </div>
        </div>
      </ScrollReveal>

      {/* 1. Readiness Horizon Card */}
      <ScrollReveal direction="up" delay={80}>
        <ReadinessCard />
      </ScrollReveal>

      {/* 2. Today's Focus Card & Mentor Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScrollReveal direction="up" delay={120} className="lg:col-span-2">
          <TodaysFocusCard />
        </ScrollReveal>

        {/* Quick AI Mentor Assistant Widget */}
        <ScrollReveal direction="up" delay={160} className="lg:col-span-1">
          <Card className="h-full bg-gradient-to-br from-white to-[#E5F7F4]/40 flex flex-col justify-between border-[#E2E8F0] card-interactive">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-[#12B8A6] text-white shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B172A]">AI Career Mentor</h3>
                  <span className="text-[10px] text-[#087F73] font-semibold">Live Roadmap Context</span>
                </div>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Need help unblocking algorithmic patterns, explaining system architectures, or optimizing interview strategy?
              </p>
              <div className="mt-4 p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#087F73] font-medium italic shadow-xs">
                "Ask me anything about your current workload or preparation strategy."
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard/mentor')}
              icon={ArrowRight}
              iconPosition="right"
              className="mt-4 w-full shadow-xs"
            >
              Open Mentor Chat
            </Button>
          </Card>
        </ScrollReveal>
      </div>

      {/* 3. Industry Awareness Calendar & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScrollReveal direction="up" delay={200}>
          <TopicCalendarWidget />
        </ScrollReveal>
        <ScrollReveal direction="up" delay={240}>
          <MatchedOpportunitiesWidget />
        </ScrollReveal>
      </div>
    </div>
  );
};

export default DashboardPage;
