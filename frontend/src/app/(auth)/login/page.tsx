'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('analyst@launderylens.ai');
  const [password, setPassword] = useState('LaunderLens@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Authentication rejected. Verify credentials.');
    }
  };

  const handleInstantDemo = () => {
    demoLogin();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090B] px-4 select-none relative overflow-hidden font-sans">
      {/* Background radial dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1F1F23_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-sm card-fintech p-7 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-8 h-8 rounded bg-[#18181B] border border-white/[0.12] flex items-center justify-center text-white mx-auto mb-2.5 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <circle cx="12" cy="12" r="8" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h1 className="text-base font-semibold tracking-tight text-[#FAFAFA]">
            LaunderLens
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5 font-mono">
            Institutional Financial Crime Intelligence
          </p>
        </div>

        {/* Security Classification Banner */}
        <div className="mb-5 p-2 rounded bg-[#18181B] border border-white/[0.06] text-center flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#A1A1AA]">
            Restricted Surveillance Access (L4)
          </span>
        </div>

        {/* Accessible Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-2.5 rounded bg-rose-500/10 border border-rose-500/25 flex items-center gap-2 text-xs text-rose-300 font-mono"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
              Analyst Identifier
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="analyst@launderylens.ai"
                className="w-full bg-[#09090B] border border-white/[0.08] focus:border-white/30 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-[#FAFAFA] placeholder-[#52525B] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-1">
              Passphrase
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#09090B] border border-white/[0.08] focus:border-white/30 rounded pl-8 pr-8 py-1.5 text-xs font-mono text-[#FAFAFA] placeholder-[#52525B] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#FAFAFA] transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide passphrase' : 'Show passphrase'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded bg-[#FAFAFA] hover:bg-zinc-200 text-xs font-semibold text-[#09090B] transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Authenticate Session'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#09090B]" />
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.07] text-center">
          <button
            type="button"
            onClick={handleInstantDemo}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-white/[0.07] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <KeyRound className="w-3 h-3 text-zinc-400" />
            <span>Instant Lead Investigator Access</span>
          </button>
        </div>

        {/* Statutory Audit Notice */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-center text-[#52525B] font-mono">
          <ShieldCheck className="w-3 h-3 text-[#52525B]" />
          <span>31 U.S.C. § 5318(g) Safe Harbor Compliance</span>
        </div>
      </div>
    </div>
  );
}
