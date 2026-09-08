'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 text-zinc-950">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 text-white shadow-lg mb-4 ring-4 ring-zinc-100">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Linkal Platform</h1>
          <p className="text-xs text-zinc-500 font-semibold mt-1">
            Platform Owner Portal &bull; High-Converting Storefront Builder Engine
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
          <div className="mb-6 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-1.5 text-zinc-900 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin Authentication</span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Enter your platform owner credentials to manage and publish storefronts.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Username / Owner ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-zinc-950 hover:bg-black text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features highlights */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-500 font-semibold">
          <div className="flex items-center justify-center gap-1 bg-white p-2 rounded-lg border border-zinc-200 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Instant Web Deploy</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white p-2 rounded-lg border border-zinc-200 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>WhatsApp CTAs</span>
          </div>
          <div className="flex items-center justify-center gap-1 bg-white p-2 rounded-lg border border-zinc-200 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            <span>Pure Static HTML</span>
          </div>
        </div>
      </div>
    </div>
  );
}
