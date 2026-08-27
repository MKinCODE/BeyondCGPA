import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Sparkles, Clock, Target, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { useCIE } from '../../context/CIEContext';

export const ReadinessCard = () => {
  const { readiness, profile, roadmap } = useCIE();

  const totalUnits = roadmap?.totalAllocatedUnits || 0;
  const completedUnits = roadmap?.completedUnits || 0;
  const remainingUnits = roadmap?.remainingUnits || totalUnits;
  const weeklyHours = profile?.weeklyHours || 14;

  const score = readiness?.readinessHorizon?.currentPreparednessScore || 15;
  const estimate = readiness?.readinessHorizon?.targetCompletionEstimate || '~6 months';
  const rationale = readiness?.readinessHorizon?.rationale || 'Calibrated from baseline workload and weekly commitment.';

  return (
    <Card className="relative overflow-hidden bg-white border-[#E2E8F0] shadow-sm">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#12B8A6]/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#F1F5F9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="teal" icon={Sparkles}>
              Career Intelligence Engine (CIE)
            </Badge>
            <span className="text-xs text-[#64748B] font-medium">Readiness Horizon</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B172A] tracking-tight">
            Targeting {profile?.targetDomain || 'Fullstack'} Readiness in {estimate}
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            {rationale}
          </p>
        </div>

        {/* Readiness Circular / Pill Score */}
        <div className="flex items-center gap-4 bg-[#F8FAFC] p-3 sm:p-4 rounded-2xl border border-[#E2E8F0] shadow-xs shrink-0">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#087F73]">{score}%</div>
            <div className="text-[11px] text-[#64748B] font-medium">Preparedness</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E5F7F4] flex items-center justify-center text-[#12B8A6]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]/70 card-interactive">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium mb-1">
            <Target className="w-3.5 h-3.5 text-[#12B8A6]" />
            <span>Total Workload</span>
          </div>
          <p className="text-lg font-bold text-[#0B172A]">{totalUnits} <span className="text-xs font-normal text-[#64748B]">units</span></p>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]/70 card-interactive">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </div>
          <p className="text-lg font-bold text-emerald-700">{completedUnits} <span className="text-xs font-normal text-[#64748B]">units</span></p>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]/70 card-interactive">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Remaining</span>
          </div>
          <p className="text-lg font-bold text-amber-800">{remainingUnits} <span className="text-xs font-normal text-[#64748B]">units</span></p>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#E2E8F0]/70 card-interactive">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#087F73]" />
            <span>Weekly Commitment</span>
          </div>
          <p className="text-lg font-bold text-[#0B172A]">{weeklyHours} <span className="text-xs font-normal text-[#64748B]">hrs/week</span></p>
        </div>
      </div>
    </Card>
  );
};

export default ReadinessCard;
