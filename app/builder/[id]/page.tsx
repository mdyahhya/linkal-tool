'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Rocket,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  Trash2,
  ExternalLink,
  ExternalLink as ArrowUpRight,
  Check,
  Globe,
  Sliders,
  Sparkles,
  ShoppingBag,
  User,
  Zap,
  Image as ImageIcon,
  MessageCircle,
  Palette,
  Type,
  AlertCircle,
  X,
  CheckCircle2,
  Layers,
  Sliders as Menu,
  Eye,
  Edit3,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Globe as LayoutGrid,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  SiteData,
  BannerSlide,
  ProductItem,
  PortfolioProject,
  PortfolioSkill,
  TrustBadgeItem,
  ReviewItem,
  FaqItem,
} from '@/types/site';
import { generateStaticHtml } from '@/lib/generator';
import { generateQrSvg, downloadQrPng, downloadQrSvg } from '@/lib/qrcode';

function Upload({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Star({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function FileText({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function QrIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
    </svg>
  );
}

const THEME_PRESETS = [
  { name: 'Emerald', hex: '#059669' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Sunset Orange', hex: '#ea580c' },
  { name: 'Cyan Tech', hex: '#0891b2' },
  { name: 'Dark Slate', hex: '#18181b' },
];

const FONTS: Array<SiteData['fontFamily']> = [
  'Inter',
  'Plus Jakarta Sans',
  'Outfit',
  'Roboto',
  'Poppins',
];

export type TabType =
  | 'general'
  | 'branding'
  | 'announcement'
  | 'slider'
  | 'type_specific'
  | 'trust_badges'
  | 'reviews'
  | 'faq'
  | 'about'
  | 'footer';

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [propagationSeconds, setPropagationSeconds] = useState(30);

  // 30-Second Propagation Countdown Timer
  useEffect(() => {
    let timer: any;
    if (deploying) {
      setPropagationSeconds(30);
      timer = setInterval(() => {
        setPropagationSeconds((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);
    } else {
      setPropagationSeconds(30);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [deploying]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load site data
  useEffect(() => {
    async function loadSite() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sites/${siteId}`);
        if (res.ok) {
          const data = await res.json();
          setSite(data.site);
          return;
        }

        // Fallback: check localStorage if server cold started
        try {
          const cached = localStorage.getItem('linkal_sites_history');
          if (cached) {
            const list: SiteData[] = JSON.parse(cached);
            const found = list.find((s) => s.id === siteId);
            if (found) {
              setSite(found);
              // Sync back to server
              fetch(`/api/sites/${siteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(found),
              }).catch(console.error);
              return;
            }
          }
        } catch {}

        throw new Error('Site not found');
      } catch (err) {
        console.error('Failed to load site:', err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    if (siteId) loadSite();
  }, [siteId, router]);

  // Generate live preview HTML instantly on every state change
  const previewHtml = useMemo(() => {
    if (!site) return '';
    return generateStaticHtml(site);
  }, [site]);

  // Image Upload Helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      // Immediate visual update in editor & live preview
      onComplete(base64);

      // Async upload to GitHub
      try {
        setUploadingImage(true);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            filename: file.name,
            siteSlug: site?.slug,
          }),
        });
        const data = await res.json();
        if (data.url) {
          onComplete(data.url);
        }
      } catch (err) {
        console.warn('Upload error, kept local preview:', err);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Draft
  const handleSave = async () => {
    if (!site) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
      });
      if (!res.ok) throw new Error('Failed to save site');
      const data = await res.json();
      setSite(data.site);

      // Also backup to localStorage
      try {
        const local = localStorage.getItem('linkal_sites_history');
        if (local) {
          const list: SiteData[] = JSON.parse(local);
          const idx = list.findIndex((s) => s.id === site.id);
          if (idx >= 0) list[idx] = data.site;
          else list.unshift(data.site);
          localStorage.setItem('linkal_sites_history', JSON.stringify(list));
        } else {
          localStorage.setItem('linkal_sites_history', JSON.stringify([data.site]));
        }
      } catch {}

      alert('Changes saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Handle Publish
  const handlePublish = async () => {
    if (!site) return;
    setShowPublishModal(true);
    setDeploying(true);

    try {
      // Save first
      await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
      });

      const res = await fetch(`/api/sites/${site.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Deployment failed');
      }

      const publishedSite: SiteData = {
        ...(data.site || site),
        status: 'live',
        liveUrl: data.site?.liveUrl || `https://${site.slug}.dominal.in`,
        deploymentLogs: data.site?.deploymentLogs || deploymentLogs,
      };

      setSite(publishedSite);
      setDeploymentLogs(publishedSite.deploymentLogs || []);

      // Persist to local history immediately with live URL & status
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

      // Keep popup open so user can inspect live domain link & preview
    } catch (err: any) {
      alert(err.message || 'Publishing failed');
    } finally {
      setDeploying(false);
    }
  };

  // Update site helper with instant state & local cache update
  const updateSiteField = <K extends keyof SiteData>(field: K, value: SiteData[K]) => {
    if (!site) return;
    const updated = { ...site, [field]: value };
    setSite(updated);

    try {
      const cached = localStorage.getItem('linkal_sites_history');
      if (cached) {
        const list: SiteData[] = JSON.parse(cached);
        const idx = list.findIndex((s) => s.id === site.id);
        if (idx >= 0) list[idx] = updated;
        else list.unshift(updated);
        localStorage.setItem('linkal_sites_history', JSON.stringify(list));
      } else {
        localStorage.setItem('linkal_sites_history', JSON.stringify([updated]));
      }
    } catch {}
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading || !site) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-zinc-950 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-zinc-600">Loading site builder studio...</p>
      </div>
    );
  }

  // Device width class
  const getDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-[375px] h-[667px] rounded-3xl shadow-xl border-8 border-zinc-900';
      case 'tablet':
        return 'w-[768px] h-[900px] rounded-2xl shadow-xl border-8 border-zinc-900';
      default:
        return 'w-full h-full rounded-xl border border-zinc-200';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-950">
      {/* Studio Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 px-4 h-15 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {/* Top-Left Hamburger Drawer Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-900 hover:bg-zinc-100 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Sites</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-zinc-950 truncate max-w-[150px] sm:max-w-xs">
              {site.name}
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-zinc-100 font-mono text-[10px] font-bold text-zinc-700">
              {site.slug}.dominal.in
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'desktop'
                ? 'bg-white text-zinc-950 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setPreviewDevice('tablet')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'tablet'
                ? 'bg-white text-zinc-950 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              previewDevice === 'mobile'
                ? 'bg-white text-zinc-950 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 text-xs font-bold transition-all shadow-xs"
            title="Generate & Download QR Code"
          >
            <QrIcon className="w-3.5 h-3.5 text-zinc-900" />
            <span className="hidden sm:inline">QR Code</span>
          </button>

          <button
            onClick={() => window.open(`/api/sites/${site.id}/export`, '_blank')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 text-xs font-bold transition-all"
            title="Download index.html bundle"
          >
            <Download className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-zinc-900" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <button
            onClick={handlePublish}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Slide-over Left Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 drawer-backdrop" onClick={() => setIsMenuOpen(false)} />
          <div className="relative z-10 w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between border-r border-zinc-200 animate-in slide-in-from-left duration-200">
            <div>
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-950">Linkal Studio</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Website Customizer</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push('/dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 text-xs font-bold transition-all text-left"
                >
                  <LayoutGrid className="w-4 h-4 text-zinc-950" />
                  <span>My Sites Overview</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('general');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'general'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-zinc-900" />
                  <span>General &amp; WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('branding');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'branding'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>Logo &amp; Theme Colors</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('announcement');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'announcement'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Top Banner Ticker</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('slider');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'slider'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Hero Banner Images</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('type_specific');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'type_specific'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Products &amp; Catalog</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('trust_badges');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'trust_badges'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Trust Badges</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('reviews');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'reviews'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Customer Reviews</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('faq');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'faq'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>FAQ Accordion</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('about');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'about'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>About Brand Story</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('footer');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'footer'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <Layers className="w-4 h-4 text-zinc-600" />
                  <span>Footer &amp; Social</span>
                </button>
              </nav>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-red-50 text-red-700 text-xs font-bold transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Builder Main Work Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-16 md:pb-0">
        {/* Left Control Editor Pane */}
        <div
          className={`w-full md:w-[480px] lg:w-[520px] bg-white border-r border-zinc-200 flex flex-col h-full overflow-y-auto ${
            mobileViewMode === 'preview' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Editor Sub-Tabs */}
          <div className="p-2.5 border-b border-zinc-200 bg-zinc-50 flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'general'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'branding'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Logo &amp; Theme
            </button>
            <button
              onClick={() => setActiveTab('announcement')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'announcement'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Announcement
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'slider'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Banners
            </button>
            <button
              onClick={() => setActiveTab('type_specific')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'type_specific'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('trust_badges')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'trust_badges'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Trust Badges
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'reviews'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'faq'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'about'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              About Story
            </button>
            <button
              onClick={() => setActiveTab('footer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'footer'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Footer
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 space-y-5 flex-1 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={site.name}
                    onChange={(e) => updateSiteField('name', e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-950 focus:ring-2 focus:ring-zinc-950"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Updates live across headers, titles, and WhatsApp links.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    Subdomain Slug (*.dominal.in)
                  </label>
                  <input
                    type="text"
                    value={site.slug}
                    onChange={(e) =>
                      updateSiteField(
                        'slug',
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-mono font-bold text-zinc-950 focus:ring-2 focus:ring-zinc-950"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Live URL: https://{site.slug}.dominal.in</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    WhatsApp Orders Phone Number (with Country Code)
                  </label>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={site.whatsappNumber}
                      onChange={(e) => updateSiteField('whatsappNumber', e.target.value)}
                      placeholder="919876543210"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-mono font-bold text-zinc-950 focus:ring-2 focus:ring-zinc-950"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">All customer &quot;Buy on WhatsApp&quot; buttons open direct chat with this phone.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    Default WhatsApp Message Pattern
                  </label>
                  <textarea
                    rows={3}
                    value={site.defaultWhatsappMessage || ''}
                    onChange={(e) =>
                      updateSiteField('defaultWhatsappMessage', e.target.value)
                    }
                    placeholder="Hi! I am interested in ordering {item}."
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium text-zinc-950 focus:ring-2 focus:ring-zinc-950"
                  />
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">
                    Use <code className="text-zinc-950 font-bold font-mono">&#123;item&#125;</code> as placeholder for product name.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    Header WhatsApp CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={site.headerCtaText || ''}
                    onChange={(e) => updateSiteField('headerCtaText', e.target.value)}
                    placeholder="Order on WhatsApp"
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium text-zinc-950 focus:ring-2 focus:ring-zinc-950"
                  />
                  <p className="text-[10px] text-zinc-500 font-medium mt-1">
                    Customizes the top navbar button text (e.g. &quot;Order on WhatsApp&quot;, &quot;Hire Me&quot;, &quot;Shop Now&quot;).
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                    Brand Logo
                  </label>
                  
                  <div className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl bg-zinc-50">
                    {site.logoUrl ? (
                      <img
                        src={site.logoUrl}
                        alt="Logo"
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-300 bg-white"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs">
                        Logo
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => updateSiteField('logoUrl', url))}
                        />
                      </label>
                      <input
                        type="url"
                        value={site.logoUrl || ''}
                        onChange={(e) => updateSiteField('logoUrl', e.target.value)}
                        placeholder="Or paste image URL..."
                        className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                    Theme Color Preset
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => updateSiteField('themeColor', preset.hex)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                          site.themeColor === preset.hex
                            ? 'border-zinc-950 bg-zinc-100 shadow-xs ring-1 ring-zinc-950'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className="truncate text-zinc-950">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    Typography Font Family
                  </label>
                  <select
                    value={site.fontFamily || 'Plus Jakarta Sans'}
                    onChange={(e) =>
                      updateSiteField('fontFamily', e.target.value as any)
                    }
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-950 focus:ring-2 focus:ring-zinc-950"
                  >
                    {FONTS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'slider' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Hero Banner Slides</h4>
                    <p className="text-[11px] text-zinc-500 font-medium">Upload banner photos or paste URLs.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSlide: BannerSlide = {
                        id: `slide-${Date.now()}`,
                        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&auto=format&fit=crop&q=80',
                        title: 'New Season Collection',
                        subtitle: 'Premium handcrafted quality delivered to your doorstep.',
                        ctaText: 'Shop via WhatsApp',
                      };
                      updateSiteField('bannerSlider', [...(site.bannerSlider || []), newSlide]);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slide</span>
                  </button>
                </div>

                {site.bannerSlider?.map((slide, index) => (
                  <div key={slide.id} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-950">
                          {index === 0 ? 'Slide #1 (Main Page Hero Banner)' : `Slide #${index + 1}`}
                        </span>
                        {index === 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-white font-mono text-[9px] font-bold">
                            STARTING BANNER
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = site.bannerSlider?.filter((s) => s.id !== slide.id);
                          updateSiteField('bannerSlider', updated);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Banner Image Preview & Upload Button */}
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-300 bg-zinc-200">
                      <img
                        src={slide.imageUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <label className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-950/80 hover:bg-black text-white text-[10px] font-bold cursor-pointer transition-all shadow-sm">
                        <Upload className="w-3 h-3" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, (url) => {
                              const updated = [...(site.bannerSlider || [])];
                              updated[index].imageUrl = url;
                              updateSiteField('bannerSlider', updated);
                            })
                          }
                        />
                      </label>
                    </div>

                    <input
                      type="url"
                      value={slide.imageUrl}
                      onChange={(e) => {
                        const updated = [...(site.bannerSlider || [])];
                        updated[index].imageUrl = e.target.value;
                        updateSiteField('bannerSlider', updated);
                      }}
                      placeholder="Or paste banner image URL..."
                      className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium"
                    />

                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => {
                        const updated = [...(site.bannerSlider || [])];
                        updated[index].title = e.target.value;
                        updateSiteField('bannerSlider', updated);
                      }}
                      placeholder="Slide Title..."
                      className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                    />

                    <input
                      type="text"
                      value={slide.subtitle}
                      onChange={(e) => {
                        const updated = [...(site.bannerSlider || [])];
                        updated[index].subtitle = e.target.value;
                        updateSiteField('bannerSlider', updated);
                      }}
                      placeholder="Slide Subtitle / Description..."
                      className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700 font-medium"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'type_specific' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Products &amp; Catalog
                </h4>
                <p className="text-xs text-zinc-500 font-medium">
                  Upload images, set prices and names. Live preview reflects edits immediately.
                </p>

                {site.type === 'ecommerce' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">
                        Products ({site.products?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newProd: ProductItem = {
                            id: `prod-${Date.now()}`,
                            name: 'New Product Item',
                            price: '1,999',
                            currency: '₹',
                            description: 'High quality product material with fast express shipping.',
                            imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
                            badge: 'New',
                            inStock: true,
                          };
                          updateSiteField('products', [...(site.products || []), newProd]);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Product</span>
                      </button>
                    </div>

                    {site.products?.map((prod, index) => (
                      <div
                        key={prod.id}
                        className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-950">{prod.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = site.products?.filter((p) => p.id !== prod.id);
                              updateSiteField('products', updated);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Product Image & Upload Button */}
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-16 h-16 rounded-xl object-cover border border-zinc-300 bg-white shrink-0"
                          />
                          <div className="flex-1 space-y-1.5">
                            <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-black text-white text-[10px] font-bold cursor-pointer transition-all">
                              <Upload className="w-3 h-3" />
                              <span>Upload Product Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (url) => {
                                    const updated = [...(site.products || [])];
                                    updated[index].imageUrl = url;
                                    updateSiteField('products', updated);
                                  })
                                }
                              />
                            </label>
                            <input
                              type="url"
                              value={prod.imageUrl}
                              onChange={(e) => {
                                const updated = [...(site.products || [])];
                                updated[index].imageUrl = e.target.value;
                                updateSiteField('products', updated);
                              }}
                              placeholder="Or image URL..."
                              className="w-full px-2 py-1 bg-white border border-zinc-300 rounded text-[11px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={prod.name}
                            onChange={(e) => {
                              const updated = [...(site.products || [])];
                              updated[index].name = e.target.value;
                              updateSiteField('products', updated);
                            }}
                            placeholder="Name..."
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                          />
                          <input
                            type="text"
                            value={prod.price}
                            onChange={(e) => {
                              const updated = [...(site.products || [])];
                              updated[index].price = e.target.value;
                              updateSiteField('products', updated);
                            }}
                            placeholder="Price (e.g. 2,999)..."
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={prod.badge || ''}
                            onChange={(e) => {
                              const updated = [...(site.products || [])];
                              updated[index].badge = e.target.value;
                              updateSiteField('products', updated);
                            }}
                            placeholder="Badge (e.g. Best Seller)..."
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                          />
                          <input
                            type="text"
                            value={prod.description || ''}
                            onChange={(e) => {
                              const updated = [...(site.products || [])];
                              updated[index].description = e.target.value;
                              updateSiteField('products', updated);
                            }}
                            placeholder="Description..."
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {site.type === 'single_product' && site.singleProduct && (
                  <div className="space-y-3">
                    {/* Single Product Photo Upload */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">
                        Product Photo
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <img
                          src={site.singleProduct.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                          alt={site.singleProduct.productName}
                          className="w-16 h-16 rounded-xl object-cover border border-zinc-300 bg-white shrink-0"
                        />
                        <div className="flex-1 space-y-1.5">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Product Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) => {
                                  updateSiteField('singleProduct', {
                                    ...site.singleProduct!,
                                    images: [url, ...(site.singleProduct?.images?.slice(1) || [])],
                                  });
                                })
                              }
                            />
                          </label>
                          <input
                            type="url"
                            value={site.singleProduct.images?.[0] || ''}
                            onChange={(e) => {
                              updateSiteField('singleProduct', {
                                ...site.singleProduct!,
                                images: [e.target.value, ...(site.singleProduct?.images?.slice(1) || [])],
                              });
                            }}
                            placeholder="Or paste image URL..."
                            className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Product Title</label>
                      <input
                        type="text"
                        value={site.singleProduct.productName}
                        onChange={(e) => {
                          updateSiteField('singleProduct', {
                            ...site.singleProduct!,
                            productName: e.target.value,
                          });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-zinc-900 mb-1">Regular Price</label>
                        <input
                          type="text"
                          value={site.singleProduct.regularPrice}
                          onChange={(e) => {
                            updateSiteField('singleProduct', {
                              ...site.singleProduct!,
                              regularPrice: e.target.value,
                            });
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-900 mb-1">Sale Price</label>
                        <input
                          type="text"
                          value={site.singleProduct.salePrice}
                          onChange={(e) => {
                            updateSiteField('singleProduct', {
                              ...site.singleProduct!,
                              salePrice: e.target.value,
                            });
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-emerald-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={site.singleProduct.tagline || ''}
                        onChange={(e) => {
                          updateSiteField('singleProduct', {
                            ...site.singleProduct!,
                            tagline: e.target.value,
                          });
                        }}
                        placeholder="e.g. Immersive Spatial Audio with Active Noise Cancellation"
                        className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={site.singleProduct.description || ''}
                        onChange={(e) => {
                          updateSiteField('singleProduct', {
                            ...site.singleProduct!,
                            description: e.target.value,
                          });
                        }}
                        placeholder="Detailed product specifications and highlights..."
                        className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800"
                      />
                    </div>
                  </div>
                )}

                {site.type === 'portfolio' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Role / Headline Title</label>
                      <input
                        type="text"
                        value={site.portfolioRoleTitle || ''}
                        onChange={(e) => updateSiteField('portfolioRoleTitle', e.target.value)}
                        placeholder="e.g. Senior Creative Director & Product Designer"
                        className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">Profile Avatar Photo</label>
                      <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                        {site.portfolioAvatarUrl ? (
                          <img
                            src={site.portfolioAvatarUrl}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full object-cover border border-zinc-300 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs shrink-0">
                            Avatar
                          </div>
                        )}
                        <div className="flex-1 space-y-1.5">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Avatar</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, (url) => updateSiteField('portfolioAvatarUrl', url))}
                            />
                          </label>
                          <input
                            type="url"
                            value={site.portfolioAvatarUrl || ''}
                            onChange={(e) => updateSiteField('portfolioAvatarUrl', e.target.value)}
                            placeholder="Or image URL..."
                            className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-900 mb-1">About Me Narrative</label>
                      <textarea
                        rows={3}
                        value={site.portfolioAbout || ''}
                        onChange={(e) => updateSiteField('portfolioAbout', e.target.value)}
                        placeholder="Tell visitors about your background, experience, and what you specialize in..."
                        className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800"
                      />
                    </div>

                    {/* Skills */}
                    <div className="space-y-2 pt-2 border-t border-zinc-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Skills &amp; Expertise</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newSkill: PortfolioSkill = {
                              id: `skill-${Date.now()}`,
                              name: 'Brand Strategy',
                              level: 'Expert',
                            };
                            updateSiteField('portfolioSkills', [...(site.portfolioSkills || []), newSkill]);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Skill</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {site.portfolioSkills?.map((skill, index) => (
                          <div key={skill.id} className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => {
                                const updated = [...(site.portfolioSkills || [])];
                                updated[index].name = e.target.value;
                                updateSiteField('portfolioSkills', updated);
                              }}
                              placeholder="Skill name..."
                              className="flex-1 px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-bold text-zinc-900"
                            />
                            <input
                              type="text"
                              value={skill.level || ''}
                              onChange={(e) => {
                                const updated = [...(site.portfolioSkills || [])];
                                updated[index].level = e.target.value;
                                updateSiteField('portfolioSkills', updated);
                              }}
                              placeholder="Level (e.g. Expert)..."
                              className="w-24 px-2 py-1 bg-white border border-zinc-300 rounded text-xs text-zinc-700"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = site.portfolioSkills?.filter((s) => s.id !== skill.id);
                                updateSiteField('portfolioSkills', updated);
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Portfolio Projects */}
                    <div className="space-y-2 pt-2 border-t border-zinc-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">Projects Showcase ({site.portfolioProjects?.length || 0})</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newProj: PortfolioProject = {
                              id: `proj-${Date.now()}`,
                              title: 'Brand Identity Project',
                              description: 'Full identity design, typography guidelines, and packaging collateral.',
                              imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
                              tags: ['Branding', 'Web'],
                            };
                            updateSiteField('portfolioProjects', [...(site.portfolioProjects || []), newProj]);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Project</span>
                        </button>
                      </div>

                      {site.portfolioProjects?.map((proj, index) => (
                        <div key={proj.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-950">{proj.title}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = site.portfolioProjects?.filter((p) => p.id !== proj.id);
                                updateSiteField('portfolioProjects', updated);
                              }}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <img
                              src={proj.imageUrl}
                              alt={proj.title}
                              className="w-14 h-14 rounded-lg object-cover border border-zinc-300 bg-white shrink-0"
                            />
                            <div className="flex-1 space-y-1">
                              <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-black text-white text-[10px] font-bold cursor-pointer transition-all">
                                <Upload className="w-3 h-3" />
                                <span>Upload Project Image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(e, (url) => {
                                      const updated = [...(site.portfolioProjects || [])];
                                      updated[index].imageUrl = url;
                                      updateSiteField('portfolioProjects', updated);
                                    })
                                  }
                                />
                              </label>
                              <input
                                type="url"
                                value={proj.imageUrl}
                                onChange={(e) => {
                                  const updated = [...(site.portfolioProjects || [])];
                                  updated[index].imageUrl = e.target.value;
                                  updateSiteField('portfolioProjects', updated);
                                }}
                                placeholder="Image URL..."
                                className="w-full px-2 py-1 bg-white border border-zinc-300 rounded text-[11px]"
                              />
                            </div>
                          </div>

                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const updated = [...(site.portfolioProjects || [])];
                              updated[index].title = e.target.value;
                              updateSiteField('portfolioProjects', updated);
                            }}
                            placeholder="Project Title..."
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                          />

                          <textarea
                            rows={2}
                            value={proj.description}
                            onChange={(e) => {
                              const updated = [...(site.portfolioProjects || [])];
                              updated[index].description = e.target.value;
                              updateSiteField('portfolioProjects', updated);
                            }}
                            placeholder="Project description..."
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Announcement Bar */}
            {activeTab === 'announcement' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Enable Top Announcement Bar</span>
                    <span className="text-[11px] text-zinc-500 font-medium">Shows a sticky notice banner at the very top of your website.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.announcementEnabled ?? true}
                    onChange={(e) => updateSiteField('announcementEnabled', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Banner Announcement Text</label>
                  <textarea
                    rows={3}
                    value={site.announcementText ?? '⚡ SPECIAL OFFER: FREE EXPRESS SHIPPING ACROSS INDIA • ORDER DIRECTLY VIA WHATSAPP'}
                    onChange={(e) => updateSiteField('announcementText', e.target.value)}
                    placeholder="e.g. ⚡ FREE ALL-INDIA SHIPPING ON ORDERS ABOVE ₹999 • LIMITED PERIOD OFFER"
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-950 focus:ring-2 focus:ring-zinc-950"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Updates live across the top banner in real-time preview.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1.5">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={site.announcementBgColor || '#18181b'}
                        onChange={(e) => updateSiteField('announcementBgColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={site.announcementBgColor || '#18181b'}
                        onChange={(e) => updateSiteField('announcementBgColor', e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1.5">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={site.announcementTextColor || '#ffffff'}
                        onChange={(e) => updateSiteField('announcementTextColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={site.announcementTextColor || '#ffffff'}
                        onChange={(e) => updateSiteField('announcementTextColor', e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs font-mono font-bold text-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Color Presets */}
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5">Quick Color Combinations</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Dark Slate', bg: '#18181b', text: '#ffffff' },
                      { name: 'Emerald', bg: '#059669', text: '#ffffff' },
                      { name: 'Royal Blue', bg: '#2563eb', text: '#ffffff' },
                      { name: 'Crimson', bg: '#dc2626', text: '#ffffff' },
                      { name: 'Violet', bg: '#7c3aed', text: '#ffffff' },
                      { name: 'Gold & Dark', bg: '#fef08a', text: '#18181b' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          updateSiteField('announcementBgColor', preset.bg);
                          updateSiteField('announcementTextColor', preset.text);
                        }}
                        className="p-2 rounded-lg border border-zinc-200 hover:border-zinc-400 text-left transition-all text-xs font-bold flex items-center gap-1.5"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0" style={{ backgroundColor: preset.bg }} />
                        <span className="truncate text-zinc-800">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Trust Badges */}
            {activeTab === 'trust_badges' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Enable Trust Badges Bar</span>
                    <span className="text-[11px] text-zinc-500 font-medium">Build instant buyer confidence with guarantee icons and perks.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.trustBadgesEnabled ?? true}
                    onChange={(e) => updateSiteField('trustBadgesEnabled', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">
                    Trust Badges ({site.trustBadges?.length ?? 4})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = site.trustBadges || [
                        { id: 'b1', icon: 'truck', title: 'Free Express Shipping', subtitle: 'On all orders across India' },
                        { id: 'b2', icon: 'shield', title: '100% Genuine Quality', subtitle: 'Handcrafted verified materials' },
                        { id: 'b3', icon: 'refresh', title: 'Easy Returns & Exchange', subtitle: '7-day hassle-free process' },
                        { id: 'b4', icon: 'clock', title: '24/7 WhatsApp Support', subtitle: 'Instant answers & direct order tracking' },
                      ];
                      const newBadge: TrustBadgeItem = {
                        id: `badge-${Date.now()}`,
                        icon: 'star',
                        title: 'Premium Quality',
                        subtitle: 'Certified and guaranteed',
                      };
                      updateSiteField('trustBadges', [...current, newBadge]);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Badge</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(site.trustBadges || [
                    { id: 'b1', icon: 'truck', title: 'Free Express Shipping', subtitle: 'On all orders across India' },
                    { id: 'b2', icon: 'shield', title: '100% Genuine Quality', subtitle: 'Handcrafted verified materials' },
                    { id: 'b3', icon: 'refresh', title: 'Easy Returns & Exchange', subtitle: '7-day hassle-free process' },
                    { id: 'b4', icon: 'clock', title: '24/7 WhatsApp Support', subtitle: 'Instant answers & direct order tracking' },
                  ]).map((badge, index) => (
                    <div key={badge.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-950">Badge #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = site.trustBadges || [
                              { id: 'b1', icon: 'truck', title: 'Free Express Shipping', subtitle: 'On all orders across India' },
                              { id: 'b2', icon: 'shield', title: '100% Genuine Quality', subtitle: 'Handcrafted verified materials' },
                              { id: 'b3', icon: 'refresh', title: 'Easy Returns & Exchange', subtitle: '7-day hassle-free process' },
                              { id: 'b4', icon: 'clock', title: '24/7 WhatsApp Support', subtitle: 'Instant answers & direct order tracking' },
                            ];
                            const updated = list.filter((b) => b.id !== badge.id);
                            updateSiteField('trustBadges', updated);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Icon</label>
                          <select
                            value={badge.icon}
                            onChange={(e) => {
                              const list = [...(site.trustBadges || [
                                { id: 'b1', icon: 'truck', title: 'Free Express Shipping', subtitle: 'On all orders across India' },
                                { id: 'b2', icon: 'shield', title: '100% Genuine Quality', subtitle: 'Handcrafted verified materials' },
                                { id: 'b3', icon: 'refresh', title: 'Easy Returns & Exchange', subtitle: '7-day hassle-free process' },
                                { id: 'b4', icon: 'clock', title: '24/7 WhatsApp Support', subtitle: 'Instant answers & direct order tracking' },
                              ])];
                              list[index].icon = e.target.value as any;
                              updateSiteField('trustBadges', list);
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-900"
                          >
                            <option value="truck">🚚 Shipping (Truck)</option>
                            <option value="shield">🛡️ Verified (Shield)</option>
                            <option value="refresh">🔄 Returns (Exchange)</option>
                            <option value="clock">⏱️ Support (Clock)</option>
                            <option value="star">⭐ Star Rating</option>
                            <option value="heart">❤️ Craftsmanship</option>
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Badge Title</label>
                          <input
                            type="text"
                            value={badge.title}
                            onChange={(e) => {
                              const list = [...(site.trustBadges || [
                                { id: 'b1', icon: 'truck', title: 'Free Express Shipping', subtitle: 'On all orders across India' },
                                { id: 'b2', icon: 'shield', title: '100% Genuine Quality', subtitle: 'Handcrafted verified materials' },
                                { id: 'b3', icon: 'refresh', title: 'Easy Returns & Exchange', subtitle: '7-day hassle-free process' },
                                { id: 'b4', icon: 'clock', title: '24/7 WhatsApp Support', subtitle: 'Instant answers & direct order tracking' },
                              ])];
                              list[index].title = e.target.value;
                              updateSiteField('trustBadges', list);
                            }}
                            placeholder="e.g. Free Express Shipping"
                            className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Subtitle / Description</label>
                        <input
                          type="text"
                          value={badge.subtitle}
                          onChange={(e) => {
                            const list = [...(site.trustBadges || [
                              { id: 'b1', icon: 'truck', title: 'Free Express Shipping', subtitle: 'On all orders across India' },
                              { id: 'b2', icon: 'shield', title: '100% Genuine Quality', subtitle: 'Handcrafted verified materials' },
                              { id: 'b3', icon: 'refresh', title: 'Easy Returns & Exchange', subtitle: '7-day hassle-free process' },
                              { id: 'b4', icon: 'clock', title: '24/7 WhatsApp Support', subtitle: 'Instant answers & direct order tracking' },
                            ])];
                            list[index].subtitle = e.target.value;
                            updateSiteField('trustBadges', list);
                          }}
                          placeholder="e.g. On all orders across India"
                          className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Reviews & Testimonials */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Enable Customer Reviews Section</span>
                    <span className="text-[11px] text-zinc-500 font-medium">Show verified testimonials, star ratings, and buyer comments.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.reviewsEnabled ?? true}
                    onChange={(e) => updateSiteField('reviewsEnabled', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1">Section Heading Title</label>
                    <input
                      type="text"
                      value={site.reviewsTitle ?? 'Loved by Over 10,000+ Happy Customers'}
                      onChange={(e) => updateSiteField('reviewsTitle', e.target.value)}
                      placeholder="e.g. Loved by Over 10,000+ Happy Customers"
                      className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1">Section Subtitle</label>
                    <input
                      type="text"
                      value={site.reviewsSubtitle ?? 'Real authentic feedback and verified WhatsApp reviews.'}
                      onChange={(e) => updateSiteField('reviewsSubtitle', e.target.value)}
                      placeholder="e.g. Real authentic feedback and verified WhatsApp reviews."
                      className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                  <span className="text-xs font-bold text-zinc-900">
                    Customer Reviews List ({site.reviews?.length ?? 3})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = site.reviews || [
                        { id: 'r1', reviewerName: 'Priya Sharma', rating: 5, comment: 'Exceptional craftsmanship! The product exceeded my expectations and delivery was fast. Placing order on WhatsApp was super smooth.', location: 'Mumbai, MH', verifiedBuyer: true },
                        { id: 'r2', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Outstanding quality and very responsive customer support on WhatsApp. Will definitely recommend to friends and family!', location: 'Bengaluru, KA', verifiedBuyer: true },
                        { id: 'r3', reviewerName: 'Aanya Patel', rating: 5, comment: 'Exactly as described in the pictures. The attention to detail and packaging was premium. 10/10 experience!', location: 'Ahmedabad, GJ', verifiedBuyer: true },
                      ];
                      const newRev: ReviewItem = {
                        id: `rev-${Date.now()}`,
                        reviewerName: 'Happy Customer',
                        rating: 5,
                        comment: 'Amazing experience! Loved the fast communication on WhatsApp.',
                        location: 'New Delhi, DL',
                        verifiedBuyer: true,
                      };
                      updateSiteField('reviews', [...current, newRev]);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Review</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(site.reviews || [
                    { id: 'r1', reviewerName: 'Priya Sharma', rating: 5, comment: 'Exceptional craftsmanship! The product exceeded my expectations and delivery was fast. Placing order on WhatsApp was super smooth.', location: 'Mumbai, MH', verifiedBuyer: true },
                    { id: 'r2', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Outstanding quality and very responsive customer support on WhatsApp. Will definitely recommend to friends and family!', location: 'Bengaluru, KA', verifiedBuyer: true },
                    { id: 'r3', reviewerName: 'Aanya Patel', rating: 5, comment: 'Exactly as described in the pictures. The attention to detail and packaging was premium. 10/10 experience!', location: 'Ahmedabad, GJ', verifiedBuyer: true },
                  ]).map((rev, index) => (
                    <div key={rev.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-950">{rev.reviewerName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = site.reviews || [
                              { id: 'r1', reviewerName: 'Priya Sharma', rating: 5, comment: 'Exceptional craftsmanship! The product exceeded my expectations and delivery was fast. Placing order on WhatsApp was super smooth.', location: 'Mumbai, MH', verifiedBuyer: true },
                              { id: 'r2', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Outstanding quality and very responsive customer support on WhatsApp. Will definitely recommend to friends and family!', location: 'Bengaluru, KA', verifiedBuyer: true },
                              { id: 'r3', reviewerName: 'Aanya Patel', rating: 5, comment: 'Exactly as described in the pictures. The attention to detail and packaging was premium. 10/10 experience!', location: 'Ahmedabad, GJ', verifiedBuyer: true },
                            ];
                            const updated = list.filter((r) => r.id !== rev.id);
                            updateSiteField('reviews', updated);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Reviewer Name</label>
                          <input
                            type="text"
                            value={rev.reviewerName}
                            onChange={(e) => {
                              const list = [...(site.reviews || [
                                { id: 'r1', reviewerName: 'Priya Sharma', rating: 5, comment: 'Exceptional craftsmanship! The product exceeded my expectations and delivery was fast. Placing order on WhatsApp was super smooth.', location: 'Mumbai, MH', verifiedBuyer: true },
                                { id: 'r2', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Outstanding quality and very responsive customer support on WhatsApp. Will definitely recommend to friends and family!', location: 'Bengaluru, KA', verifiedBuyer: true },
                                { id: 'r3', reviewerName: 'Aanya Patel', rating: 5, comment: 'Exactly as described in the pictures. The attention to detail and packaging was premium. 10/10 experience!', location: 'Ahmedabad, GJ', verifiedBuyer: true },
                              ])];
                              list[index].reviewerName = e.target.value;
                              updateSiteField('reviews', list);
                            }}
                            placeholder="Name..."
                            className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded text-xs font-bold text-zinc-950"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Rating (Stars)</label>
                          <select
                            value={rev.rating}
                            onChange={(e) => {
                              const list = [...(site.reviews || [
                                { id: 'r1', reviewerName: 'Priya Sharma', rating: 5, comment: 'Exceptional craftsmanship! The product exceeded my expectations and delivery was fast. Placing order on WhatsApp was super smooth.', location: 'Mumbai, MH', verifiedBuyer: true },
                                { id: 'r2', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Outstanding quality and very responsive customer support on WhatsApp. Will definitely recommend to friends and family!', location: 'Bengaluru, KA', verifiedBuyer: true },
                                { id: 'r3', reviewerName: 'Aanya Patel', rating: 5, comment: 'Exactly as described in the pictures. The attention to detail and packaging was premium. 10/10 experience!', location: 'Ahmedabad, GJ', verifiedBuyer: true },
                              ])];
                              list[index].rating = Number(e.target.value);
                              updateSiteField('reviews', list);
                            }}
                            className="w-full px-2 py-1 bg-white border border-zinc-300 rounded text-xs font-bold text-amber-600"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                            <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                            <option value={3}>⭐⭐⭐ 3 Stars</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Location / City</label>
                          <input
                            type="text"
                            value={rev.location || ''}
                            onChange={(e) => {
                              const list = [...(site.reviews || [
                                { id: 'r1', reviewerName: 'Priya Sharma', rating: 5, comment: 'Exceptional craftsmanship! The product exceeded my expectations and delivery was fast. Placing order on WhatsApp was super smooth.', location: 'Mumbai, MH', verifiedBuyer: true },
                                { id: 'r2', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Outstanding quality and very responsive customer support on WhatsApp. Will definitely recommend to friends and family!', location: 'Bengaluru, KA', verifiedBuyer: true },
                                { id: 'r3', reviewerName: 'Aanya Patel', rating: 5, comment: 'Exactly as described in the pictures. The attention to detail and packaging was premium. 10/10 experience!', location: 'Ahmedabad, GJ', verifiedBuyer: true },
                              ])];
                              list[index].location = e.target.value;
                              updateSiteField('reviews', list);
                            }}
                            placeholder="e.g. Mumbai, MH"
                            className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded text-xs text-zinc-700"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-3">
                          <input
                            type="checkbox"
                            checked={rev.verifiedBuyer ?? true}
                            onChange={(e) => {
                              const list = [...(site.reviews || [
                                { id: 'r1', reviewerName: 'Priya Sharma', rating: 5, comment: 'Exceptional craftsmanship! The product exceeded my expectations and delivery was fast. Placing order on WhatsApp was super smooth.', location: 'Mumbai, MH', verifiedBuyer: true },
                                { id: 'r2', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Outstanding quality and very responsive customer support on WhatsApp. Will definitely recommend to friends and family!', location: 'Bengaluru, KA', verifiedBuyer: true },
                                { id: 'r3', reviewerName: 'Aanya Patel', rating: 5, comment: 'Exactly as described in the pictures. The attention to detail and packaging was premium. 10/10 experience!', location: 'Ahmedabad, GJ', verifiedBuyer: true },
                              ])];
                              list[index].verifiedBuyer = e.target.checked;
                              updateSiteField('reviews', list);
                            }}
                            className="w-3.5 h-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
                          />
                          <span className="text-[11px] font-bold text-emerald-800">Verified Buyer Badge</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Review Comment</label>
                        <textarea
                          rows={2}
                          value={rev.comment}
                          onChange={(e) => {
                            const list = [...(site.reviews || [
                              { id: 'r1', reviewerName: 'Priya Sharma', rating: 5, comment: 'Exceptional craftsmanship! The product exceeded my expectations and delivery was fast. Placing order on WhatsApp was super smooth.', location: 'Mumbai, MH', verifiedBuyer: true },
                              { id: 'r2', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Outstanding quality and very responsive customer support on WhatsApp. Will definitely recommend to friends and family!', location: 'Bengaluru, KA', verifiedBuyer: true },
                              { id: 'r3', reviewerName: 'Aanya Patel', rating: 5, comment: 'Exactly as described in the pictures. The attention to detail and packaging was premium. 10/10 experience!', location: 'Ahmedabad, GJ', verifiedBuyer: true },
                            ])];
                            list[index].comment = e.target.value;
                            updateSiteField('reviews', list);
                          }}
                          placeholder="Customer review comment..."
                          className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: FAQ Accordion */}
            {activeTab === 'faq' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Enable FAQ Accordion Section</span>
                    <span className="text-[11px] text-zinc-500 font-medium">Interactive questions &amp; answers with smooth accordion toggles.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.faqEnabled ?? true}
                    onChange={(e) => updateSiteField('faqEnabled', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={site.faqTitle ?? 'Frequently Asked Questions'}
                    onChange={(e) => updateSiteField('faqTitle', e.target.value)}
                    placeholder="Frequently Asked Questions"
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                  <span className="text-xs font-bold text-zinc-900">
                    Questions List ({site.faqs?.length ?? 4})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = site.faqs || [
                        { id: 'f1', question: 'How do I place an order?', answer: 'Simply click "Order on WhatsApp" on any product. It opens WhatsApp with item details ready.' },
                        { id: 'f2', question: 'What payment methods do you accept?', answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), Net Banking, and COD.' },
                        { id: 'f3', question: 'How long does delivery take?', answer: 'Standard delivery takes 3-5 business days across India.' },
                        { id: 'f4', question: 'What is your return policy?', answer: 'We offer a 7-day hassle-free return or exchange for damaged or wrong products.' },
                      ];
                      const newFaq: FaqItem = {
                        id: `faq-${Date.now()}`,
                        question: 'Do you offer customization?',
                        answer: 'Yes! Send us your requirements directly on WhatsApp and we will make it happen.',
                      };
                      updateSiteField('faqs', [...current, newFaq]);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(site.faqs || [
                    { id: 'f1', question: 'How do I place an order?', answer: 'Simply click "Order on WhatsApp" on any product. It opens WhatsApp with item details ready.' },
                    { id: 'f2', question: 'What payment methods do you accept?', answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), Net Banking, and COD.' },
                    { id: 'f3', question: 'How long does delivery take?', answer: 'Standard delivery takes 3-5 business days across India.' },
                    { id: 'f4', question: 'What is your return policy?', answer: 'We offer a 7-day hassle-free return or exchange for damaged or wrong products.' },
                  ]).map((faq, index) => (
                    <div key={faq.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-950">Q#{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = site.faqs || [
                              { id: 'f1', question: 'How do I place an order?', answer: 'Simply click "Order on WhatsApp" on any product. It opens WhatsApp with item details ready.' },
                              { id: 'f2', question: 'What payment methods do you accept?', answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), Net Banking, and COD.' },
                              { id: 'f3', question: 'How long does delivery take?', answer: 'Standard delivery takes 3-5 business days across India.' },
                              { id: 'f4', question: 'What is your return policy?', answer: 'We offer a 7-day hassle-free return or exchange for damaged or wrong products.' },
                            ];
                            const updated = list.filter((f) => f.id !== faq.id);
                            updateSiteField('faqs', updated);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Question</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const list = [...(site.faqs || [
                              { id: 'f1', question: 'How do I place an order?', answer: 'Simply click "Order on WhatsApp" on any product. It opens WhatsApp with item details ready.' },
                              { id: 'f2', question: 'What payment methods do you accept?', answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), Net Banking, and COD.' },
                              { id: 'f3', question: 'How long does delivery take?', answer: 'Standard delivery takes 3-5 business days across India.' },
                              { id: 'f4', question: 'What is your return policy?', answer: 'We offer a 7-day hassle-free return or exchange for damaged or wrong products.' },
                            ])];
                            list[index].question = e.target.value;
                            updateSiteField('faqs', list);
                          }}
                          placeholder="Question..."
                          className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">Answer</label>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const list = [...(site.faqs || [
                              { id: 'f1', question: 'How do I place an order?', answer: 'Simply click "Order on WhatsApp" on any product. It opens WhatsApp with item details ready.' },
                              { id: 'f2', question: 'What payment methods do you accept?', answer: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), Net Banking, and COD.' },
                              { id: 'f3', question: 'How long does delivery take?', answer: 'Standard delivery takes 3-5 business days across India.' },
                              { id: 'f4', question: 'What is your return policy?', answer: 'We offer a 7-day hassle-free return or exchange for damaged or wrong products.' },
                            ])];
                            list[index].answer = e.target.value;
                            updateSiteField('faqs', list);
                          }}
                          placeholder="Detailed answer..."
                          className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: About Story */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Enable Brand Story Section</span>
                    <span className="text-[11px] text-zinc-500 font-medium">A dedicated story section highlighting your craft, history, and values.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={site.aboutEnabled ?? true}
                    onChange={(e) => updateSiteField('aboutEnabled', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Story Heading Title</label>
                  <input
                    type="text"
                    value={site.aboutTitle ?? 'Our Craftsmanship & Heritage'}
                    onChange={(e) => updateSiteField('aboutTitle', e.target.value)}
                    placeholder="e.g. Our Craftsmanship & Heritage"
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Story Photo</label>
                  <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <img
                      src={site.aboutImageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80'}
                      alt="About Story"
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-300 bg-white shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-white text-xs font-bold cursor-pointer transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Story Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => updateSiteField('aboutImageUrl', url))}
                        />
                      </label>
                      <input
                        type="url"
                        value={site.aboutImageUrl || ''}
                        onChange={(e) => updateSiteField('aboutImageUrl', e.target.value)}
                        placeholder="Or paste image URL..."
                        className="w-full px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">About Narrative Text</label>
                  <textarea
                    rows={4}
                    value={site.aboutText ?? 'Founded with an unwavering dedication to exceptional quality, we blend traditional craftsmanship with contemporary design. Every piece in our collection is meticulously crafted with the finest materials to ensure lasting beauty and performance.'}
                    onChange={(e) => updateSiteField('aboutText', e.target.value)}
                    placeholder="Tell your brand's story..."
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-800 focus:ring-2 focus:ring-zinc-950"
                  />
                </div>
              </div>
            )}

            {/* TAB: Footer & Social */}
            {activeTab === 'footer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Brand Bio / Short Blurb</label>
                  <textarea
                    rows={2}
                    value={site.footerBlurb ?? 'Handcrafted premium goods made with devotion. Contact us anytime directly on WhatsApp for custom orders.'}
                    onChange={(e) => updateSiteField('footerBlurb', e.target.value)}
                    placeholder="Short description displayed in the footer..."
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Instagram Profile URL</label>
                  <input
                    type="url"
                    value={site.footerInstagramUrl || ''}
                    onChange={(e) => updateSiteField('footerInstagramUrl', e.target.value)}
                    placeholder="https://instagram.com/yourbrand"
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1">Store / Studio Location</label>
                    <input
                      type="text"
                      value={site.footerAddress || ''}
                      onChange={(e) => updateSiteField('footerAddress', e.target.value)}
                      placeholder="e.g. Bandra West, Mumbai, MH"
                      className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={site.footerEmail || ''}
                      onChange={(e) => updateSiteField('footerEmail', e.target.value)}
                      placeholder="hello@yourbrand.in"
                      className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">Copyright Notice</label>
                  <input
                    type="text"
                    value={site.footerCopyright ?? `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`}
                    onChange={(e) => updateSiteField('footerCopyright', e.target.value)}
                    placeholder={`© ${new Date().getFullYear()} ${site.name}. All rights reserved.`}
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-800"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sandbox Live Iframe Preview (Renders Instant Realtime srcDoc) */}
        <div
          className={`flex-1 bg-zinc-200 p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden ${
            mobileViewMode === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="w-full max-w-6xl h-full flex flex-col items-center justify-center">
            <iframe
              ref={iframeRef}
              srcDoc={previewHtml}
              className={`transition-all duration-300 bg-white ${getDeviceClass()}`}
              title="Live Website Sandbox Preview"
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Taskbar for Switching Editor/Preview */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-4 py-2 shadow-lg">
        <div className="grid grid-cols-3 gap-2 text-center">
          <button
            onClick={() => setMobileViewMode('editor')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors ${
              mobileViewMode === 'editor'
                ? 'bg-zinc-950 text-white font-bold'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Edit3 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Edit Form</span>
          </button>

          <button
            onClick={() => setMobileViewMode('preview')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors ${
              mobileViewMode === 'preview'
                ? 'bg-zinc-950 text-white font-bold'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Eye className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Live Preview</span>
          </button>

          <button
            onClick={handlePublish}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl bg-emerald-600 text-white font-bold shadow-xs active:scale-95"
          >
            <Rocket className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Publish</span>
          </button>
        </div>
      </nav>

      {/* QR Code Modal */}
      {showQrModal && site && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 drawer-backdrop"
            onClick={() => setShowQrModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                  <QrIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">
                    Storefront QR Code
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    https://{site.slug}.dominal.in
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <div
                className="p-3 bg-white rounded-xl shadow-xs border border-zinc-200"
                dangerouslySetInnerHTML={{
                  __html: generateQrSvg(
                    site.liveUrl || `https://${site.slug}.dominal.in`,
                    220
                  ),
                }}
              />
              <div className="text-center">
                <span className="text-xs font-mono font-bold text-zinc-900 block">
                  https://{site.slug}.dominal.in
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">
                  Scan to instantly open on any smartphone camera
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadQrPng(
                      site.liveUrl || `https://${site.slug}.dominal.in`,
                      `${site.slug}-qr.png`,
                      800
                    )
                  }
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG (HD)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadQrSvg(
                      site.liveUrl || `https://${site.slug}.dominal.in`,
                      `${site.slug}-qr.svg`
                    )
                  }
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Download SVG</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    site.liveUrl || `https://${site.slug}.dominal.in`
                  );
                  alert('Live link copied to clipboard!');
                }}
                className="w-full py-2 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all"
              >
                Copy Direct Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 drawer-backdrop"
            onClick={() => !deploying && setShowPublishModal(false)}
          />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-950">
                    {deploying
                      ? 'Publishing Storefront'
                      : site.status === 'live'
                      ? 'Storefront is Live & Published!'
                      : 'Publishing Complete'}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    https://{site.slug}.dominal.in
                  </p>
                </div>
              </div>
              {!deploying && (
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 30-Second Propagation Progress Timer */}
            {deploying && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        Publishing &amp; Configuring SSL (~{propagationSeconds}s remaining)
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium">
                        Cloud DNS routing &amp; automated zero-config certificate issuance
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg shrink-0">
                    {Math.min(30, 30 - propagationSeconds + 1)}s / 30s
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-amber-200/70 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((30 - propagationSeconds) / 30) * 100)
                      )}%`,
                    }}
                  />
                </div>

                {/* Milestone Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold">
                  <div
                    className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                      propagationSeconds <= 28
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : 'bg-white border-amber-200 text-zinc-500'
                    }`}
                  >
                    <span>{propagationSeconds <= 28 ? '✓' : '1.'} HTML Bundle</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                      propagationSeconds <= 20
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : 'bg-white border-amber-200 text-zinc-500'
                    }`}
                  >
                    <span>{propagationSeconds <= 20 ? '✓' : '2.'} Cloud Push</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                      propagationSeconds <= 10
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : 'bg-white border-amber-200 text-zinc-500'
                    }`}
                  >
                    <span>{propagationSeconds <= 10 ? '✓' : '3.'} DNS Routing</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                      propagationSeconds <= 2
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : 'bg-white border-amber-200 text-zinc-500'
                    }`}
                  >
                    <span>{propagationSeconds <= 2 ? '✓' : '4.'} SSL Verified</span>
                  </div>
                </div>

                <p className="text-[11px] text-amber-800 font-medium">
                  💡 DNS propagation across global edge nodes takes approximately 30 seconds. Your storefront will be live automatically.
                </p>
              </div>
            )}

            {/* When live: Celebratory Live Domain Link & Preview & QR Code */}
            {!deploying && site.status === 'live' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Storefront Published Successfully!</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold self-start sm:self-auto">
                    ✓ Saved to My Websites &amp; History
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Live Domain Link:</span>
                    <span className="text-emerald-700 font-mono font-bold">
                      https://{site.slug}.dominal.in
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={site.liveUrl || `https://${site.slug}.dominal.in`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Open Live Website</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          site.liveUrl || `https://${site.slug}.dominal.in`
                        );
                        alert('Live link copied to clipboard!');
                      }}
                      className="px-3 py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-950 text-xs font-bold transition-all"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                {/* Inline QR Code Export Box */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200">
                  <div
                    className="p-1.5 bg-white rounded-lg border border-zinc-200 shrink-0"
                    dangerouslySetInnerHTML={{
                      __html: generateQrSvg(site.liveUrl || `https://${site.slug}.dominal.in`, 76),
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                      <QrIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Website QR Code Ready</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                      Use for packaging, business cards, stickers, or store flyers.
                    </p>
                    <div className="flex items-center gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          downloadQrPng(
                            site.liveUrl || `https://${site.slug}.dominal.in`,
                            `${site.slug}-qr.png`,
                            800
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-black text-white text-[10px] font-bold inline-flex items-center gap-1 transition-all shadow-xs"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download PNG</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          downloadQrSvg(
                            site.liveUrl || `https://${site.slug}.dominal.in`,
                            `${site.slug}-qr.svg`
                          )
                        }
                        className="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                      >
                        <Download className="w-3 h-3 text-zinc-600" />
                        <span>Download SVG</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Embedded Live Preview in Modal */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-zinc-600 font-medium">
                    <span>Live Preview:</span>
                    <span className="text-[10px] text-zinc-400">Interactive</span>
                  </div>
                  <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-zinc-300 bg-white shadow-inner">
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-full border-0"
                      title="Published Preview"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Deployment Logs Box */}
            <div className="bg-zinc-950 rounded-xl p-3.5 font-mono text-xs text-zinc-300 max-h-36 overflow-y-auto space-y-1.5 border border-zinc-800">
              {deploymentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-zinc-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="font-bold uppercase text-[10px] text-emerald-400">
                    [{log.step}]
                  </span>
                  <span className="text-zinc-200">{log.message}</span>
                </div>
              ))}

              {deploying && (
                <div className="flex items-center gap-2 text-amber-400 pt-1 border-t border-zinc-800">
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Publishing to Linkal servers...</span>
                </div>
              )}
            </div>

            {/* Modal Actions: stays open until user clicks */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <button
                onClick={() => setShowPublishModal(false)}
                disabled={deploying}
                className="px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-all disabled:opacity-50"
              >
                Keep Editing
              </button>

              <button
                onClick={() => router.push(`/dashboard?published=${site.id}`)}
                disabled={deploying}
                className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
              >
                Close &amp; Go to My Sites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
