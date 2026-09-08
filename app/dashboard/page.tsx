'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Sliders as Menu,
  Sliders,
  Sparkles,
  Layers,
  Plus as FolderPlus,
  Globe as Server,
  Lock as Key,
  Layers as Database,
  ExternalLink as ArrowUpRight,
  Globe as LayoutGrid,
  Download as FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { SiteData, SiteType, SiteStatus } from '@/types/site';

function Upload({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CopyIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publishedId = searchParams.get('published');
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Drawer & Navigation states
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  const [newBannerImg, setNewBannerImg] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newLogoImg, setNewLogoImg] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProd, setUploadingProd] = useState(false);

  // Load sites with bidirectional localStorage sync
  const fetchSites = async () => {
    // 1. Immediately read cached history so user sees their sites with zero flicker
    try {
      const cached = localStorage.getItem('linkal_sites_history');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSites(parsed);
        }
      }
    } catch {}

    try {
      setLoading(true);
      const res = await fetch('/api/sites');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      const serverSites: SiteData[] = data.sites || [];

      // 2. Check if local history has sites not yet synced to server or sites marked live locally
      let finalSites = [...serverSites];
      try {
        const cached = localStorage.getItem('linkal_sites_history');
        if (cached) {
          const localList: SiteData[] = JSON.parse(cached);

          // Merge server sites with local changes (e.g. status: 'live' or newer updatedAt)
          finalSites = serverSites.map((serverSite) => {
            const localMatch = localList.find((l) => l.id === serverSite.id);
            if (localMatch) {
              if (localMatch.status === 'live' && serverSite.status !== 'live') {
                return {
                  ...serverSite,
                  status: 'live',
                  liveUrl: localMatch.liveUrl || `https://${serverSite.slug}.dominal.in`,
                };
              }
              if (
                new Date(localMatch.updatedAt || 0).getTime() >
                new Date(serverSite.updatedAt || 0).getTime()
              ) {
                return { ...serverSite, ...localMatch };
              }
            }
            return serverSite;
          });

          // Add any sites in local cache that the server doesn't have
          const currentIds = new Set(finalSites.map((s) => s.id));
          const missingOnServer = localList.filter((s) => !currentIds.has(s.id));
          if (missingOnServer.length > 0) {
            finalSites = [...missingOnServer, ...finalSites];
            // Asynchronously sync missing sites to server
            fetch('/api/sites/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sites: missingOnServer }),
            }).catch(console.error);
          }
        }
      } catch {}

      setSites(finalSites);
      try {
        localStorage.setItem('linkal_sites_history', JSON.stringify(finalSites));
      } catch {}
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  };

  // Health check state
  const [cloudHealth, setCloudHealth] = useState<{
    connected: boolean;
    isVercelEnv: boolean;
    details: Record<string, boolean>;
    ownerName: string | null;
  } | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setCloudHealth(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchHealth();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Image Upload Helper for modal
  const handleModalFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    setLoadingState: (loading: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setter(base64); // Instant local preview thumbnail
      try {
        setLoadingState(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            filename: file.name,
          }),
        });
        const data = await res.json();
        if (data.url) {
          setter(data.url);
        }
      } catch (err) {
        console.warn('Upload error, kept local preview:', err);
      } finally {
        setLoadingState(false);
      }
    };
    reader.readAsDataURL(file);
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
          bannerImageUrl: newBannerImg || undefined,
          bannerTitle: newBannerTitle || undefined,
          bannerSubtitle: newBannerSubtitle || undefined,
          logoUrl: newLogoImg || undefined,
          productName: newProdName || undefined,
          productPrice: newProdPrice || undefined,
          productImageUrl: newProdImg || undefined,
          productDescription: newProdDesc || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create site');

      const created = data.site;
      const updatedList = [created, ...sites.filter((s) => s.id !== created.id)];
      setSites(updatedList);
      try {
        localStorage.setItem('linkal_sites_history', JSON.stringify(updatedList));
      } catch {}

      setShowCreateModal(false);
      // Reset form
      setNewName('');
      setNewPhone('91');
      setNewBannerImg('');
      setNewBannerTitle('');
      setNewBannerSubtitle('');
      setNewLogoImg('');
      setNewProdName('');
      setNewProdPrice('');
      setNewProdImg('');
      setNewProdDesc('');

      router.push(`/builder/${created.id}`);
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
      const filtered = sites.filter((s) => s.id !== id);
      setSites(filtered);
      try {
        localStorage.setItem('linkal_sites_history', JSON.stringify(filtered));
      } catch {}
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Deployment pipeline encountered an error');
      }

      const publishedSite: SiteData = {
        ...(data.site || site),
        status: 'live',
        liveUrl: data.site?.liveUrl || `https://${site.slug}.dominal.in`,
        deploymentLogs: data.site?.deploymentLogs || site.deploymentLogs,
      };

      setActiveDeploymentSite(publishedSite);

      // Immediately persist to local history
      try {
        const local = localStorage.getItem('linkal_sites_history');
        if (local) {
          const list: SiteData[] = JSON.parse(local);
          const idx = list.findIndex((s) => s.id === publishedSite.id);
          if (idx >= 0) list[idx] = publishedSite;
          else list.unshift(publishedSite);
          localStorage.setItem('linkal_sites_history', JSON.stringify(list));
        } else {
          localStorage.setItem('linkal_sites_history', JSON.stringify([publishedSite]));
        }
      } catch {}

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

  const recentlyPublishedSite = publishedId ? sites.find((s) => s.id === publishedId) : null;

  const stats = {
    total: sites.length,
    live: sites.filter((s) => s.status === 'live').length,
    deploying: sites.filter((s) => s.status === 'deploying').length,
    drafts: sites.filter((s) => s.status === 'draft').length,
    failed: sites.filter((s) => s.status === 'failed').length,
  };

  const getTypeBadge = (type: SiteType) => {
    switch (type) {
      case 'ecommerce':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <ShoppingBag className="w-3 h-3 text-emerald-600" /> E-commerce
          </span>
        );
      case 'single_product':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-semibold">
            <Zap className="w-3 h-3 text-purple-600" /> Single Product
          </span>
        );
      case 'portfolio':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
            <User className="w-3 h-3 text-blue-600" /> Portfolio
          </span>
        );
    }
  };

  const getStatusBadge = (status: SiteStatus) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live
          </span>
        );
      case 'deploying':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" /> Deploying
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-900 text-[11px] font-bold border border-red-300">
            <AlertCircle className="w-3 h-3 text-red-600" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold border border-zinc-300">
            <Clock className="w-3 h-3 text-zinc-500" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 pb-24 md:pb-12">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Top Left Menu Button (Hamburger) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5 text-zinc-900" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-zinc-950 block leading-tight">
                  Linkal SaaS
                </span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
                  Website Builder Engine
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowSetupGuide(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-all"
            >
              <Key className="w-3.5 h-3.5 text-zinc-500" />
              <span>Cloud Settings</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Create New Site</span>
              <span className="sm:hidden">New</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Left Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 drawer-backdrop transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between border-r border-zinc-200 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-950">Linkal Navigation</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Platform Management</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Nav Links */}
              <nav className="p-4 space-y-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-bold transition-all text-left"
                >
                  <LayoutGrid className="w-4 h-4 text-zinc-950" />
                  <span>Dashboard Overview</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 text-xs font-semibold transition-all text-left"
                >
                  <FolderPlus className="w-4 h-4 text-emerald-600" />
                  <span>Create New Site</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setStatusFilter('live');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 text-xs font-semibold transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Live Customer Sites</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                    {stats.live}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowSetupGuide(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 text-xs font-semibold transition-all text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Cloud Settings</span>
                </button>
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50">
              <div className="p-3 bg-white border border-zinc-200 rounded-xl mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-zinc-700" />
                  <span className="text-xs font-bold text-zinc-950">Domain Engine</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Subdomain Provisioning: <code className="text-zinc-950 font-bold font-mono">*.dominal.in</code>
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-red-50 text-red-700 text-xs font-bold transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Cloud Health Check Banner */}
        {cloudHealth && !cloudHealth.connected && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-extrabold block text-amber-950">
                  Cloud Configuration Advisory
                </span>
                <p className="text-amber-800 font-medium mt-0.5">
                  Ensure platform API keys are configured in environment variables for automated domain publishing under *.dominal.in.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSetupGuide(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-900 hover:bg-black text-white text-xs font-bold shrink-0 transition-all"
            >
              Setup Guide
            </button>
          </div>
        )}

        {cloudHealth && cloudHealth.connected && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between text-xs font-semibold text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Live Cloud Integration Active</strong> &bull; Automated publishing connects directly to Linkal servers &amp; Linkal domain servers (*.dominal.in).
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 font-mono font-bold text-[10px] text-emerald-900">
              READY
            </span>
          </div>
        )}

        {/* Recently Published Success Banner */}
        {recentlyPublishedSite && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 shadow-sm space-y-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Storefront Published &amp; Added to My Sites!</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[11px]">
                LIVE NOW
              </span>
            </div>
            <p className="text-xs text-emerald-900 font-medium">
              Your site <strong>&quot;{recentlyPublishedSite.name}&quot;</strong> is now active on Linkal servers and accessible worldwide.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={recentlyPublishedSite.liveUrl || `https://${recentlyPublishedSite.slug}.dominal.in`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Visit Live Storefront</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <span className="font-mono text-xs font-bold text-emerald-800">
                https://{recentlyPublishedSite.slug}.dominal.in
              </span>
            </div>
          </div>
        )}

        {/* Banner / Header Title */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> Platform Owner Control Panel
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">My Sites</h1>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Manage, customize, and view all your published and draft storefronts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create New Site</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
            }}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'border-zinc-950 shadow-sm ring-1 ring-zinc-950'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Sites</span>
              <Globe className="w-4 h-4 text-zinc-950" />
            </div>
            <div className="text-2xl font-black text-zinc-950">{stats.total}</div>
            <p className="text-[11px] text-zinc-500 font-medium mt-1">All managed projects</p>
          </div>

          <div
            onClick={() => setStatusFilter('live')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              statusFilter === 'live'
                ? 'border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Web</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{stats.live}</div>
            <p className="text-[11px] text-emerald-800 font-semibold mt-1">Active on *.dominal.in</p>
          </div>

          <div
            onClick={() => setStatusFilter('draft')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              statusFilter === 'draft'
                ? 'border-zinc-950 shadow-sm ring-1 ring-zinc-950'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Drafts</span>
              <Clock className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="text-2xl font-black text-zinc-950">{stats.drafts}</div>
            <p className="text-[11px] text-zinc-500 font-medium mt-1">In customization</p>
          </div>

          <div
            onClick={() => setStatusFilter('deploying')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              statusFilter === 'deploying'
                ? 'border-amber-600 shadow-sm ring-1 ring-amber-600'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Deploying</span>
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
            </div>
            <div className="text-2xl font-black text-amber-700">{stats.deploying}</div>
            <p className="text-[11px] text-amber-800 font-semibold mt-1">Pipeline in progress</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sites by name or slug..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950"
            >
              <option value="all">All Site Types</option>
              <option value="ecommerce">E-commerce Shop</option>
              <option value="single_product">Single Product</option>
              <option value="portfolio">Personal Portfolio</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950"
            >
              <option value="all">All Statuses</option>
              <option value="live font-bold text-emerald-600">Live</option>
              <option value="draft">Draft</option>
              <option value="deploying">Deploying</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Sites Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white border border-zinc-200 rounded-2xl">
            <div className="w-8 h-8 border-3 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-bold">Loading managed sites...</p>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="py-16 text-center bg-white border border-zinc-200 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6 text-zinc-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950">No sites matched your query</h3>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Try adjusting your search filters or create your first website.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create New Site Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSites.map((site) => (
              <div
                key={site.id}
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top card bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(site.type)}
                        {getStatusBadge(site.status)}
                      </div>
                      <h3 className="font-extrabold text-base text-zinc-950 tracking-tight group-hover:text-black">
                        {site.name}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono font-medium mt-0.5">
                        {site.slug}.dominal.in
                      </p>
                    </div>

                    {site.logoUrl ? (
                      <img
                        src={site.logoUrl}
                        alt={site.name}
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-sm border border-zinc-200">
                        {site.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Details pill */}
                  <div className="py-2.5 px-3 rounded-xl bg-zinc-50 border border-zinc-100 mb-4 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-zinc-600">
                      <span className="font-medium flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp:
                      </span>
                      <span className="font-mono font-bold text-zinc-950">+{site.whatsappNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-600">
                      <span className="font-medium flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-zinc-500" /> Theme Color:
                      </span>
                      <span className="flex items-center gap-1.5 font-mono font-semibold text-zinc-900">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-zinc-300"
                          style={{ backgroundColor: site.themeColor || '#059669' }}
                        />
                        {site.themeColor || '#059669'}
                      </span>
                    </div>
                  </div>

                  {/* Live Domain URL Badge */}
                  {(site.status === 'live' || site.liveUrl) && (
                    <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <a
                          href={site.liveUrl || `https://${site.slug}.dominal.in`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono font-bold text-emerald-800 hover:text-emerald-950 truncate underline"
                          title={site.liveUrl || `https://${site.slug}.dominal.in`}
                        >
                          https://{site.slug}.dominal.in
                        </a>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              site.liveUrl || `https://${site.slug}.dominal.in`
                            );
                            setCopiedSlug(site.slug);
                            setTimeout(() => setCopiedSlug(null), 2000);
                          }}
                          className="px-2 py-1 bg-white border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 transition-all"
                          title="Copy Live Link"
                        >
                          {copiedSlug === site.slug ? (
                            <>
                              <CheckIcon className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <CopyIcon className="w-3 h-3 text-emerald-700" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <a
                          href={site.liveUrl || `https://${site.slug}.dominal.in`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
                          title="Open Live Website"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push(`/builder/${site.id}`)}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-white" />
                      <span>Edit Builder</span>
                    </button>

                    {site.status === 'live' ? (
                      <a
                        href={site.liveUrl || `https://${site.slug}.dominal.in`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Open Live</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => handlePublish(site)}
                        disabled={site.status === 'deploying'}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Publish</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    {site.status === 'live' ? (
                      <button
                        onClick={() => handlePublish(site)}
                        disabled={deploying}
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 text-zinc-400 ${deploying ? 'animate-spin' : ''}`} />
                        <span>{deploying ? 'Deploying...' : 'Re-deploy updates'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(site)}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                      >
                        Not deployed yet
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          window.open(`/api/sites/${site.id}/export`, '_blank')
                        }
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                        title="Download index.html"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteSite(site.id, site.name)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete site"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Bottom Taskbar (Fixed at bottom for handheld devices) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-2 shadow-lg">
        <div className="grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            <Globe className="w-5 h-5 text-zinc-950" />
            <span className="text-[10px] font-bold text-zinc-950 mt-0.5">Overview</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <Plus className="w-5 h-5 text-emerald-700" />
            <span className="text-[10px] font-extrabold text-emerald-700 mt-0.5">New Site</span>
          </button>

          <button
            onClick={() => setStatusFilter('live')}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-bold text-zinc-700 mt-0.5">Live ({stats.live})</span>
          </button>

          <button
            onClick={() => setShowSetupGuide(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] font-bold text-zinc-700 mt-0.5">Settings</span>
          </button>
        </div>
      </nav>

      {/* Modal 1: Create New Site Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 drawer-backdrop"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">Create New Customer Website</h3>
                  <p className="text-xs text-zinc-500 font-medium">Configure store name, banner, logo &amp; products</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4">
              {/* 1. Website Name & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Aura Luxury Handbags"
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    WhatsApp Orders Phone *
                  </label>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="919876543210"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-mono font-bold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Select Template */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  Select Template Blueprint
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('ecommerce')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      newType === 'ecommerce'
                        ? 'border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-zinc-950 block">E-commerce</span>
                    <span className="text-[10px] text-zinc-500 font-medium">Catalog Store</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType('single_product')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      newType === 'single_product'
                        ? 'border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-purple-600 mb-1" />
                    <span className="text-xs font-bold text-zinc-950 block">Single Product</span>
                    <span className="text-[10px] text-zinc-500 font-medium">Hero Landing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType('portfolio')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      newType === 'portfolio'
                        ? 'border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <User className="w-4 h-4 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-zinc-950 block">Portfolio</span>
                    <span className="text-[10px] text-zinc-500 font-medium">Showcase</span>
                  </button>
                </div>
              </div>

              {/* 3. Starting Main Page Banner */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-950">Starting Main Page Banner</span>
                  <span className="text-[10px] font-semibold text-zinc-500">Auto-saved to cloud</span>
                </div>

                <div className="flex items-center gap-3">
                  {newBannerImg ? (
                    <img
                      src={newBannerImg}
                      alt="Banner Preview"
                      className="w-16 h-10 object-cover rounded-lg border border-zinc-300 bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-10 rounded-lg bg-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-400 shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingBanner ? 'Uploading...' : 'Upload Banner Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingBanner}
                        className="hidden"
                        onChange={(e) => handleModalFileUpload(e, setNewBannerImg, setUploadingBanner)}
                      />
                    </label>
                    <input
                      type="url"
                      value={newBannerImg}
                      onChange={(e) => setNewBannerImg(e.target.value)}
                      placeholder="Or paste banner image URL..."
                      className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={newBannerTitle}
                    onChange={(e) => setNewBannerTitle(e.target.value)}
                    placeholder="Banner Headline (e.g. Autumn Collection)..."
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                  />
                  <input
                    type="text"
                    value={newBannerSubtitle}
                    onChange={(e) => setNewBannerSubtitle(e.target.value)}
                    placeholder="Banner Subtitle / Description..."
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                  />
                </div>
              </div>

              {/* 4. Brand Logo */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-zinc-950 block">Brand Logo (Optional)</span>
                <div className="flex items-center gap-3">
                  {newLogoImg ? (
                    <img
                      src={newLogoImg}
                      alt="Logo Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-zinc-300 bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-400 shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-900 text-xs font-bold cursor-pointer transition-all shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingLogo}
                        className="hidden"
                        onChange={(e) => handleModalFileUpload(e, setNewLogoImg, setUploadingLogo)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* 5. First Product (For E-commerce or Single Product) */}
              {(newType === 'ecommerce' || newType === 'single_product') && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-950">First Product Showcase</span>
                    <span className="text-[10px] font-semibold text-zinc-500">Upload product image directly</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {newProdImg ? (
                      <img
                        src={newProdImg}
                        alt="Product Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-zinc-300 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-400 shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingProd ? 'Uploading...' : 'Upload Product Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingProd}
                          className="hidden"
                          onChange={(e) => handleModalFileUpload(e, setNewProdImg, setUploadingProd)}
                        />
                      </label>
                      <input
                        type="url"
                        value={newProdImg}
                        onChange={(e) => setNewProdImg(e.target.value)}
                        placeholder="Or paste product image URL..."
                        className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="Product Name..."
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                    />
                    <input
                      type="text"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="Price (e.g. 2,499)..."
                      className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                    />
                  </div>

                  <input
                    type="text"
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Short product description..."
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating || uploadingBanner || uploadingLogo || uploadingProd}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {creating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Initialize &amp; Open Builder</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Deployment Progress / Logs Modal */}
      {activeDeploymentSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 drawer-backdrop"
            onClick={() => !deploying && setActiveDeploymentSite(null)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">
                    Publishing {activeDeploymentSite.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    Target Domain: https://{activeDeploymentSite.slug}.dominal.in
                  </p>
                </div>
              </div>
              {!deploying && (
                <button
                  onClick={() => setActiveDeploymentSite(null)}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Logs List */}
            <div className="bg-zinc-950 rounded-xl p-4 font-mono text-xs text-zinc-300 max-h-72 overflow-y-auto space-y-2 border border-zinc-800">
              {activeDeploymentSite.deploymentLogs?.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-zinc-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`font-bold uppercase text-[10px] ${
                      log.status === 'failed'
                        ? 'text-red-400'
                        : log.status === 'success'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    [{log.step.toUpperCase()}]
                  </span>
                  <span className="text-zinc-200">{log.message}</span>
                </div>
              ))}

              {deploying && (
                <div className="flex items-center gap-2 text-amber-400 pt-2 border-t border-zinc-800">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing deployment pipeline steps...</span>
                </div>
              )}
            </div>

            {deploymentError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Deployment Pipeline Encountered an Error</span>
                </div>
                <p className="font-medium text-red-800">{deploymentError}</p>
                <div className="pt-1 text-[11px] text-zinc-600 border-t border-red-200">
                  💡 <strong>Troubleshooting Tip:</strong> Ensure platform API tokens are configured in your platform environment settings.
                </div>
              </div>
            )}

            {activeDeploymentSite.status === 'live' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Storefront Published &amp; Live on Cloud!</span>
                </div>

                <div className="space-y-1.5 bg-white p-3 rounded-lg border border-emerald-200 font-mono text-[11px] text-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-zinc-500">Storage Target:</span>
                    <span className="font-bold text-zinc-950">
                      Linkal Secure Cloud &bull; {activeDeploymentSite.slug}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-zinc-500">Live Subdomain:</span>
                    <span className="font-bold text-emerald-700">
                      https://{activeDeploymentSite.slug}.dominal.in
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-zinc-500">Hosting Status:</span>
                    <span className="font-bold text-emerald-600">Active &amp; SSL Verified</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={activeDeploymentSite.liveUrl || `https://${activeDeploymentSite.slug}.dominal.in`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Open Live Website</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        activeDeploymentSite.liveUrl || `https://${activeDeploymentSite.slug}.dominal.in`
                      );
                      alert('Live site URL copied to clipboard!');
                    }}
                    className="px-3 py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-950 font-bold transition-all"
                  >
                    Copy Live Link
                  </button>
                </div>

                {/* Embedded Live Preview in Modal */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-zinc-600 font-medium">
                    <span>Live Store Preview:</span>
                    <span className="text-[10px] text-zinc-400">Interactive</span>
                  </div>
                  <div className="w-full h-52 sm:h-60 rounded-xl overflow-hidden border border-zinc-300 bg-white shadow-inner">
                    <iframe
                      src={`/api/sites/${activeDeploymentSite.id}/preview`}
                      className="w-full h-full border-0"
                      title="Published Preview"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveDeploymentSite(null)}
                disabled={deploying}
                className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {deploying ? 'Deployment in progress...' : 'Close Window'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: API Setup Guide Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 drawer-backdrop" onClick={() => setShowSetupGuide(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">Platform Cloud Configuration</h3>
                  <p className="text-xs text-zinc-500 font-medium">Automated Subdomain Provisioning &amp; Edge Hosting</p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupGuide(false)}
                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <span className="font-bold text-zinc-950 block">⚡ Automated Cloud Engine Active</span>
                <p className="text-zinc-600 font-medium">
                  Configured environment keys enable zero-touch publishing of customer storefronts under <code className="text-zinc-950 font-mono bg-zinc-200 px-1 rounded">*.dominal.in</code>.
                </p>
              </div>

              {/* Step 1 */}
              <div className="border border-zinc-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-zinc-950">1. Code Repository Engine</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono font-bold text-[10px] text-zinc-700">ACTIVE</span>
                </div>
                <p className="text-zinc-600 font-medium">
                  Automated compilation &amp; versioned storage for generated customer sites.
                </p>
              </div>

              {/* Step 2 */}
              <div className="border border-zinc-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-zinc-950">2. Production Cloud Hosting</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono font-bold text-[10px] text-zinc-700">ACTIVE</span>
                </div>
                <p className="text-zinc-600 font-medium">
                  Sub-second static distribution with instant SSL security.
                </p>
              </div>

              {/* Step 3 */}
              <div className="border border-zinc-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-zinc-950">3. Edge Domain &amp; SSL Routing</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono font-bold text-[10px] text-zinc-700">ACTIVE</span>
                </div>
                <p className="text-zinc-600 font-medium">
                  Instant CNAME DNS record creation for customer subdomains under dominal.in.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSetupGuide(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all"
              >
                Understood &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-zinc-950 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
