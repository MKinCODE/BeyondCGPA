import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ScrollReveal from '../components/common/ScrollReveal';
import {
  Layers,
  CheckCircle2,
  Clock,
  BookOpen,
  Code,
  Server,
  Database,
  Cpu,
  Sparkles,
  ExternalLink,
  Star,
  Play,
  Filter
} from 'lucide-react';
import { preparationAPI } from '../services/api';
import { useCIE } from '../context/CIEContext';

const CATEGORIES = [
  { id: 'All', label: 'All Topics' },
  { id: 'DSA', label: 'DSA & Algorithms' },
  { id: 'Development', label: 'Web & API Dev' },
  { id: 'DBMS', label: 'Databases & SQL' },
  { id: 'SystemDesign', label: 'System Design' },
  { id: 'OS', label: 'Operating Systems' },
  { id: 'Projects', label: 'Production Projects' }
];

export const PreparationPage = () => {
  const { roadmap, logPreparationEffort, refreshAll } = useCIE();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isEffortModalOpen, setIsEffortModalOpen] = useState(false);
  const [unitsCovered, setUnitsCovered] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refreshAll();
  }, []);

  const phases = roadmap?.phases || [];

  const filteredPhases = phases.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  const handleOpenTopicModal = (topicWithProgress) => {
    setSelectedTopic(topicWithProgress);
  };

  const handleSubmitEffort = async (e) => {
    e.preventDefault();
    if (!selectedTopic) return;
    setIsSubmitting(true);
    try {
      const topicId = selectedTopic.topic?._id || selectedTopic.topic;
      await logPreparationEffort({
        topicId,
        unitsCovered: Number(unitsCovered),
        durationMinutes: Number(durationMinutes),
        notes,
        confidenceScore: Number(confidence)
      });
      setIsEffortModalOpen(false);
      setSelectedTopic(null);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in bg-white">
      {/* Page Header */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1F5F9]">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="teal" icon={Layers}>
                Adaptive Workload Engine
              </Badge>
              <span className="text-xs text-[#64748B]">Independent of calendar streaks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B172A] tracking-tight mt-1">
              Adaptive Preparation Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Planned learning units adapted to your pace. Missing days carries zero penalty.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#F8FAFC] px-4 py-2 rounded-2xl border border-[#E2E8F0] text-xs shadow-xs">
            <div>
              <span className="text-[#64748B]">Total Allocated: </span>
              <strong className="text-[#0B172A]">{roadmap?.totalAllocatedUnits || 0} units</strong>
            </div>
            <div className="border-l border-[#E2E8F0] pl-4">
              <span className="text-[#64748B]">Remaining: </span>
              <strong className="text-amber-700">{roadmap?.remainingUnits || 0} units</strong>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Category Navigation Filter Tabs */}
      <ScrollReveal direction="up" delay={80}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#12B8A6] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#0B172A] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Roadmap Phases & Topic Cards */}
      <div className="space-y-8">
        {filteredPhases.length === 0 ? (
          <Card className="text-center py-12 border-[#E2E8F0]">
            <Layers className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0B172A]">No topics in this category</h3>
            <p className="text-xs text-[#64748B] mt-1">Select "All Topics" to view the complete curriculum.</p>
          </Card>
        ) : (
          filteredPhases.map((phase, pIdx) => (
            <ScrollReveal key={phase._id || phase.title} direction="up" delay={100 + pIdx * 50}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0B172A] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#12B8A6]" />
                    <span>{phase.title}</span>
                  </h2>
                  <Badge variant="outline">{phase.category}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.topics.map((item) => {
                    const topic = item.topic || {};
                    const progress = item.progress || {};
                    const isCompleted = progress.status === 'Completed';
                    const isInProgress = progress.status === 'InProgress';
                    const remaining = progress.remainingUnits ?? item.allocatedEffortUnits;
                    const completed = progress.completedUnits ?? 0;
                    const total = progress.totalAllocatedUnits ?? item.allocatedEffortUnits;

                    return (
                      <Card
                        key={topic._id || item.slug}
                        onClick={() => handleOpenTopicModal(item)}
                        className={`p-5 relative transition-all card-interactive ${
                          isCompleted
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : isInProgress
                            ? 'border-[#12B8A6] bg-[#E5F7F4]/30'
                            : 'bg-white border-[#E2E8F0]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isInProgress
                                  ? 'bg-[#12B8A6] text-white'
                                  : 'bg-slate-100 text-[#64748B]'
                              }`}>
                                {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                              </span>
                              <span className="text-[10px] font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                                {topic.difficulty || 'Intermediate'}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-[#0B172A]">
                              {topic.title || item.title}
                            </h3>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-[#0B172A]">{completed}/{total}</span>
                            <span className="text-[10px] text-[#64748B] block">Units</span>
                          </div>
                        </div>

                        <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                          {topic.summary || 'Essential patterns and practical implementation exercises.'}
                        </p>

                        {/* Workload Progress Bar */}
                        <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                          <div className="w-1/2 bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-[#12B8A6]'}`}
                              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-[#087F73]">
                            {remaining > 0 ? `${remaining} units remaining` : 'Mastered'}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          ))
        )}
      </div>

      {/* Topic Detail & Practice Modal */}
      {selectedTopic && (
        <Modal
          isOpen={Boolean(selectedTopic)}
          onClose={() => setSelectedTopic(null)}
          title={selectedTopic.topic?.title || selectedTopic.title}
          subtitle={`Category: ${selectedTopic.topic?.category || 'General'} | Difficulty: ${selectedTopic.topic?.difficulty || 'Intermediate'}`}
        >
          <div className="space-y-6 text-sm">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A] mb-1">Concept Summary</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {selectedTopic.topic?.summary || 'Foundational algorithmic concepts and practical problem solving.'}
              </p>
            </div>

            {/* Key Concepts */}
            {selectedTopic.topic?.keyConcepts && selectedTopic.topic.keyConcepts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A] mb-2">Key Architectural & Pattern Takeaways</h4>
                <div className="space-y-2">
                  {selectedTopic.topic.keyConcepts.map((kc, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                      <strong className="text-[#0B172A] block mb-0.5">{kc.title}</strong>
                      <p className="text-[#64748B]">{kc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Questions */}
            {selectedTopic.topic?.practiceQuestions && selectedTopic.topic.practiceQuestions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A] mb-2">Practice Questions</h4>
                <div className="space-y-2">
                  {selectedTopic.topic.practiceQuestions.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs">
                      <div>
                        <span className="font-bold text-[#0B172A] block">{q.title}</span>
                        <span className="text-[10px] text-[#64748B]">{q.platform} • {q.difficulty}</span>
                      </div>
                      {q.url && (
                        <a
                          href={q.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-[#E5F7F4] text-[#087F73] font-bold hover:bg-[#D0F0EB] flex items-center gap-1"
                        >
                          Solve <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[#F1F5F9]">
              <div className="text-xs text-[#64748B]">
                Remaining Workload: <strong className="text-amber-700">{selectedTopic.progress?.remainingUnits ?? 3} units</strong>
              </div>
              <Button
                variant="primary"
                icon={Play}
                onClick={() => setIsEffortModalOpen(true)}
              >
                Log Study Session
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Effort Logging Form Modal */}
      {isEffortModalOpen && (
        <Modal
          isOpen={isEffortModalOpen}
          onClose={() => setIsEffortModalOpen(false)}
          title="Record Preparation Effort"
          subtitle="Updates your adaptive workload units and syncs your readiness horizon."
        >
          <form onSubmit={handleSubmitEffort} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                Effort Units Completed
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnitsCovered(u)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      unitsCovered === u
                        ? 'bg-[#12B8A6] text-white border-[#12B8A6]'
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
                Session Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                Confidence Level (1 - 5)
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
                Notes & Summary (Optional)
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key insights, patterns identified, edge cases discovered..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsEffortModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Effort & Sync Horizon
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PreparationPage;
