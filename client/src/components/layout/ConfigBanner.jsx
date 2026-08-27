import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, Server, Database, Key, Bot } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export const ConfigBanner = () => {
  const { diagnostics } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!diagnostics || isDismissed) return null;

  const mongoConfigured = diagnostics.mongodb?.configured;
  const googleConfigured = diagnostics.googleOAuth?.configured;
  const aiConfigured = diagnostics.aiService?.configured;

  const hasMissing = !mongoConfigured || !googleConfigured || !aiConfigured;
  if (!hasMissing) return null;

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs sm:text-sm text-amber-900 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2 max-w-4xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Environment Status:</strong> Some external credentials are in development fallback mode (
            {!googleConfigured && 'Google OAuth, '}
            {!mongoConfigured && 'MongoDB Atlas, '}
            {!aiConfigured && 'NVIDIA AI API'}
            ). Real fallback engines are actively working.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsOpen(true)}
            className="underline font-semibold hover:text-amber-950 transition-colors"
          >
            View Config Details
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-700 hover:text-amber-950 p-1"
          >
            ✕
          </button>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="System Integration & Configuration Diagnostics"
        subtitle="Real-time status of production backend services and external APIs"
      >
        <div className="space-y-4 text-sm">
          {/* MongoDB */}
          <div className="p-4 rounded-xl border border-[#E3E1DA] bg-[#F8F7F2]/50 flex items-start gap-3">
            <Database className="w-5 h-5 text-[#087F73] mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#0B172A]">Database (MongoDB / Mongoose)</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mongoConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                  {mongoConfigured ? 'MongoDB Atlas (Connected)' : 'Embedded Local MongoDB (Active)'}
                </span>
              </div>
              <p className="text-[#64748B] text-xs mt-1">{diagnostics.mongodb?.message}</p>
              {!mongoConfigured && (
                <p className="text-xs text-slate-500 mt-2 bg-white p-2 rounded border border-[#E3E1DA]">
                  💡 To connect your production Atlas cluster: Set <code className="text-teal-700 font-mono">MONGODB_URI=mongodb+srv://...</code> in <code className="font-mono">server/.env</code>.
                </p>
              )}
            </div>
          </div>

          {/* Google OAuth */}
          <div className="p-4 rounded-xl border border-[#E3E1DA] bg-[#F8F7F2]/50 flex items-start gap-3">
            <Key className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#0B172A]">Authentication (Google OAuth 2.0)</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${googleConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {googleConfigured ? 'Configured & Active' : 'Direct Dev Auth Enabled'}
                </span>
              </div>
              <p className="text-[#64748B] text-xs mt-1">{diagnostics.googleOAuth?.message}</p>
              {!googleConfigured && (
                <p className="text-xs text-slate-500 mt-2 bg-white p-2 rounded border border-[#E3E1DA]">
                  💡 To enable Google sign-in: Set <code className="text-teal-700 font-mono">GOOGLE_CLIENT_ID</code> and <code className="text-teal-700 font-mono">GOOGLE_CLIENT_SECRET</code> in <code className="font-mono">server/.env</code>. Direct Dev login is enabled so you can test all features right now!
                </p>
              )}
            </div>
          </div>

          {/* AI Provider */}
          <div className="p-4 rounded-xl border border-[#E3E1DA] bg-[#F8F7F2]/50 flex items-start gap-3">
            <Bot className="w-5 h-5 text-[#12B8A6] mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#0B172A]">AI Intelligence & Mentor (NVIDIA / CIE)</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${aiConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
                  {aiConfigured ? 'NVIDIA AI Engine' : 'CIE Heuristic Expert (Active Fallback)'}
                </span>
              </div>
              <p className="text-[#64748B] text-xs mt-1">{diagnostics.aiService?.message}</p>
              {!aiConfigured && (
                <p className="text-xs text-slate-500 mt-2 bg-white p-2 rounded border border-[#E3E1DA]">
                  💡 To activate NVIDIA AI: Set <code className="text-teal-700 font-mono">NVIDIA_API_KEY=nvapi-...</code> in <code className="font-mono">server/.env</code>. The built-in CIE deterministic reasoning engine answers all student queries with full profile context!
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Got it, continue
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConfigBanner;
