import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Terminal, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#E3E1DA] bg-white pt-16 pb-12 text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 select-none">
              <img src="/logo.png" alt="BeyondCGPA Logo" className="h-9 w-auto object-contain" />
              <span className="font-extrabold text-xl text-[#0B172A] tracking-tight">
                Beyond<span className="text-[#12B8A6]">CGPA</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-[#64748B]">
              Your personalized career intelligence engine that adapts preparation to your current level, weekly hours, and evolving direction.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E5F7F4] text-[#087F73] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#12B8A6]" />
              <span>Workload-based, zero streak pressure</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A]">Core Modules</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/dashboard/roadmap" className="hover:text-[#12B8A6] transition-colors">Adaptive Preparation Roadmap</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#12B8A6] transition-colors">Today's Focus & Effort Tracker</Link></li>
              <li><Link to="/dashboard/topics" className="hover:text-[#12B8A6] transition-colors">Industry Awareness Calendar</Link></li>
              <li><Link to="/dashboard/opportunities" className="hover:text-[#12B8A6] transition-colors">CIE Matched Opportunities</Link></li>
              <li><Link to="/dashboard/mentor" className="hover:text-[#12B8A6] transition-colors">AI Career Mentor</Link></li>
            </ul>
          </div>

          {/* Principles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A]">Core Philosophy</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B8A6]" />
                <span>The system adapts to the student</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B8A6]" />
                <span>Learning workload, not daily streaks</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B8A6]" />
                <span>Missed days carry zero penalties</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B8A6]" />
                <span>Persistent, authoritative career intelligence</span>
              </li>
            </ul>
          </div>

          {/* Technology & Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B172A]">Engineering</h4>
            <p className="text-xs leading-relaxed text-[#64748B]">
              Built with Node.js, genuine Express.js, MongoDB Atlas, Mongoose, and React Vite.
            </p>
            <div className="pt-2 text-xs flex flex-col gap-1 text-slate-500">
              <span>Frontend: React + Vite + Tailwind</span>
              <span>Backend: Node.js + Express REST API</span>
              <span>Intelligence: CIE + NVIDIA AI Engine</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E3E1DA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>© {new Date().getFullYear()} BeyondCGPA. All rights reserved. Designed for Engineering Students.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>API Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
