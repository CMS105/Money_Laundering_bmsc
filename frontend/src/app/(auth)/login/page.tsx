'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('analyst@launderylens.ai');
  const [password, setPassword] = useState('LaunderyLens@2026');
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1220] px-4 select-none relative overflow-hidden">
      {/* Subtle Background Radial Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#263449_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Authentication Container */}
      <div className="relative w-full max-w-md bg-[#111C2E] border border-[#263449] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] p-8">
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#172337] border border-[#263449] mb-3 text-[#38BDF8] shadow-inner">
            <ShieldAlert className="w-6 h-6 text-[#38BDF8]" />
          </div>
          <h1 className="text-xl font-black tracking-wide text-[#E5E7EB] uppercase">
            LaunderyLens
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 font-mono">
            Multi-Source Financial Crime Intelligence Platform
          </p>
        </div>

        {/* Security Classification Banner */}
        <div className="mb-6 p-2.5 rounded-lg bg-[#172337]/70 border border-[#263449] text-center">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] font-bold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            Restricted Surveillance Access · Level 4
          </p>
          <p className="text-[10px] text-[#64748B] mt-0.5">
            Authorized AML investigators &amp; FIU compliance officers only
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2.5 text-xs text-[#EF4444]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#94A3B8] mb-1.5 font-mono">
              Analyst Identifier / Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="analyst@launderylens.ai"
                className="w-full bg-[#0B1220] border border-[#263449] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] rounded-md pl-9 pr-3 py-2 text-xs font-mono text-[#E5E7EB] placeholder-[#64748B] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#94A3B8] mb-1.5 font-mono">
              Cryptographic Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#0B1220] border border-[#263449] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] rounded-md pl-9 pr-3 py-2 text-xs font-mono text-[#E5E7EB] placeholder-[#64748B] outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#172337] hover:bg-[#263449] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-xs font-bold text-[#E5E7EB] transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating Session...' : 'Authenticate & Enter Surveillance'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
          </button>
        </form>

        {/* Quick Demo Access Bypass Button */}
        <div className="mt-5 pt-4 border-t border-[#263449] text-center">
          <p className="text-[11px] text-[#64748B] mb-2 font-mono">
            Demo Credentials Pre-filled:
          </p>
          <button
            type="button"
            onClick={handleInstantDemo}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#0B1220] hover:bg-[#172337] border border-[#263449] text-[11px] font-mono text-[#38BDF8] transition-colors"
          >
            <KeyRound className="w-3 h-3 text-[#38BDF8]" />
            <span>One-Click Instant Lead Investigator Login</span>
          </button>
        </div>

        {/* Footer Audit Notice */}
        <p className="mt-6 text-[10px] text-center text-[#64748B] font-mono">
          System activity logged &amp; monitored pursuant to 31 U.S.C. § 5318(g)
        </p>
      </div>
    </div>
  );
}
