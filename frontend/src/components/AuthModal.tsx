import React, { useState } from 'react';
import { Shield, Key, User, Lock, ArrowRight, CheckCircle2, Sparkles, X, UserCheck } from 'lucide-react';
import { Logo } from './Logo';

export interface UserSession {
  email: string;
  name: string;
  role: 'Commander' | 'Responder' | 'Judge';
  badge: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const DEMO_PROFILES: UserSession[] = [
  {
    name: 'Anjan Shetty (Incident Commander)',
    email: 'commander@floodvista.ai',
    role: 'Commander',
    badge: 'Full Operational Clearance',
  },
  {
    name: 'Tenzing Sherpa (Disaster Field Lead)',
    email: 'responder@nepalrescue.org',
    role: 'Responder',
    badge: 'Field Routing & Triage Ops',
  },
  {
    name: 'Dr. Sarah Lin (UN OCHA Lead Judge)',
    email: 'judge.evaluator@hackathon2026.org',
    role: 'Judge',
    badge: 'Scientific Provenance & Audit',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Commander' | 'Responder' | 'Judge'>('Commander');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFeedback('Please enter an email address.');
      return;
    }
    const session: UserSession = {
      email,
      name: email.split('@')[0].toUpperCase(),
      role: selectedRole,
      badge: selectedRole === 'Commander' ? 'Incident Commander' : selectedRole === 'Judge' ? 'Official Judge' : 'Rescue Responder',
    };
    onLoginSuccess(session);
    onClose();
  };

  const handleSelectDemo = (profile: UserSession) => {
    setEmail(profile.email);
    setPassword('••••••••••••');
    setSelectedRole(profile.role);
    setFeedback(`Selected demo credentials for ${profile.name}`);
    setTimeout(() => {
      onLoginSuccess(profile);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0b1329] p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5">
          <Logo size={40} />
          <div>
            <h3 className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              FLOODVISTA AI ACCESS
            </h3>
            <p className="text-[11px] text-slate-400">Disaster Command Center & Intelligence Portal</p>
          </div>
        </div>

        {/* 1-Click Demo Quick Login Cards */}
        <div className="mb-5 p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 1-Click Demo Credentials (Instant Access)
            </span>
          </div>

          <div className="space-y-1.5">
            {DEMO_PROFILES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDemo(p)}
                className="w-full text-left p-2 rounded-lg bg-slate-950/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.email} &bull; {p.badge}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-500">or sign in manually</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3 mt-2">
          <div>
            <label className="block text-[11px] text-slate-300 mb-1 font-medium">Operational Email</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commander@floodvista.ai"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-300 mb-1 font-medium">Security Key / Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          {feedback && (
            <div className="text-[11px] text-cyan-300 bg-cyan-950/40 p-2 rounded border border-cyan-500/30">
              {feedback}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-cyan-glow transition-all"
            >
              Sign In to Command Center
            </button>
            <button
              type="button"
              onClick={() => {
                onLoginSuccess({
                  email: 'guest.judge@hackathon.ai',
                  name: 'Guest Judge',
                  role: 'Judge',
                  badge: 'Full Operational Sandbox',
                });
                onClose();
              }}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 font-medium"
            >
              Skip (Guest)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
