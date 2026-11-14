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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LaunderyLensLogo from '@/components/react-bits/LaunderyLensLogo';
import DotGridBackground from '@/components/react-bits/DotGridBackground';
import StatusMark from '@/components/react-bits/StatusMark';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('analyst@launderylens.ai');
  const [password, setPassword] = useState('LaunderyLens@2026');
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#172B35] px-4 select-none relative overflow-hidden">
      {/* Calm Warm Geometric Dot Grid Background */}
      <DotGridBackground dotColor="rgba(232, 229, 218, 0.05)" spacing={24} />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-[#1E3541] border border-[#284250] rounded-xl shadow-[0_20px_40px_-15px_rgba(18,34,42,0.8),inset_0_1px_0_0_rgba(232,229,218,0.06)] p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <LaunderyLensLogo size="lg" showSubtitle={false} className="justify-center mb-3" />
          <h1 className="text-xl font-extrabold tracking-wide text-[#E8E5DA] uppercase font-sans">
            LaunderyLens
          </h1>
          <p className="text-xs text-[#82918E] mt-1 font-mono">
            Financial Crime Intelligence &amp; Investigation Platform
          </p>
        </div>

        {/* Security Classification Banner */}
        <div className="mb-6 p-3 rounded-lg bg-[#253F4D] border border-[#284250] text-center">
          <div className="flex items-center justify-center gap-2">
            <StatusMark status="active" label="Restricted Surveillance Access" size="sm" />
          </div>
          <p className="text-[11px] text-[#A3B3AF] mt-1 font-mono">
            Authorized AML investigators &amp; FIU compliance officers only
          </p>
        </div>

        {/* Accessible Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-md bg-[#C75B55]/15 border border-[#C75B55]/40 flex items-center gap-2.5 text-xs text-[#E8E5DA] font-mono animate-in fade-in duration-200"
          >
            <AlertCircle className="w-4 h-4 text-[#C75B55] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#A3B3AF] mb-1.5 font-mono">
              Analyst Identifier / Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#82918E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="analyst@launderylens.ai"
                className="w-full bg-[#172B35] border border-[#284250] focus:border-[#75A99A] focus:ring-1 focus:ring-[#75A99A] rounded-md pl-9 pr-3 py-2 text-xs font-mono text-[#E8E5DA] placeholder-[#82918E] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#A3B3AF] mb-1.5 font-mono">
              Cryptographic Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#82918E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full bg-[#172B35] border border-[#284250] focus:border-[#75A99A] focus:ring-1 focus:ring-[#75A99A] rounded-md pl-9 pr-10 py-2 text-xs font-mono text-[#E8E5DA] placeholder-[#82918E] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#82918E] hover:text-[#E8E5DA] transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide passphrase' : 'Show passphrase'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#75A99A] hover:bg-[#8BBDB0] text-xs font-bold text-[#172B35] transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating Session...' : 'Authenticate & Enter Surveillance'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#172B35]" />
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="mt-5 pt-4 border-t border-[#284250] text-center">
          <p className="text-[11px] text-[#82918E] mb-2 font-mono">
            Pre-configured Lead Investigator Credentials:
          </p>
          <button
            type="button"
            onClick={handleInstantDemo}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#172B35] hover:bg-[#253F4D] border border-[#284250] text-[11px] font-mono text-[#75A99A] hover:text-[#8BBDB0] transition-colors cursor-pointer"
          >
            <KeyRound className="w-3 h-3 text-[#75A99A]" />
            <span>One-Click Instant Lead Investigator Login</span>
          </button>
        </div>

        {/* Statutory Audit Notice */}
        <p className="mt-6 text-[10px] text-center text-[#82918E] font-mono leading-relaxed">
          System activity logged &amp; monitored pursuant to 31 U.S.C. § 5318(g) and BSA compliance guidelines.
        </p>
      </div>
    </div>
  );
}
