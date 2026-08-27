import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Compass,
  BookOpen,
  Calendar,
  Briefcase,
  Bot,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Settings,
  Menu,
  X
} from 'lucide-react';
import Button from '../common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = isAuthenticated
    ? [
        { label: 'Dashboard', path: '/dashboard', icon: Compass },
        { label: 'Roadmap', path: '/dashboard/roadmap', icon: BookOpen },
        { label: "Today's Topic", path: '/dashboard/topics', icon: Calendar },
        { label: 'Opportunities', path: '/dashboard/opportunities', icon: Briefcase },
        { label: 'AI Mentor', path: '/dashboard/mentor', icon: Bot }
      ]
    : [
        { label: 'Features', action: () => handleScrollToSection('features') },
        { label: 'How It Works', action: () => handleScrollToSection('how-it-works') },
        { label: 'Why BeyondCGPA', action: () => handleScrollToSection('why-beyondcgpa') },
        { label: 'FAQ', action: () => handleScrollToSection('faq') }
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="relative flex items-center justify-center">
            <img
              src="/logo.png"
              alt="BeyondCGPA Logo"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl sm:text-2xl text-[#0B172A] tracking-tight flex items-center">
              Beyond<span className="text-[#12B8A6]">CGPA</span>
            </span>
            <span className="text-[10px] text-[#64748B] font-medium -mt-1 tracking-wider uppercase">
              Career Intelligence Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {isAuthenticated ? (
            navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-[#E5F7F4] text-[#087F73] font-semibold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0B172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${active ? 'text-[#12B8A6]' : 'text-[#64748B]'}`} />}
                  <span>{link.label}</span>
                </Link>
              );
            })
          ) : (
            navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#0B172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))
          )}
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B172A] transition-all cursor-pointer shadow-xs"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#12B8A6] text-[10px] font-bold text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E2E8F0] bg-white shadow-xl z-50 overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#12B8A6]" />
                        <h4 className="text-sm font-bold text-[#0B172A]">Notifications</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAsRead('all')}
                          className="text-xs text-[#087F73] font-medium hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#64748B]">
                          No notifications yet. You're up to date!
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.link) navigate(n.link);
                              setIsNotifOpen(false);
                            }}
                            className={`p-4 transition-colors hover:bg-[#F8FAFC] cursor-pointer flex gap-3 ${
                              !n.isRead ? 'bg-[#E5F7F4]/30' : ''
                            }`}
                          >
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-[#12B8A6] shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-[#0B172A]">{n.title}</p>
                              <p className="text-xs text-[#64748B] mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-all cursor-pointer shadow-xs"
                >
                  <img
                    src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=student'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg object-cover bg-teal-50"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#0B172A] truncate max-w-[110px]">{user?.name}</span>
                    <span className="text-[10px] text-[#64748B] truncate max-w-[110px]">{user?.branch || 'Engineering'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#64748B]" />
                </button>

                {/* Profile Menu Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E2E8F0] bg-white shadow-xl z-50 overflow-hidden animate-fade-in divide-y divide-[#F1F5F9]">
                    <div className="p-4 bg-[#F8FAFC]">
                      <p className="text-xs font-bold text-[#0B172A]">{user?.name}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#0B172A] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#64748B]" />
                        <span>Profile & Goal Settings</span>
                      </Link>
                      <Link
                        to="/dashboard/roadmap"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#0B172A] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-[#64748B]" />
                        <span>Adaptive Roadmap</span>
                      </Link>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#64748B] hover:text-[#0B172A] hover:bg-[#F8FAFC]"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-lg">
          {isAuthenticated ? (
            navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                    active ? 'bg-[#E5F7F4] text-[#087F73] font-semibold' : 'text-[#64748B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })
          ) : (
            navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              >
                {link.label}
              </button>
            ))
          )}

          {!isAuthenticated && (
            <div className="pt-4 flex flex-col gap-2">
              <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
