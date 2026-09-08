'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { SiteData, BannerSlide, ProductItem, PortfolioProject, PortfolioSkill } from '@/types/site';

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

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'slider' | 'type_specific'>('general');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mobileViewMode, setMobileViewMode] = useState<'editor' | 'preview'>('editor');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<any[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load site data
  useEffect(() => {
    async function loadSite() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sites/${siteId}`);
        if (!res.ok) throw new Error('Site not found');
        const data = await res.json();
        setSite(data.site);
      } catch (err) {
        console.error('Failed to load site:', err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    if (siteId) loadSite();
  }, [siteId, router]);

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

      const res = await fetch(`/api/sites/${site.id}/publish`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Deployment failed');
      }

      setSite(data.site);
      setDeploymentLogs(data.site.deploymentLogs || []);

      // Auto-redirect to My Sites on dashboard after publishing
      setTimeout(() => {
        router.push(`/dashboard?published=${site.id}`);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Publishing failed');
    } finally {
      setDeploying(false);
    }
  };

  // Update site helper
  const updateSiteField = <K extends keyof SiteData>(field: K, value: SiteData[K]) => {
    if (!site) return;
    setSite({ ...site, [field]: value });
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
            <span>Dashboard</span>
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
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
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
                    <h3 className="font-extrabold text-sm text-zinc-950">Builder Navigation</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Linkal Studio</p>
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
                  <span>Dashboard Overview</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('general');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'branding'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>Theme &amp; Typography</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('slider');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'slider'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Banner Slider Manager</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('type_specific');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    activeTab === 'type_specific'
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Content &amp; Products</span>
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
          className={`w-full md:w-[460px] lg:w-[500px] bg-white border-r border-zinc-200 flex flex-col h-full overflow-y-auto ${
            mobileViewMode === 'preview' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Editor Sub-Tabs */}
          <div className="p-3 border-b border-zinc-200 bg-zinc-50 flex items-center gap-1 overflow-x-auto">
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
              Branding
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'slider'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Banner Slider
            </button>
            <button
              onClick={() => setActiveTab('type_specific')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'type_specific'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Catalog / Content
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    Subdomain Slug (*.dominal.in)
                  </label>
                  <div className="flex items-center">
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
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    WhatsApp Number (with Country Code)
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
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1">
                    Brand Logo URL
                  </label>
                  <input
                    type="url"
                    value={site.logoUrl || ''}
                    onChange={(e) => updateSiteField('logoUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium text-zinc-950 focus:ring-2 focus:ring-zinc-950"
                  />
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
                  <h4 className="text-xs font-bold text-zinc-900">Hero Banner Slides</h4>
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
                  <div key={slide.id} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Slide #{index + 1}</span>
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

                    <input
                      type="url"
                      value={slide.imageUrl}
                      onChange={(e) => {
                        const updated = [...(site.bannerSlider || [])];
                        updated[index].imageUrl = e.target.value;
                        updateSiteField('bannerSlider', updated);
                      }}
                      placeholder="Image URL..."
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
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'type_specific' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Product / Catalog Manager
                </h4>
                <p className="text-xs text-zinc-500 font-medium">
                  Manage products, prices and badges. Changes update in the live preview instantaneously.
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
                            description: 'High quality product material with fast shipping.',
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
                        className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2"
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sandbox Live Iframe Preview */}
        <div
          className={`flex-1 bg-zinc-200 p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden ${
            mobileViewMode === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="w-full max-w-6xl h-full flex flex-col items-center justify-center">
            <iframe
              ref={iframeRef}
              src={`/api/sites/${site.id}/preview`}
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

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 drawer-backdrop" onClick={() => !deploying && setShowPublishModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-zinc-950">Publishing Website</h3>
              </div>
              {!deploying && (
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-950"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="bg-zinc-950 rounded-xl p-4 font-mono text-xs text-zinc-300 max-h-60 overflow-y-auto space-y-2">
              {deploymentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-zinc-500 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="font-bold uppercase text-[10px] text-emerald-400">
                    [{log.step}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}

              {deploying && (
                <div className="flex items-center gap-2 text-amber-400 pt-2 border-t border-zinc-800">
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Publishing to Linkal servers...</span>
                </div>
              )}

              {!deploying && deploymentLogs.length > 0 && (
                <div className="flex items-center gap-2 text-emerald-400 pt-2 border-t border-zinc-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Website published! Opening My Sites...</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => router.push(`/dashboard?published=${site.id}`)}
                disabled={deploying}
                className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {deploying ? 'Publishing...' : 'Go to My Sites'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
