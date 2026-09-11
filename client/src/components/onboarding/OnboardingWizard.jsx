import React, { useState, useEffect } from 'react';
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
  GraduationCap,
  Layers,
  Zap,
  Target,
  Sliders
} from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { profileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCIE } from '../../context/CIEContext';

const DOMAIN_ICONS = {
  Fullstack: Code,
  Backend: Server,
  Frontend: Compass,
  'AI/ML': Cpu,
  'Cloud/DevOps': Database,
  Undecided: Sparkles
};

export const OnboardingWizard = () => {
  const { user, updateLocalUser } = useAuth();
  const { refreshAll } = useCIE();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({
    college: user?.college || '',
    branch: user?.branch || 'Computer Science & Engineering'
  });

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedState, setIsCompletedState] = useState(false);

  // Fetch next question dynamically given previous answers
  const fetchNextQuestion = async (updatedAnswers) => {
    setIsLoadingQuestion(true);
    try {
      const res = await profileAPI.getNextOnboardingQuestion(updatedAnswers);
      if (res.data?.success) {
        const q = res.data.question;
        if (q.completed) {
          setIsCompletedState(true);
        } else {
          setCurrentQuestion(q);
          // Set initial selection if existing or default
          if (updatedAnswers[q.id] !== undefined) {
            setCurrentSelection(updatedAnswers[q.id]);
          } else if (q.type === 'slider') {
            setCurrentSelection(q.default || 14);
          } else if (q.type === 'multi_select') {
            setCurrentSelection([]);
          } else {
            setCurrentSelection(null);
          }

          if (updatedAnswers[`${q.id}_other`]) {
            setOtherText(updatedAnswers[`${q.id}_other`]);
            setShowOtherInput(true);
          } else {
            setOtherText('');
            setShowOtherInput(false);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load next onboarding question:', err.message);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion(answers);
  }, []);

  const handleSelectOption = (val) => {
    setCurrentSelection(val);
    if (val === 'Other') {
      setShowOtherInput(true);
    }
  };

  const handleToggleMulti = (val) => {
    const list = Array.isArray(currentSelection) ? [...currentSelection] : [];
    if (list.includes(val)) {
      setCurrentSelection(list.filter(item => item !== val));
    } else {
      setCurrentSelection([...list, val]);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    const key = currentQuestion.id;
    const val = currentSelection;
    if (currentQuestion.required && (val === null || val === undefined || (Array.isArray(val) && val.length === 0 && !otherText.trim()))) {
      alert('Please make a selection or specify your details to continue calibration.');
      return;
    }

    const newAnswers = { ...answers, [key]: val };
    if (showOtherInput && otherText.trim()) {
      newAnswers[`${key}_other`] = otherText.trim();
    }

    setAnswers(newAnswers);
    setHistory([...history, { question: currentQuestion, selected: val, otherText }]);

    await fetchNextQuestion(newAnswers);
  };

  const handleBack = async () => {
    if (history.length === 0) return;

    const newHistory = [...history];
    const prevItem = newHistory.pop();
    setHistory(newHistory);

    // Remove the last answer
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion?.id || ''];
    delete newAnswers[`${currentQuestion?.id || ''}_other`];
    if (prevItem) {
      delete newAnswers[prevItem.question.id];
      delete newAnswers[`${prevItem.question.id}_other`];
    }
    setAnswers(newAnswers);
    setIsCompletedState(false);

    await fetchNextQuestion(newAnswers);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Include current question selection if not yet recorded
      const finalAnswers = { ...answers };
      if (currentQuestion && currentSelection !== null && currentSelection !== undefined) {
        finalAnswers[currentQuestion.id] = currentSelection;
      }
      if (currentQuestion && showOtherInput && otherText.trim()) {
        finalAnswers[`${currentQuestion.id}_other`] = otherText.trim();
      }

      const res = await profileAPI.submitOnboarding({
        ...finalAnswers,
        rawAnswers: finalAnswers
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
      console.error('Failed to submit dynamic onboarding:', err.message);
      alert('Error calibrating career profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionNum = currentQuestion?.questionNumber || (history.length + 1);
  const maxLimit = 15;
  const progressPercent = Math.min(100, Math.round((questionNum / 10) * 100));

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 bg-white">
      {/* Header */}
      <div className="mb-6 text-center">
        <Badge variant="teal" icon={Sparkles} className="mb-2">
          CIE Dynamic Baseline Calibration
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B172A] tracking-tight">
          Personalized Career Intelligence Setup
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Adaptive questioning tailors your roadmap phases, DSA priorities, and workload units.
        </p>

        {/* Dynamic Progress Indicator */}
        <div className="mt-5 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-[#64748B] font-medium mb-1.5">
            <span>Question {questionNum}</span>
            <span className="text-[11px] text-slate-400">Max limit: {maxLimit}</span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#12B8A6] h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      <Card className="bg-white p-6 sm:p-8 shadow-md border-[#E2E8F0]">
        {isLoadingQuestion ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#12B8A6] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#64748B]">CIE is evaluating your profile calibration...</p>
          </div>
        ) : isCompletedState ? (
          /* Calibration Synthesis Screen */
          <div className="space-y-6 text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#E5F7F4] text-[#12B8A6] mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#0B172A]">Calibration Profile Complete!</h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                The Career Intelligence Engine has acquired sufficient depth to build your adaptive roadmap, workload pacing, and opportunity matching.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] max-w-md mx-auto text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Target Track:</span>
                <strong className="text-[#0B172A]">{answers.targetDomain || answers.targetDomain_other || 'Fullstack'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">DSA Priority Strategy:</span>
                <strong className="text-[#0B172A]">{answers.dsaPreference || 'Balanced'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Graduation Year:</span>
                <strong className="text-[#0B172A]">{answers.graduationYear || new Date().getFullYear() + 2}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Weekly Time Commitment:</span>
                <strong className="text-[#087F73]">{answers.weeklyHours || 14} hrs / week</strong>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                onClick={handleFinish}
                icon={CheckCircle2}
                iconPosition="right"
                className="w-full sm:w-auto"
              >
                Generate Adaptive Roadmap & Start
              </Button>
            </div>
          </div>
        ) : currentQuestion ? (
          /* Dynamic Question Body */
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0B172A]">
                {currentQuestion.title}
              </h2>
              {currentQuestion.subtitle && (
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                  {currentQuestion.subtitle}
                </p>
              )}
            </div>

            {/* Render Question Options based on type */}
            {currentQuestion.type === 'single_select' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options?.map((opt) => {
                    const Icon = DOMAIN_ICONS[opt.value] || Target;
                    const isSelected = currentSelection === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleSelectOption(opt.value)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'border-[#12B8A6] bg-[#E5F7F4]/30 shadow-xs'
                            : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-[#12B8A6] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#0B172A]">{opt.label}</h3>
                          {opt.description && (
                            <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{opt.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Other / Not Listed Card */}
                  {currentQuestion.allowOther && (
                    <div
                      onClick={() => {
                        handleSelectOption('Other');
                        setShowOtherInput(true);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        currentSelection === 'Other' || showOtherInput
                          ? 'border-[#12B8A6] bg-[#E5F7F4]/30 shadow-xs'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${currentSelection === 'Other' || showOtherInput ? 'bg-[#12B8A6] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0B172A]">Other / Not Listed</h3>
                        <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                          Provide custom specification in free text
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Free Text Input Container */}
                {currentQuestion.allowOther && (showOtherInput || currentSelection === 'Other') && (
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] animate-fade-in space-y-1.5">
                    <label className="block text-xs font-bold text-[#0B172A]">
                      Specify custom response:
                    </label>
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder={currentQuestion.otherPlaceholder || "Type details..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0B172A] focus:outline-none focus:border-[#12B8A6]"
                    />
                  </div>
                )}
              </div>
            )}

            {currentQuestion.type === 'year_select' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {currentQuestion.options?.map((opt) => {
                    const isSelected = currentSelection === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectOption(opt.value)}
                        className={`py-3.5 px-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#12B8A6] text-white border-[#12B8A6] shadow-xs'
                            : 'bg-white text-[#0B172A] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentQuestion.type === 'slider' && (
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0] text-center space-y-4">
                <div className="text-4xl font-extrabold text-[#087F73]">
                  {currentSelection ?? 14} <span className="text-base font-normal text-[#64748B]">hours / week</span>
                </div>

                <input
                  type="range"
                  min={currentQuestion.min || 4}
                  max={currentQuestion.max || 40}
                  step={currentQuestion.step || 2}
                  value={currentSelection ?? 14}
                  onChange={(e) => handleSelectOption(Number(e.target.value))}
                  className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#12B8A6]"
                />

                <div className="flex justify-between text-xs text-[#64748B]">
                  <span>4 hrs (Light)</span>
                  <span>14 hrs (Standard Pace)</span>
                  <span>40 hrs (Full-time Prep)</span>
                </div>
              </div>
            )}

            {currentQuestion.type === 'multi_select' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options?.map((opt) => {
                    const isChecked = Array.isArray(currentSelection) && currentSelection.includes(opt.value);
                    return (
                      <div
                        key={opt.value}
                        onClick={() => handleToggleMulti(opt.value)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'border-[#12B8A6] bg-[#E5F7F4]/40 text-[#087F73]'
                            : 'border-[#E2E8F0] bg-white text-[#0B172A] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <span className="text-xs font-bold">{opt.label}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-[#12B8A6] border-[#12B8A6] text-white' : 'border-[#CBD5E1]'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}

                  {currentQuestion.allowOther && (
                    <div
                      onClick={() => setShowOtherInput(!showOtherInput)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        showOtherInput
                          ? 'border-[#12B8A6] bg-[#E5F7F4]/40 text-[#087F73]'
                          : 'border-[#E2E8F0] bg-white text-[#0B172A] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="text-xs font-bold">Other / Additional skills</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        showOtherInput ? 'bg-[#12B8A6] border-[#12B8A6] text-white' : 'border-[#CBD5E1]'
                      }`}>
                        {showOtherInput && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  )}
                </div>

                {currentQuestion.allowOther && showOtherInput && (
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] animate-fade-in space-y-1.5">
                    <label className="block text-xs font-bold text-[#0B172A]">
                      Describe any other tools or skills:
                    </label>
                    <input
                      type="text"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder={currentQuestion.otherPlaceholder || "List other tools or skills..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-xs text-[#0B172A] focus:outline-none focus:border-[#12B8A6]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#F1F5F9] mt-6 gap-3">
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
                {history.length > 0 && (
                  <Button variant="ghost" icon={ArrowLeft} onClick={handleBack}>
                    Back
                  </Button>
                )}

                {currentQuestion.canFinishEarly && (
                  <Button
                    variant="pale-teal"
                    size="sm"
                    onClick={handleFinish}
                    isLoading={isSubmitting}
                    icon={CheckCircle2}
                  >
                    Finish Calibration Now
                  </Button>
                )}
              </div>

              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleNext}
                className="w-full sm:w-auto"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default OnboardingWizard;
