import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { Play, CheckCircle, BookOpen, Clock, ArrowRight, Star, ExternalLink, Flame } from 'lucide-react';
import { useCIE } from '../../context/CIEContext';

export const TodaysFocusCard = () => {
  const { todaysFocus, logPreparationEffort } = useCIE();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitsCovered, setUnitsCovered] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!todaysFocus || !todaysFocus.topic) {
    return (
      <Card className="bg-white border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="teal">Today's Focus</Badge>
            <h3 className="text-lg font-bold text-[#0B172A] mt-2">All Current Preparation Units Complete!</h3>
            <p className="text-xs text-[#64748B] mt-1">Check out matched opportunities or explore today's industry awareness topic.</p>
          </div>
          <Button variant="pale-teal" size="sm" onClick={() => window.location.href = '/dashboard/topics'}>
            Explore Industry Topics
          </Button>
        </div>
      </Card>
    );
  }

  const { topic, progress, reason, category } = todaysFocus;
  const remaining = progress?.remainingUnits ?? topic.allocatedEffortUnits;
  const completed = progress?.completedUnits ?? 0;
  const total = progress?.totalAllocatedUnits ?? topic.allocatedEffortUnits;

  const handleLogEffort = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await logPreparationEffort({
        topicId: topic._id,
        unitsCovered: Number(unitsCovered),
        durationMinutes: Number(durationMinutes),
        notes,
        confidenceScore: Number(confidence)
      });
      setIsModalOpen(false);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-l-[#12B8A6] border-[#E2E8F0] bg-white relative card-interactive">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="teal">Today's Focus</Badge>
              <Badge variant="default">{category || topic.category}</Badge>
              <Badge variant="outline">{topic.difficulty}</Badge>
            </div>
            <h3 className="text-xl font-bold text-[#0B172A] mt-2 tracking-tight">
              {topic.title}
            </h3>
            <p className="text-xs text-[#087F73] font-semibold mt-0.5">
              CIE Priority: {reason}
            </p>
          </div>

          <Button
            variant="primary"
            icon={Play}
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 shadow-md shadow-[#12B8A6]/20"
          >
            Start & Log Effort
          </Button>
        </div>

        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed my-4">
          {topic.summary}
        </p>

        {/* Workload Invariant Tracker */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl flex items-center justify-between text-xs border border-[#E2E8F0]">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[#64748B]">Workload: </span>
              <strong className="text-[#0B172A]">{completed} / {total} units</strong>
            </div>
            <div>
              <span className="text-[#64748B]">Remaining: </span>
              <strong className="text-amber-700">{remaining} units</strong>
            </div>
          </div>
          <span className="text-[11px] text-[#64748B] hidden sm:inline font-medium">
            Missed days carry zero penalty
          </span>
        </div>

        {/* Key Practice Questions */}
        {topic.practiceQuestions && topic.practiceQuestions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
            <h4 className="text-xs font-bold text-[#0B172A] mb-2 uppercase tracking-wider">Practice Challenge</h4>
            <div className="space-y-2">
              {topic.practiceQuestions.slice(0, 2).map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs hover:border-[#CBD5E1] transition-all">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#12B8A6]" />
                    <span className="font-semibold text-[#0B172A]">{q.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">{q.difficulty}</span>
                  </div>
                  {q.url && (
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#087F73] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                    >
                      Solve <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Effort Logging Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Log Preparation Effort: ${topic.title}`}
        subtitle="Record your focused study session to update your adaptive workload."
      >
        <form onSubmit={handleLogEffort} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
              Effort Units Covered (Planned: {remaining} remaining)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnitsCovered(u)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    unitsCovered === u
                      ? 'bg-[#12B8A6] text-white border-[#12B8A6] shadow-sm'
                      : 'bg-white text-[#0B172A] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {u} {u === 1 ? 'Unit' : 'Units'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
              Time Spent (Minutes)
            </label>
            <input
              type="number"
              min="10"
              max="360"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
              Confidence Rating (1 to 5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setConfidence(star)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    confidence === star
                      ? 'bg-[#E5F7F4] text-[#087F73] border-[#12B8A6]'
                      : 'bg-white text-slate-600 border-[#E2E8F0]'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${confidence >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                  <span>{star}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
              Study Notes / Key Takeaways (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mastered two-pointer converging pattern. Solved 3Sum with sorting."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Complete & Sync Horizon
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TodaysFocusCard;
