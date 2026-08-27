import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import ConfigBanner from './ConfigBanner';
import { Compass, BookOpen, Calendar, Briefcase, Bot, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCIE } from '../../context/CIEContext';

export const DashboardLayout = () => {
  const { user } = useAuth();
  const { readiness, roadmap } = useCIE();
  const location = useLocation();

  const sidebarLinks = [
    { label: 'Overview', path: '/dashboard', icon: Compass },
    { label: 'Adaptive Roadmap', path: '/dashboard/roadmap', icon: BookOpen },
    { label: "Today's Topic & Calendar", path: '/dashboard/topics', icon: Calendar },
    { label: 'Opportunities Feed', path: '/dashboard/opportunities', icon: Briefcase },
    { label: 'AI Career Mentor', path: '/dashboard/mentor', icon: Bot },
    { label: 'Profile & Goal Settings', path: '/dashboard/profile', icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#12B8A6]/20 selection:text-[#087F73]">
      <ConfigBanner />
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-6">
          {/* Student Mini Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:border-[#CBD5E1] transition-all">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                alt={user?.name}
                className="w-12 h-12 rounded-xl object-cover bg-teal-50 border border-[#E2E8F0]"
              />
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-[#0B172A] truncate">{user?.name}</h3>
                <p className="text-xs text-[#12B8A6] font-semibold truncate">{user?.currentRoleTarget || 'Fullstack Engineer'}</p>
                <p className="text-[11px] text-[#64748B] truncate">{user?.college || 'Engineering'}</p>
              </div>
            </div>

            {/* Quick Readiness Score */}
            {readiness && (
              <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#64748B] font-medium">Readiness Horizon</span>
                  <span className="font-bold text-[#087F73]">{readiness.readinessHorizon?.currentPreparednessScore || 15}%</span>
                </div>
                <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#12B8A6] to-[#087F73] h-full rounded-full transition-all duration-500"
                    style={{ width: `${readiness.readinessHorizon?.currentPreparednessScore || 15}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#64748B] mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#12B8A6]" />
                  <span>{readiness.readinessHorizon?.targetCompletionEstimate || '6 months horizon'}</span>
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Navigation */}
          <nav className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-sm space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-[#E5F7F4] text-[#087F73] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0B172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#12B8A6]' : 'text-[#64748B]'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CIE Core Invariant Notice */}
          <div className="bg-[#E5F7F4]/60 rounded-2xl border border-[#12B8A6]/20 p-4 text-xs text-[#087F73]">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#12B8A6]" />
              Adaptive Workload
            </p>
            <p className="text-[11px] text-[#087F73]/90 leading-relaxed">
              Workload is tracked in effort units. If you miss a day, remaining work does not disappear and there are zero streak penalties.
            </p>
          </div>
        </aside>

        {/* Main Routed Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
