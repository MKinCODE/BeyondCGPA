import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Briefcase, ArrowRight, ExternalLink, Sparkles, MapPin, Building } from 'lucide-react';
import { opportunityAPI } from '../../services/api';

export const MatchedOpportunitiesWidget = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await opportunityAPI.getFeed();
        if (res.data?.success) {
          setOpportunities(res.data.opportunities.slice(0, 3));
        }
      } catch (err) {
        console.warn('Error fetching matched opportunities widget:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <Card className="bg-white border-[#E2E8F0] card-interactive">
      <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#E5F7F4] text-[#087F73]">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#0B172A]">CIE Matched Opportunities</h3>
              <span className="text-[10px] text-[#087F73] font-bold bg-[#E5F7F4] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Relevance
              </span>
            </div>
            <p className="text-xs text-[#64748B]">Curated internships & roles matched to your target domain</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/opportunities')}
          icon={ArrowRight}
          iconPosition="right"
        >
          View All Feed
        </Button>
      </div>

      <div className="divide-y divide-[#F1F5F9] pt-2">
        {opportunities.map((item) => {
          const opp = item.opportunity;
          return (
            <div key={opp._id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] p-2 rounded-xl transition-colors">
              <div className="flex items-start gap-3">
                <img
                  src={opp.companyLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${opp.company}`}
                  alt={opp.company}
                  className="w-10 h-10 rounded-xl object-contain bg-white border border-[#E2E8F0] p-1 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B172A]">{opp.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.matchScore}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5">
                    <span className="font-medium text-[#0B172A]">{opp.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{opp.salaryRange}</span>
                  </div>
                  {item.matchReasons && item.matchReasons.length > 0 && (
                    <p className="text-[11px] text-[#087F73] font-medium mt-1">
                      💡 {item.matchReasons[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href={opp.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#12B8A6] text-white hover:bg-[#087F73] transition-colors shadow-xs"
                >
                  Apply <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MatchedOpportunitiesWidget;
