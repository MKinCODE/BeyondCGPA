import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ScrollReveal from '../components/common/ScrollReveal';
import {
  Settings,
  Sparkles,
  Clock,
  CheckCircle2,
  User,
  Shield,
  Layers,
  Code,
  Save
} from 'lucide-react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCIE } from '../context/CIEContext';

export const ProfileSettingsPage = () => {
  const { user } = useAuth();
  const { profile, readiness, refreshAll } = useCIE();

  const [weeklyHours, setWeeklyHours] = useState(14);
  const [targetDomain, setTargetDomain] = useState('Fullstack');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setWeeklyHours(profile.weeklyHours || 14);
      setTargetDomain(profile.targetDomain || 'Fullstack');
    }
  }, [profile]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await profileAPI.updateProfile({
        weeklyHours: Number(weeklyHours),
        targetDomain
      });
      await refreshAll();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Failed to update profile settings:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in bg-white">
      {/* Header */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="teal" icon={Settings}>
                Profile & Adaptive Velocity
              </Badge>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0B172A] tracking-tight mt-1">
              Career Goal & Time Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Adjusting weekly hours instantly recalibrates your CIE readiness horizon.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* User Details */}
        <ScrollReveal direction="up" delay={80}>
          <Card className="bg-white p-6 space-y-4 border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-bold text-[#0B172A] flex items-center gap-2">
              <User className="w-4 h-4 text-[#12B8A6]" /> Student Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#64748B] block mb-1">Name</span>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-[#0B172A]">
                  {user?.name}
                </div>
              </div>
              <div>
                <span className="text-[#64748B] block mb-1">Email</span>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-medium text-[#0B172A]">
                  {user?.email}
                </div>
              </div>
              <div>
                <span className="text-[#64748B] block mb-1">Graduation Year</span>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-[#087F73]">
                  Class of {user?.graduationYear || 2027}
                </div>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Weekly Time Commitment */}
        <ScrollReveal direction="up" delay={120}>
          <Card className="bg-white p-6 space-y-4 border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B172A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#087F73]" /> Weekly Available Hours
              </h3>
              <span className="text-base font-extrabold text-[#087F73] bg-[#E5F7F4] px-3 py-1 rounded-xl">
                {weeklyHours} hrs / week
              </span>
            </div>

            <p className="text-xs text-[#64748B]">
              Change how much time you can dedicate weekly without affecting remaining curriculum workload.
            </p>

            <input
              type="range"
              min="4"
              max="40"
              step="2"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#12B8A6]"
            />

            <div className="flex justify-between text-[11px] text-[#64748B]">
              <span>4 hrs (Exam Season / Light)</span>
              <span>14 hrs (Standard Pace)</span>
              <span>40 hrs (Full-time Intensive)</span>
            </div>

            {readiness?.readinessHorizon && (
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex items-center justify-between">
                <span className="text-[#64748B]">Projected Readiness Horizon:</span>
                <strong className="text-[#087F73]">{readiness.readinessHorizon.targetCompletionEstimate}</strong>
              </div>
            )}
          </Card>
        </ScrollReveal>

        {/* Target Domain */}
        <ScrollReveal direction="up" delay={160}>
          <Card className="bg-white p-6 space-y-4 border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-bold text-[#0B172A] flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-600" /> Target Career Track
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'Fullstack',
                'Backend',
                'Frontend',
                'AI/ML',
                'Cloud/DevOps',
                'Undecided'
              ].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTargetDomain(d)}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    targetDomain === d
                      ? 'bg-[#12B8A6] text-white border-[#12B8A6] shadow-xs'
                      : 'bg-white text-[#0B172A] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Card>
        </ScrollReveal>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile and CIE readiness horizon updated successfully!</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            icon={Save}
            className="shadow-md shadow-[#12B8A6]/20"
          >
            Save Pacing & Recalibrate
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
