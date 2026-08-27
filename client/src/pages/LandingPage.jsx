import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code,
  Server,
  Database,
  Bot,
  Briefcase,
  Calendar,
  Layers,
  Compass,
  Cpu,
  Flame,
  ShieldCheck,
  TrendingUp,
  Star,
  Check,
  HelpCircle,
  Clock,
  Target,
  Award,
  Zap,
  ChevronDown
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ConfigBanner from '../components/layout/ConfigBanner';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ScrollReveal from '../components/common/ScrollReveal';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active feature preview tab
  const [activeFeatureTab, setActiveFeatureTab] = useState('roadmap');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const featureTabs = [
    {
      id: 'roadmap',
      title: 'Adaptive Roadmap',
      icon: Compass,
      subtitle: 'Workload Effort Units, Not Calendar Streaks',
      description: 'Traditional platforms reset your progress to zero if you miss a single day during college exams. BeyondCGPA measures planned learning effort units. If you miss days, your remaining workload stays intact with zero penalty.',
      points: [
        'Curriculum across DSA, Web Dev, DBMS, OS, System Design & Projects',
        'Effort units scale dynamically with your self-assessed proficiency',
        'Readiness horizon adapts automatically when you adjust weekly study hours'
      ],
      previewBadge: 'Zero Streak Pressure',
      previewHighlight: 'Two Pointers: 3 Units Planned (Remaining: 2)'
    },
    {
      id: 'focus',
      title: "Today's Focus",
      icon: Flame,
      subtitle: 'Algorithmic Next Best Action',
      description: 'Never waste time wondering "What should I practice today?". The Career Intelligence Engine determines the highest-leverage preparation unit based on your active phase and prerequisite dependencies.',
      points: [
        'Integrated practice challenges with hints and time complexity guides',
        'Session time and confidence logging (1 to 5 stars)',
        'Instant telemetry sync to your career readiness horizon'
      ],
      previewBadge: 'Actionable Daily Practice',
      previewHighlight: 'Next Priority: Longest Substring Without Repeating Characters'
    },
    {
      id: 'calendar',
      title: 'Industry Awareness',
      icon: Calendar,
      subtitle: 'LeetCode-Style Historical Date Calendar',
      description: 'Placement interviews for Tier-1 product companies require real-world architectural knowledge (Kafka, Redis, Docker, OAuth PKCE). We publish daily deep-dives with a historical calendar so you can navigate past topics anytime.',
      points: [
        'Completely decoupled from roadmap effort—zero study guilt',
        'Production case studies from Uber, Netflix, OpenAI & Discord',
        'Historical date matrix allows reopening any missed date'
      ],
      previewBadge: 'Daily Architecture Concepts',
      previewHighlight: 'Aug 27: Apache Kafka Partitioned Commit Logs'
    },
    {
      id: 'opportunities',
      title: 'Verified Opportunities',
      icon: Briefcase,
      subtitle: 'Structured ATS Ingestion & Relevance Scoring',
      description: 'Stop sifting through spam job boards. We ingest structured public postings from Greenhouse, Lever, and Ashby, and calculate algorithmic CIE match scores tailored to your target role, graduation year, and skills.',
      points: [
        'Normalized and deduplicated software engineering internships & jobs',
        'Transparent match rationale ("Matches your React & Node.js skills")',
        'Built-in Kanban application tracker (Saved, Applied, Interviewing, Offer)'
      ],
      previewBadge: 'Curated Career Pipeline',
      previewHighlight: 'Postman SWE Early Career (89% CIE Match)'
    },
    {
      id: 'mentor',
      title: 'AI Career Mentor',
      icon: Bot,
      subtitle: 'Coaching with Live Database Context',
      description: 'Unlike generic chatbots with zero knowledge of your progress, BeyondCGPA AI Mentor feeds your real-time MongoDB profile, remaining roadmap units, and active focus directly into its reasoning engine.',
      points: [
        'Powered by NVIDIA AI API and CIE Heuristic Reasoning Engine',
        'Unblocks tricky algorithmic concepts and system design tradeoffs',
        'Suggests interactive quick-reply prompts tailored to your current stage'
      ],
      previewBadge: 'Context-Aware AI',
      previewHighlight: 'AI Mentor: "I see you completed 1 unit in Arrays today..."'
    }
  ];

  const faqs = [
    {
      q: 'How does BeyondCGPA differ from platforms like LeetCode or Striver SDE Sheet?',
      a: 'Generic sheets assume a one-size-fits-all timeline and punish missed days with broken streaks. BeyondCGPA is an intelligent companion that calculates your readiness horizon based on your actual weekly availability (e.g. 14 hrs/week). If college exams intervene, your workload units never disappear and there are zero streak resets.'
    },
    {
      q: 'How does the signup email verification work?',
      a: 'When you create an account with your Name, Email, and Password, a secure 6-digit verification code is dispatched to your email address. Entering this code verifies your identity in our database. Once verified, you can sign in anytime with Email & Password or Google OAuth.'
    },
    {
      q: 'What is the Career Intelligence Engine (CIE)?',
      a: 'CIE is our core orchestration layer. It calibrates your baseline during onboarding, generates an adaptive roadmap, calculates your realistic placement readiness horizon, scores job opportunities against your profile, and powers contextual AI mentoring.'
    },
    {
      q: 'Is Today’s Topic linked to my preparation roadmap?',
      a: 'No! Today’s Topic is a dedicated industry-awareness feature covering modern engineering architectures (Kafka, Redis, WebSockets, Docker). It has its own historical date calendar and does NOT consume roadmap units or create streak anxiety.'
    },
    {
      q: 'How do you source and match job opportunities?',
      a: 'We use structured adapters for ATS sources (Greenhouse, Lever, Ashby) to ingest, validate, and deduplicate internships and early-career software roles. The CIE compares your graduation year, skills, and target domain to produce transparent match scores.'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#12B8A6]/20 selection:text-[#087F73]">
      <ConfigBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 sm:pt-20 sm:pb-32 overflow-hidden bg-white">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#12B8A6]/10 via-[#E5F7F4]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <ScrollReveal direction="up" delay={50}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5F7F4] border border-[#12B8A6]/30 text-[#087F73] text-xs font-bold tracking-wide uppercase shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#12B8A6] animate-pulse" />
                  Career Intelligence Engine for Engineering Students
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={120}>
                <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-black text-[#0B172A] tracking-tight leading-[1.08]">
                  Beyond academics. <br />
                  Beyond average. <br />
                  <span className="text-[#12B8A6] relative inline-block">
                    Beyond CGPA.
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#12B8A6]/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200}>
                <p className="text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
                  A high CGPA alone doesn’t guarantee a top product placement. BeyondCGPA adapts technical preparation to your level, weekly hours, and target domain with <strong>adaptive workloads instead of toxic streaks</strong>.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={280}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <Button
                    size="lg"
                    variant="primary"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth?mode=signup')}
                    className="shadow-lg shadow-[#12B8A6]/20"
                  >
                    {isAuthenticated ? 'Open Dashboard' : 'Calibrate My Career Profile'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById('features');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore Product Features
                  </Button>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={360}>
                <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-[#64748B] flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#12B8A6]" />
                    <span>Workload-based, No streaks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#12B8A6]" />
                    <span>Email OTP & Google Auth</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#12B8A6]" />
                    <span>Verified ATS Pipeline</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Interactive Preview Widget */}
            <div className="lg:col-span-5 relative flex justify-center">
              <ScrollReveal direction="scale" delay={220} className="w-full max-w-md">
                <div className="relative p-6 bg-white rounded-3xl border border-[#E2E8F0] shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-bold text-[#087F73] bg-[#E5F7F4] px-2.5 py-0.5 rounded-full">
                      CIE Live Telemetry
                    </span>
                  </div>

                  <div className="space-y-4 pt-4">
                    {/* Horizon Metric */}
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="flex justify-between text-xs text-[#64748B] mb-1 font-semibold">
                        <span>Readiness Horizon</span>
                        <span className="text-[#087F73] font-bold">~5 Weeks (at 16 hrs/wk)</span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#12B8A6] to-[#087F73] h-full w-2/3 rounded-full" />
                      </div>
                    </div>

                    {/* Today's Focus Card Preview */}
                    <div className="p-4 rounded-2xl border-2 border-[#12B8A6] bg-[#E5F7F4]/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase bg-[#12B8A6] text-white px-2 py-0.5 rounded-md">
                          Today's Focus
                        </span>
                        <span className="text-xs font-bold text-[#0B172A]">DSA Track</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0B172A]">Arrays & Two Pointers</h4>
                      <p className="text-xs text-[#64748B]">Workload: 3 Units Planned (Remaining: 2)</p>
                    </div>

                    {/* Verified Opportunity Pill */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://api.dicebear.com/7.x/identicon/svg?seed=Postman"
                          alt="Company"
                          className="w-9 h-9 rounded-xl object-contain bg-[#F8FAFC] border border-[#E2E8F0] p-1"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#0B172A]">Early Career Fullstack SWE</div>
                          <div className="text-[11px] text-[#64748B]">Postman • Bengaluru</div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#087F73] bg-[#E5F7F4] px-2 py-1 rounded-xl">
                        89% Match
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* WHY BEYOND CGPA SECTION */}
      <section id="why-beyondcgpa" className="py-24 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal direction="up">
              <Badge variant="teal" icon={Target} className="mb-2">
                Why BeyondCGPA?
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B172A] tracking-tight">
                Built specifically to solve the <span className="text-[#12B8A6]">engineering prep dilemma</span>
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-3 leading-relaxed">
                Why 90% of students struggle to crack top tech placements despite high college marks:
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <ScrollReveal direction="up" delay={60}>
              <Card className="h-full bg-white p-7 border-[#E2E8F0] card-interactive">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B172A]">The Toxic Streak Fallacy</h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                  Daily streak counters treat missed exam days as failures. BeyondCGPA measures <strong>learning workload units</strong>. If you miss a week for midterms, your remaining units stay intact. Zero penalty.
                </p>
              </Card>
            </ScrollReveal>

            {/* Pillar 2 */}
            <ScrollReveal direction="up" delay={120}>
              <Card className="h-full bg-white p-7 border-[#E2E8F0] card-interactive">
                <div className="w-12 h-12 rounded-2xl bg-[#E5F7F4] text-[#087F73] flex items-center justify-center mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B172A]">Fixed Roadmaps Don’t Adapt</h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                  Generic PDFs ignore whether you have 6 hours or 20 hours a week. The CIE calibrates your schedule and dynamically re-sequences critical topics so you achieve maximum readiness in the time you have.
                </p>
              </Card>
            </ScrollReveal>

            {/* Pillar 3 */}
            <ScrollReveal direction="up" delay={180}>
              <Card className="h-full bg-white p-7 border-[#E2E8F0] card-interactive">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0B172A]">Beyond Just LeetCode</h3>
                <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                  Interviews test System Architecture, Redis, Kafka, Docker, and Core CS. Our daily Industry Awareness calendar and verified ATS opportunities feed prepare you for full-scale software engineering interviews.
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FEATURE SHOWCASE SECTION */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <ScrollReveal direction="up">
              <Badge variant="teal" icon={Sparkles} className="mb-2">
                Deep Dive Showcase
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B172A] tracking-tight">
                Explore our <span className="text-[#12B8A6]">5 Core Pillars</span>
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-3">
                Click across our core engines to see how BeyondCGPA powers your career preparation:
              </p>
            </ScrollReveal>
          </div>

          {/* Feature Navigation Tabs */}
          <ScrollReveal direction="up" delay={60}>
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none max-w-4xl mx-auto">
              {featureTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeFeatureTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeatureTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-[#12B8A6] text-white shadow-md shadow-[#12B8A6]/20 scale-105'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0B172A] border border-[#E2E8F0] hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          {/* Active Tab Showcase Box */}
          {(() => {
            const tab = featureTabs.find((t) => t.id === activeFeatureTab) || featureTabs[0];
            return (
              <ScrollReveal direction="scale" delay={100} className="mt-8">
                <Card className="bg-white p-8 sm:p-12 border-[#E2E8F0] shadow-xl rounded-3xl max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4 text-left">
                      <Badge variant="teal">{tab.previewBadge}</Badge>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B172A] tracking-tight">
                        {tab.subtitle}
                      </h3>
                      <p className="text-sm text-[#64748B] leading-relaxed">
                        {tab.description}
                      </p>

                      <div className="space-y-2.5 pt-2">
                        {tab.points.map((pt, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#0B172A]">
                            <CheckCircle2 className="w-4 h-4 text-[#12B8A6] shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="primary"
                          icon={ArrowRight}
                          iconPosition="right"
                          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth?mode=signup')}
                        >
                          Experience this in BeyondCGPA
                        </Button>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-[#F8FAFC] p-6 rounded-3xl border border-[#E2E8F0] text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#E5F7F4] text-[#087F73] flex items-center justify-center mx-auto shadow-xs">
                        <tab.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Live Module Snapshot</div>
                        <div className="text-sm font-extrabold text-[#0B172A] mt-1">{tab.previewHighlight}</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#087F73] font-semibold">
                        ✓ 100% End-to-End Functional Subsystem
                      </div>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })()}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal direction="up">
              <Badge variant="teal" icon={Zap} className="mb-2">
                4-Step Process
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B172A] tracking-tight">
                How to get placement ready in <span className="text-[#12B8A6]">4 simple steps</span>
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register & Verify', desc: 'Create your account with Name, Email & Password, and verify with your 6-digit email code.' },
              { step: '02', title: 'Dynamic Calibration', desc: 'Answer quick questions on your target domain, weekly hours, graduation year, and current comfort.' },
              { step: '03', title: 'Adaptive Roadmap', desc: 'The CIE calculates your readiness horizon and generates workload units across DSA, Dev, and Core CS.' },
              { step: '04', title: 'Master & Get Hired', desc: 'Log your effort units, explore daily industry topics, chat with your AI Mentor, and apply to matched roles.' }
            ].map((st, i) => (
              <ScrollReveal key={st.step} direction="up" delay={60 + i * 50}>
                <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm hover:border-[#12B8A6] transition-all card-interactive h-full flex flex-col justify-between">
                  <div>
                    <div className="text-3xl font-black text-[#12B8A6] mb-3">{st.step}</div>
                    <h3 className="text-base font-bold text-[#0B172A]">{st.title}</h3>
                    <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <ScrollReveal direction="up">
              <Badge variant="teal" icon={HelpCircle} className="mb-2">
                Got Questions?
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B172A] tracking-tight">
                Frequently Asked Questions
              </h2>
            </ScrollReveal>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <ScrollReveal key={idx} direction="up" delay={60 + idx * 40}>
                <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden transition-all">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0B172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform duration-300 shrink-0 ${openFaq === idx ? 'rotate-180 text-[#12B8A6]' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#F1F5F9] bg-[#F8FAFC]/40 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL HIGH-IMPACT CTA */}
      <section className="py-24 bg-gradient-to-br from-[#0B172A] via-[#0F233D] to-[#0B172A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#12B8A6]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <ScrollReveal direction="up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#12B8A6] text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Get Placement Ready
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-4 text-white">
              Ready to transcend the CGPA rat-race?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mt-2">
              Join engineering students preparing with genuine career intelligence, adaptive workloads, and verified opportunities.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="scale" delay={160}>
            <div className="pt-4 flex justify-center">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth?mode=signup')}
                icon={ArrowRight}
                iconPosition="right"
                className="text-base px-8 py-4 shadow-xl shadow-[#12B8A6]/30"
              >
                {isAuthenticated ? 'Open Student Dashboard' : 'Calibrate My Career Profile (Sign Up)'}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
