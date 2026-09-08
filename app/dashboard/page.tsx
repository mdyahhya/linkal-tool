'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Rocket,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  LogOut,
  ShoppingBag,
  User,
  Zap,
  HelpCircle,
  X,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { SiteData, SiteType, SiteStatus } from '@/types/site';

export default function DashboardPage() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [activeDeploymentSite, setActiveDeploymentSite] = useState<SiteData | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [previewSite, setPreviewSite] = useState<SiteData | null>(null);

  // New site form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<SiteType>('ecommerce');
  const [newPhone, setNewPhone] = useState('91');
  const [creating, setCreating] = useState(false);

  // Load sites
  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sites');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setSites(data.sites || []);
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    try {
      setCreating(true);
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          type: newType,
          whatsappNumber: newPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create site');

      setShowCreateModal(false);
      setNewName('');
      setNewPhone('91');
      router.push(`/builder/${data.site.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSite = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete site');
      setSites(sites.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublish = async (site: SiteData) => {
    setActiveDeploymentSite(site);
    setDeploying(true);
    setDeploymentError(null);

    try {
      const res = await fetch(`/api/sites/${site.id}/publish`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Deployment pipeline encountered an error');
      }

      setActiveDeploymentSite(data.site);
      fetchSites();
    } catch (err: any) {
      setDeploymentError(err.message || 'Deployment failed');
      fetchSites();
    } finally {
      setDeploying(false);
    }
  };

  // Filtered sites
  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || site.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats calculation
  const stats = {
    total: sites.length,
    live: sites.filter((s) => s.status === 'live').length,
    deploying: sites.filter((s) => s.status === 'deploying').length,
    drafts: sites.filter((s) => s.status === 'draft').length,
    failed: sites.filter((s) => s.status === 'failed').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-bold">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">Linkal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SaaS Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Automated Static WhatsApp Commerce</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSetupGuide(true)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700/80 hover:border-slate-600 bg-slate-800/40 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              API &amp; Setup Guide
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Hero Banner & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Customer Sites Overview</h2>
              <p className="text-xs text-slate-400 mt-1">
                Zero-build static sites deployed directly to <code className="text-emerald-400 font-mono">*.dominal.in</code> with WhatsApp conversion.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Site
              </button>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
            <span className="text-xs text-slate-400 font-medium">Total Sites</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white">{stats.total}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2">All customer workspaces</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live &amp; Online
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-400">{stats.live}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2">Active on dominal.in</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Drafts &amp; Building
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-amber-300">
                {stats.drafts + stats.deploying}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2">{stats.failed} failed</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by site title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Templates</option>
              <option value="ecommerce">E-commerce Shop</option>
              <option value="portfolio">Portfolio</option>
              <option value="single_product">Single Product</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="deploying">Deploying</option>
              <option value="failed">Failed</option>
            </select>

            <button
              onClick={fetchSites}
              className="p-2 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              title="Refresh sites"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sites Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading your sites...</p>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Sites Found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              {searchQuery ? 'Try adjusting your search filters.' : 'Get started by creating your first client site.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Site
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => {
              const isLive = site.status === 'live';
              const isDeploying = site.status === 'deploying';
              const isFailed = site.status === 'failed';
              const liveDomainUrl = site.liveUrl || `https://${site.slug}.dominal.in`;

              return (
                <div
                  key={site.id}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-slate-950/50 group"
                >
                  <div>
                    {/* Header: Type and Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1.5">
                        {site.type === 'ecommerce' && <ShoppingBag className="w-3 h-3 text-emerald-400" />}
                        {site.type === 'portfolio' && <User className="w-3 h-3 text-indigo-400" />}
                        {site.type === 'single_product' && <Zap className="w-3 h-3 text-orange-400" />}
                        {site.type === 'ecommerce' && 'Shop (Multi-product)'}
                        {site.type === 'portfolio' && 'Portfolio'}
                        {site.type === 'single_product' && 'Single Product'}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                          isLive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isDeploying
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : isFailed
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLive
                              ? 'bg-emerald-400 animate-pulse'
                              : isDeploying
                              ? 'bg-amber-400 animate-ping'
                              : isFailed
                              ? 'bg-red-400'
                              : 'bg-slate-500'
                          }`}
                        />
                        {site.status}
                      </span>
                    </div>

                    {/* Site Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {site.name}
                    </h3>

                    {/* Slug & WhatsApp */}
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px] text-slate-300 truncate">
                          {site.slug}.dominal.in
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[11px] text-slate-300">+{site.whatsappNumber}</span>
                      </div>
                    </div>

                    {site.lastError && (
                      <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{site.lastError}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => router.push(`/builder/${site.id}`)}
                        className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Builder
                      </button>

                      <button
                        onClick={() => setPreviewSite(site)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Live HTML Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <a
                        href={`/api/sites/${site.id}/export`}
                        download
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download index.html"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isLive ? (
                        <a
                          href={liveDomainUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
                        >
                          <span>Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => handlePublish(site)}
                          disabled={deploying}
                          className="py-1.5 px-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 shadow-md shadow-emerald-500/10 transition-all"
                        >
                          <Rocket className="w-3 h-3" />
                          <span>Publish</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteSite(site.id, site.name)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Site"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE NEW SITE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white tracking-tight">Create New Customer Site</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select one of 3 optimized layouts and provide the initial WhatsApp contact.
            </p>

            <form onSubmit={handleCreateSite} className="mt-6 space-y-5">
              {/* Site Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Site Layout
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setNewType('ecommerce')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      newType === 'ecommerce'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <ShoppingBag className={`w-5 h-5 mb-2 ${newType === 'ecommerce' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <div className="text-xs font-bold text-white">E-Commerce Shop</div>
                    <div className="text-[10px] text-slate-400 mt-1">Multiple products catalog with WhatsApp order buttons.</div>
                  </div>

                  <div
                    onClick={() => setNewType('portfolio')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      newType === 'portfolio'
                        ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <User className={`w-5 h-5 mb-2 ${newType === 'portfolio' ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <div className="text-xs font-bold text-white">Portfolio</div>
                    <div className="text-[10px] text-slate-400 mt-1">Bio, skills tags, project showcase &amp; hire CTA.</div>
                  </div>

                  <div
                    onClick={() => setNewType('single_product')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      newType === 'single_product'
                        ? 'bg-orange-500/10 border-orange-500 text-white shadow-md shadow-orange-500/10'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Zap className={`w-5 h-5 mb-2 ${newType === 'single_product' ? 'text-orange-400' : 'text-slate-400'}`} />
                    <div className="text-xs font-bold text-white">Single Product</div>
                    <div className="text-[10px] text-slate-400 mt-1">Hero product landing page with tech specs &amp; reviews.</div>
                  </div>
                </div>
              </div>

              {/* Site Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Site / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Artisan Coffee Roasters"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  WhatsApp Number (with Country Code, e.g. 919876543210) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="919876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Every order and inquiry button will trigger a prefilled WhatsApp chat to this number.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create & Open Builder'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE DEPLOYMENT PIPELINE MODAL */}
      {activeDeploymentSite && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveDeploymentSite(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Automated Deployment Pipeline</h3>
                <p className="text-xs text-slate-400 font-mono">{activeDeploymentSite.slug}.dominal.in</p>
              </div>
            </div>

            {/* Pipeline Steps Tracker */}
            <div className="mt-4 space-y-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-white">GitHub Repository Creation</div>
                  <div className="text-[11px] text-slate-400">Auto-create repo &amp; commit zero-framework index.html</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-white">Vercel Project &amp; Custom Domain</div>
                  <div className="text-[11px] text-slate-400">Link git repository &amp; configure {activeDeploymentSite.slug}.dominal.in</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-white">Cloudflare CNAME Provisioning</div>
                  <div className="text-[11px] text-slate-400">DNS record pointing to Vercel target (Proxy OFF / Grey Cloud)</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  4
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-white">Live Health Check &amp; Polling</div>
                  <div className="text-[11px] text-slate-400">Poll status until deployment state is READY</div>
                </div>
                {deploying ? (
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>

            {/* Error or Live Link Box */}
            {deploymentError ? (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4" /> Pipeline Alert
                </div>
                <p>{deploymentError}</p>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => handlePublish(activeDeploymentSite)}
                    className="py-1.5 px-3 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                  >
                    Retry Pipeline
                  </button>
                </div>
              </div>
            ) : activeDeploymentSite.status === 'live' ? (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-emerald-400 text-sm font-bold flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Site Is Live on the Web!
                </div>
                <p className="text-xs text-slate-300 mb-3 font-mono">
                  https://{activeDeploymentSite.slug}.dominal.in
                </p>
                <a
                  href={`https://${activeDeploymentSite.slug}.dominal.in`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span>View Live Customer Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : null}

            {/* Logs Viewer */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Execution Logs
              </span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto space-y-1">
                {(activeDeploymentSite.deploymentLogs || []).map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-400">[{l.step}]</span>
                    <span className={l.status === 'failed' ? 'text-red-400' : l.status === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                      {l.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE HTML PREVIEW MODAL */}
      {previewSite && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">{previewSite.name} — Pure HTML Preview</span>
                <span className="text-[11px] text-slate-400 font-mono">({previewSite.slug}.dominal.in)</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/sites/${previewSite.id}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-300 flex items-center gap-1"
                >
                  <span>New Window</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setPreviewSite(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white">
              <iframe
                src={`/api/sites/${previewSite.id}/preview`}
                className="w-full h-full border-none"
                title="Site Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* SETUP GUIDE MODAL */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowSetupGuide(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> API Configuration Reference
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              GitHub, Vercel &amp; Cloudflare Automation Setup
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              All credentials are kept server-side in environment variables and never exposed to the client.
            </p>

            <div className="mt-6 space-y-6 text-xs text-slate-300">
              {/* GitHub */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
                  GitHub Personal Access Token (Classic)
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Go to <strong className="text-white">GitHub &rarr; Settings &rarr; Developer Settings &rarr; Personal access tokens &rarr; Tokens (classic)</strong>.
                  Generate a new token with the <code className="text-emerald-400 font-mono">repo</code> scope (Full control of private repositories).
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-800">
                  GITHUB_TOKEN=ghp_yourPersonalAccessToken<br />
                  GITHUB_OWNER=yourGitHubUsername
                </div>
              </div>

              {/* Vercel */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
                  Vercel REST API Token &amp; Team ID
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Go to <strong className="text-white">Vercel Dashboard &rarr; Account Settings &rarr; Tokens</strong>. Click "Create Token".
                  If deploying under a Team, find your Team ID in <strong className="text-white">Team Settings &rarr; General &rarr; Team ID</strong>.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-800">
                  VERCEL_TOKEN=yourVercelBearerToken<br />
                  VERCEL_TEAM_ID=team_xxxxxxxx (optional, leave blank if personal)
                </div>
              </div>

              {/* Cloudflare */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">3</span>
                  Cloudflare Scoped Token &amp; Zone ID for dominal.in
                </div>
                <p className="text-slate-400 leading-relaxed">
                  In Cloudflare, select the <strong className="text-white">dominal.in</strong> zone. The <strong className="text-white">Zone ID</strong> is on the Overview page on the right sidebar.
                  Then go to <strong className="text-white">My Profile &rarr; API Tokens &rarr; Create Token</strong> &rarr; Create Custom Token: Permissions: <code className="text-emerald-400 font-mono">Zone - DNS - Edit</code> for Zone: <code className="text-emerald-400 font-mono">dominal.in</code>.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-emerald-300 border border-slate-800">
                  CLOUDFLARE_API_TOKEN=yourCloudflareDnsEditToken<br />
                  CLOUDFLARE_ZONE_ID=yourDominalZoneId
                </div>
              </div>

              {/* Note */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[11px]">
                💡 In local development without tokens, the pipeline runs in preview mode so you can test all builder features and preview the pure static HTML files!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
