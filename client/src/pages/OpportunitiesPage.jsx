import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ScrollReveal from '../components/common/ScrollReveal';
import {
  Briefcase,
  Sparkles,
  ExternalLink,
  MapPin,
  Building,
  Bookmark,
  CheckCircle2,
  Clock,
  Filter,
  DollarSign,
  Calendar,
  Layers
} from 'lucide-react';
import { opportunityAPI } from '../services/api';

export const OpportunitiesPage = () => {
  const [feed, setFeed] = useState([]);
  const [tracked, setTracked] = useState([]);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'tracker'
  const [typeFilter, setTypeFilter] = useState('All');
  const [workplaceFilter, setWorkplaceFilter] = useState('All');
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    try {
      const [feedRes, trackedRes] = await Promise.all([
        opportunityAPI.getFeed({ type: typeFilter, workplaceType: workplaceFilter }),
        opportunityAPI.getTracked()
      ]);

      if (feedRes.data?.success) {
        setFeed(feedRes.data.opportunities);
      }
      if (trackedRes.data?.success) {
        setTracked(trackedRes.data.tracked);
      }
    } catch (err) {
      console.warn('Error fetching opportunities:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [typeFilter, workplaceFilter]);

  const handleUpdateStatus = async (opportunityId, newStatus) => {
    try {
      await opportunityAPI.updateStatus(opportunityId, { status: newStatus });
      await fetchOpportunities();
      if (selectedOpp && selectedOpp.opportunity._id === opportunityId) {
        setSelectedOpp({ ...selectedOpp, status: newStatus });
      }
    } catch (err) {
      console.warn('Error updating application status:', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in bg-white">
      {/* Header */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1F5F9]">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="teal" icon={Briefcase}>
                CIE Opportunities Engine
              </Badge>
              <span className="text-xs text-[#64748B]">Greenhouse • Lever • Ashby Structured Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B172A] tracking-tight mt-1">
              Verified Opportunities & Matching
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Real internship & early career software roles ranked by CIE algorithmic relevance.
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex gap-1.5 p-1 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-[#12B8A6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B172A]'
              }`}
            >
              Matched Feed ({feed.length})
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-[#12B8A6] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B172A]'
              }`}
            >
              Application Tracker ({tracked.length})
            </button>
          </div>
        </div>
      </ScrollReveal>

      {activeTab === 'feed' ? (
        <div className="space-y-6">
          {/* Filters Bar */}
          <ScrollReveal direction="up" delay={80}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs">
                <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                <span className="text-[#64748B] font-semibold">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent font-bold text-[#0B172A] focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Internship">Internships</option>
                  <option value="EarlyCareer">Early Career / Full-Time</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs">
                <span className="text-[#64748B] font-semibold">Workplace:</span>
                <select
                  value={workplaceFilter}
                  onChange={(e) => setWorkplaceFilter(e.target.value)}
                  className="bg-transparent font-bold text-[#0B172A] focus:outline-none"
                >
                  <option value="All">All Workplace Types</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>
            </div>
          </ScrollReveal>

          {/* Feed List */}
          <div className="space-y-4">
            {feed.map((item, idx) => {
              const opp = item.opportunity;
              return (
                <ScrollReveal key={opp._id} direction="up" delay={100 + idx * 40}>
                  <Card
                    className="p-5 sm:p-6 bg-white hover:border-[#12B8A6] border-[#E2E8F0] transition-all card-interactive"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={opp.companyLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${opp.company}`}
                          alt={opp.company}
                          className="w-12 h-12 rounded-2xl object-contain bg-white border border-[#E2E8F0] p-1.5 shrink-0 shadow-xs"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-[#0B172A]">{opp.title}</h3>
                            <Badge variant="teal" icon={Sparkles}>
                              {item.matchScore}% Match
                            </Badge>
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                              {opp.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                            <span className="font-bold text-[#0B172A]">{opp.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location} ({opp.workplaceType})</span>
                            <span>•</span>
                            <span className="font-medium text-[#087F73]">{opp.salaryRange}</span>
                          </div>

                          {/* CIE Match Reasons */}
                          {item.matchReasons && item.matchReasons.length > 0 && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {item.matchReasons.map((reason, rIdx) => (
                                <span key={rIdx} className="text-[11px] font-medium text-[#087F73] bg-[#E5F7F4] px-2.5 py-0.5 rounded-md">
                                  ✓ {reason}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                        <button
                          onClick={() => handleUpdateStatus(opp._id, item.status === 'Saved' ? 'Discovered' : 'Saved')}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            item.status === 'Saved'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                          }`}
                          title="Save Opportunity"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        <Button
                          variant="pale-teal"
                          size="sm"
                          onClick={() => setSelectedOpp(item)}
                        >
                          Details
                        </Button>

                        <a
                          href={opp.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleUpdateStatus(opp._id, 'Applied')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#12B8A6] text-white hover:bg-[#087F73] transition-colors shadow-xs"
                        >
                          Apply <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Skills Pills */}
                    <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="text-[#64748B] font-semibold">Skills:</span>
                      {(opp.requiredSkills || []).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0B172A]">
                          {skill}
                        </span>
                      ))}
                      {(opp.preferredSkills || []).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#64748B]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      ) : (
        /* Application Tracker View */
        <div className="space-y-4">
          {tracked.length === 0 ? (
            <Card className="text-center py-12 border-[#E2E8F0]">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#0B172A]">No Tracked Applications Yet</h3>
              <p className="text-xs text-[#64748B] mt-1">Save or apply to roles from the feed to track your progress here.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Saved', 'Applied', 'Interviewing', 'Offer'].map((columnStatus, colIdx) => {
                const columnItems = tracked.filter(t => t.status === columnStatus);
                return (
                  <ScrollReveal key={columnStatus} direction="up" delay={60 + colIdx * 40}>
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-3 shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B172A]">{columnStatus}</h3>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0]">
                          {columnItems.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {columnItems.map((item) => (
                          <div key={item._id} className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs text-xs space-y-2 card-interactive">
                            <div className="font-bold text-[#0B172A]">{item.opportunity?.title}</div>
                            <div className="text-[11px] text-[#64748B]">{item.opportunity?.company}</div>

                            <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9]">
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateStatus(item.opportunity?._id, e.target.value)}
                                className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
                              >
                                <option value="Saved">Saved</option>
                                <option value="Applied">Applied</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                              </select>

                              <a
                                href={item.opportunity?.applyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#087F73] hover:underline flex items-center gap-0.5 font-semibold"
                              >
                                Link <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <Modal
          isOpen={Boolean(selectedOpp)}
          onClose={() => setSelectedOpp(null)}
          title={selectedOpp.opportunity.title}
          subtitle={`${selectedOpp.opportunity.company} • ${selectedOpp.opportunity.location}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-[#E5F7F4]/40 border border-[#12B8A6]/20">
              <h4 className="font-bold text-[#087F73] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> CIE Relevance Score: {selectedOpp.matchScore}%
              </h4>
              <ul className="space-y-1 text-xs text-[#0B172A]">
                {(selectedOpp.matchReasons || []).map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-[#0B172A] mb-1">About the Role</h4>
              <p className="text-[#64748B] leading-relaxed">{selectedOpp.opportunity.description}</p>
            </div>

            {selectedOpp.opportunity.responsibilities && (
              <div>
                <h4 className="font-bold uppercase tracking-wider text-[#0B172A] mb-1">Key Responsibilities</h4>
                <ul className="list-disc pl-4 space-y-1 text-[#64748B]">
                  {selectedOpp.opportunity.responsibilities.map((res, i) => (
                    <li key={i}>{res}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[#F1F5F9]">
              <span className="font-semibold text-[#087F73]">{selectedOpp.opportunity.salaryRange}</span>
              <a
                href={selectedOpp.opportunity.applyUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleUpdateStatus(selectedOpp.opportunity._id, 'Applied')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#12B8A6] text-white hover:bg-[#087F73] shadow-xs"
              >
                Apply on Company Site <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OpportunitiesPage;
