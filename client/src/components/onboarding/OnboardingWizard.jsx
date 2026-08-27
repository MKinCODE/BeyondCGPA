import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Compass,
  Code,
  Server,
  Database,
  Cpu,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  GraduationCap
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCIE } from '../../context/CIEContext';

const DOMAIN_OPTIONS = [
  { id: 'Fullstack', title: 'Full Stack Engineering', desc: 'Frontend + Backend APIs, databases & production architecture', icon: Code },
  { id: 'Backend', title: 'Backend & Distributed Systems', desc: 'High-concurrency microservices, caching, Kafka, databases', icon: Server },
  { id: 'Frontend', title: 'Frontend & Web Architecture', desc: 'Modern React, performance optimization, UX & state systems', icon: Compass },
  { id: 'AI/ML', title: 'AI & Machine Learning Engineering', desc: 'LLM agents, PyTorch, model deployment & data pipelines', icon: Cpu },
  { id: 'Cloud/DevOps', title: 'Cloud & DevOps Infrastructure', desc: 'Kubernetes, Docker, CI/CD pipelines & reliability', icon: Database },
  { id: 'Undecided', title: 'Undecided / Exploring', desc: 'Build rock-solid Core CS, DSA, and explore multiple tracks', icon: Sparkles }
];

export const OnboardingWizard = () => {
  const { user, updateLocalUser } = useAuth();
  const { refreshAll } = useCIE();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    targetDomain: 'Fullstack',
    college: user?.college || '',
    branch: user?.branch || 'Computer Science & Engineering',
    graduationYear: user?.graduationYear || 2027,
    weeklyHours: 14,
    preferredPace: 'Balanced',
    currentProficiency: {
      dsa: 'Beginner',
      development: 'Beginner',
      coreCS: 'Beginner',
      systemDesign: 'Beginner'
    },
    targetCompaniesCategory: ['Product-based', 'Startups', 'Tech Giants'],
    interests: ['Web Development', 'System Architecture', 'APIs'],
    knownLanguages: ['JavaScript', 'C++', 'Python']
  });

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const res = await profileAPI.submitOnboarding({
        ...formData,
        rawAnswers: formData
      });

      if (res.data?.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        updateLocalUser(res.data.user);
        await refreshAll();
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to submit onboarding:', err.message);
      alert('Error calibrating career profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 bg-white">
      {/* Step Progress Header */}
      <div className="mb-8 text-center">
        <Badge variant="teal" icon={Sparkles} className="mb-2">
          CIE Baseline Calibration
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B172A] tracking-tight">
          Let's Calibrate Your Career Intelligence Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          BeyondCGPA adapts your roadmap, workload units, and opportunities to your personal pace.
        </p>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === i
                  ? 'w-10 bg-[#12B8A6]'
                  : step > i
                  ? 'w-6 bg-[#087F73]'
                  : 'w-6 bg-[#E2E8F0]'
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="bg-white p-6 sm:p-8 shadow-md border-[#E2E8F0]">
        {/* Step 1: Target Career Domain */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-[#0B172A]">1. What is your primary career target?</h2>
              <p className="text-xs text-[#64748B] mt-0.5">You can adjust this anytime in your profile settings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOMAIN_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = formData.targetDomain === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, targetDomain: opt.id })}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      selected
                        ? 'border-[#12B8A6] bg-[#E5F7F4]/30 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${selected ? 'bg-[#12B8A6] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B172A]">{opt.title}</h3>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: College & Graduation Year */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-[#0B172A]">2. Tell us about your academic timeline</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Used for calculating your readiness horizon and internship eligibility.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                  College / University
                </label>
                <input
                  type="text"
                  placeholder="e.g. National Institute of Technology / IIIT / VIT"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                  Degree / Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#12B8A6] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-1.5">
                  Graduation Year
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2025, 2026, 2027, 2028].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setFormData({ ...formData, graduationYear: year })}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        formData.graduationYear === year
                          ? 'bg-[#12B8A6] text-white border-[#12B8A6]'
                          : 'bg-white text-[#0B172A] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Weekly Time Commitment */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-[#0B172A]">3. How many hours can you commit weekly?</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                BeyondCGPA distributes workload units across your availability. Missed days do not penalize you.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0] text-center space-y-4">
              <div className="text-4xl font-extrabold text-[#087F73]">
                {formData.weeklyHours} <span className="text-base font-normal text-[#64748B]">hours / week</span>
              </div>

              <input
                type="range"
                min="4"
                max="40"
                step="2"
                value={formData.weeklyHours}
                onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#12B8A6]"
              />

              <div className="flex justify-between text-xs text-[#64748B]">
                <span>4 hrs (Light)</span>
                <span>14 hrs (Standard Pace)</span>
                <span>40 hrs (Full-time Prep)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B172A] uppercase tracking-wider mb-2">
                Preferred Learning Strategy
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Balanced', label: 'Balanced Pace', desc: 'Steady mix of DSA, Dev & Core CS' },
                  { id: 'Accelerated', label: 'Fast-Track', desc: 'Focus strictly on high-yield interview topics' },
                  { id: 'DeepFoundation', label: 'Deep Foundation', desc: 'Thorough conceptual mastery from scratch' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredPace: p.id })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.preferredPace === p.id
                        ? 'border-[#12B8A6] bg-[#E5F7F4] text-[#087F73]'
                        : 'border-[#E2E8F0] bg-white text-[#0B172A] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <p className="text-xs font-bold">{p.label}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Current Proficiency Self-Assessment */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-[#0B172A]">4. Rate your current comfort level</h2>
              <p className="text-xs text-[#64748B] mt-0.5">The CIE will adjust allocated effort units based on your baseline.</p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'dsa', label: 'Data Structures & Algorithms (DSA)', desc: 'Arrays, Two Pointers, Trees, Graphs, DP' },
                { key: 'development', label: 'Web & API Development', desc: 'React, Node.js, Express, RESTful APIs' },
                { key: 'coreCS', label: 'Core CS (DBMS, OS, Networks, OOP)', desc: 'Indexes, Transactions, Concurrency, Threads' },
                { key: 'systemDesign', label: 'System Design & Distributed Tech', desc: 'Redis, Caching, Kafka, Load Balancing' }
              ].map((item) => (
                <div key={item.key} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-[#0B172A]">{item.label}</h3>
                    <p className="text-[11px] text-[#64748B]">{item.desc}</p>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            currentProficiency: {
                              ...formData.currentProficiency,
                              [item.key]: lvl
                            }
                          })
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          formData.currentProficiency[item.key] === lvl
                            ? 'bg-[#12B8A6] text-white border-[#12B8A6]'
                            : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Synthesis & Activation */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E5F7F4] text-[#12B8A6] mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#0B172A]">All Set for Calibration!</h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                Click below to let the Career Intelligence Engine generate your customized adaptive roadmap, compute your readiness horizon, and match verified opportunities.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Target Path:</span>
                <strong className="text-[#0B172A]">{formData.targetDomain}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Graduation Year:</span>
                <strong className="text-[#0B172A]">{formData.graduationYear}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Weekly Time:</span>
                <strong className="text-[#087F73]">{formData.weeklyHours} hours / week</strong>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#F1F5F9] mt-6">
          {step > 1 ? (
            <Button variant="ghost" icon={ArrowLeft} onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button variant="primary" icon={ArrowRight} iconPosition="right" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              onClick={handleFinish}
              icon={CheckCircle2}
              iconPosition="right"
            >
              Generate Adaptive Roadmap
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
