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
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'slider' | 'content'>('general');

  // Deployment modal state
  const [deploying, setDeploying] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Preview iframe key to force reload
  const [previewKey, setPreviewKey] = useState(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function loadSite() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sites/${siteId}`);
        if (!res.ok) throw new Error('Site not found');
        const data = await res.json();
        setSite(data.site);
      } catch (err: any) {
        alert(err.message);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadSite();
  }, [siteId, router]);

  const handleSave = async () => {
    if (!site) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSite(data.site);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      setPreviewKey(Date.now());
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!site) return;
    setDeployModalOpen(true);
    setDeploying(true);
    setDeployError(null);

    try {
      // Save changes first
      await fetch(`/api/sites/${site.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
      });

      // Trigger pipeline
      const res = await fetch(`/api/sites/${site.id}/publish`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Pipeline execution failed');
      }

      setSite(data.site);
    } catch (err: any) {
      setDeployError(err.message || 'Deployment error');
    } finally {
      setDeploying(false);
    }
  };

  // State update helpers
  const updateField = (field: keyof SiteData, value: any) => {
    if (!site) return;
    setSite({ ...site, [field]: value });
  };

  // Slider handlers
  const addSlide = () => {
    if (!site) return;
    const newSlide: BannerSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&auto=format&fit=crop&q=80',
      title: 'Exciting Special Offer',
      subtitle: 'Order directly with personal WhatsApp assistance and fast delivery.',
      ctaText: 'Chat on WhatsApp',
    };
    updateField('bannerSlider', [...(site.bannerSlider || []), newSlide]);
  };

  const removeSlide = (index: number) => {
    if (!site || !site.bannerSlider) return;
    const updated = [...site.bannerSlider];
    updated.splice(index, 1);
    updateField('bannerSlider', updated);
  };

  const updateSlide = (index: number, field: keyof BannerSlide, value: string) => {
    if (!site || !site.bannerSlider) return;
    const updated = [...site.bannerSlider];
    updated[index] = { ...updated[index], [field]: value };
    updateField('bannerSlider', updated);
  };

  // Product handlers (E-commerce)
  const addProduct = () => {
    if (!site) return;
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      name: 'New Product Item',
      price: '999',
      currency: '₹',
      description: 'Handcrafted luxury quality with guaranteed satisfaction.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      badge: 'New',
      inStock: true,
    };
    updateField('products', [...(site.products || []), newProd]);
  };

  const removeProduct = (index: number) => {
    if (!site || !site.products) return;
    const updated = [...site.products];
    updated.splice(index, 1);
    updateField('products', updated);
  };

  const updateProduct = (index: number, field: keyof ProductItem, value: any) => {
    if (!site || !site.products) return;
    const updated = [...site.products];
    updated[index] = { ...updated[index], [field]: value };
    updateField('products', updated);
  };

  if (loading || !site) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading website builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Top Builder Toolbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white line-clamp-1">{site.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {site.slug}.dominal.in
              </span>
            </div>
          </div>
        </div>

        {/* Viewport device switcher */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewport === 'desktop' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewport === 'tablet' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet view (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              viewport === 'mobile' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile view (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/sites/${site.id}/export`}
            download
            className="px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white bg-slate-900 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Export standalone index.html"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export HTML</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-300" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </>
            )}
          </button>

          <button
            onClick={handlePublish}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Main Builder Canvas: Left Sidebar + Right Live Iframe */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-full md:w-[420px] lg:w-[460px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800/80 bg-slate-950/60 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'general' ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              General
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'theme' ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Theme
            </button>
            <button
              onClick={() => setActiveTab('slider')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'slider' ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Slider
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'content' ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {site.type === 'ecommerce' && <ShoppingBag className="w-3.5 h-3.5" />}
              {site.type === 'portfolio' && <User className="w-3.5 h-3.5" />}
              {site.type === 'single_product' && <Zap className="w-3.5 h-3.5" />}
              {site.type === 'ecommerce' ? 'Products' : site.type === 'portfolio' ? 'Portfolio' : 'Product'}
            </button>
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Site / Company Name
                  </label>
                  <input
                    type="text"
                    value={site.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Becomes page &lt;title&gt; and primary branding heading.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Subdomain Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={site.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                    &rarr; https://{site.slug}.dominal.in
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>WhatsApp Number (Required)</span>
                    <a
                      href={`https://wa.me/${site.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 text-[11px] flex items-center gap-1 hover:underline"
                    >
                      <MessageCircle className="w-3 h-3" /> Test Link
                    </a>
                  </label>
                  <input
                    type="text"
                    value={site.whatsappNumber}
                    onChange={(e) => updateField('whatsappNumber', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="919876543210"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Country code + mobile number without "+" or spaces.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Default WhatsApp Message Template
                  </label>
                  <textarea
                    rows={2}
                    value={site.defaultWhatsappMessage || ''}
                    onChange={(e) => updateField('defaultWhatsappMessage', e.target.value)}
                    placeholder="Hi {site_name}, I want to order {item}!"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Use <code className="text-emerald-400">{'{item}'}</code> as placeholder for product name.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Logo Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={site.logoUrl || ''}
                    onChange={(e) => updateField('logoUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {site.logoUrl && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <img src={site.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[11px] text-slate-400 truncate">{site.logoUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* THEME & BRANDING TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Primary Accent Color
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => updateField('themeColor', preset.hex)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          site.themeColor === preset.hex
                            ? 'border-white bg-slate-800'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full shadow-inner ring-1 ring-white/10"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className="text-[10px] text-slate-300 truncate w-full text-center">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={site.themeColor}
                      onChange={(e) => updateField('themeColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={site.themeColor}
                      onChange={(e) => updateField('themeColor', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Google Font Family
                  </label>
                  <div className="space-y-2">
                    {FONTS.map((f) => (
                      <div
                        key={f}
                        onClick={() => updateField('fontFamily', f)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          site.fontFamily === f
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-medium" style={{ fontFamily: f }}>
                          {f} — Preview Clean Typography
                        </span>
                        {site.fontFamily === f && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BANNER SLIDER TAB */}
            {activeTab === 'slider' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Top Rotating Banner Slides
                  </label>
                  <button
                    onClick={addSlide}
                    className="py-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Slide
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300">Auto-Rotate Interval</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={site.sliderAutoRotateSeconds || 4}
                      onChange={(e) => updateField('sliderAutoRotateSeconds', parseInt(e.target.value))}
                      className="w-24 accent-emerald-500"
                    />
                    <span className="text-xs font-mono text-emerald-400">
                      {site.sliderAutoRotateSeconds || 4}s
                    </span>
                  </div>
                </div>

                {/* Slides List */}
                <div className="space-y-3">
                  {(site.bannerSlider || []).map((slide, idx) => (
                    <div key={slide.id || idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Slide #{idx + 1}</span>
                        {(site.bannerSlider?.length || 0) > 1 && (
                          <button
                            onClick={() => removeSlide(idx)}
                            className="text-slate-400 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Image URL"
                        value={slide.imageUrl}
                        onChange={(e) => updateSlide(idx, 'imageUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                      />

                      <input
                        type="text"
                        placeholder="Main Headline"
                        value={slide.title || ''}
                        onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                      />

                      <input
                        type="text"
                        placeholder="Subtitle / Promotion text"
                        value={slide.subtitle || ''}
                        onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                      />

                      <input
                        type="text"
                        placeholder="CTA Button Label"
                        value={slide.ctaText || ''}
                        onChange={(e) => updateSlide(idx, 'ctaText', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENT TAB (TEMPLATE SPECIFIC) */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                {/* 1. E-COMMERCE PRODUCTS */}
                {site.type === 'ecommerce' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Products ({site.products?.length || 0})
                      </label>
                      <button
                        onClick={addProduct}
                        className="py-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Product
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(site.products || []).map((prod, idx) => (
                        <div key={prod.id || idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Item #{idx + 1}</span>
                            <button
                              onClick={() => removeProduct(idx)}
                              className="text-slate-400 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Product Name"
                              value={prod.name}
                              onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                              className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                            <div className="flex gap-1">
                              <input
                                type="text"
                                placeholder="₹"
                                value={prod.currency || '₹'}
                                onChange={(e) => updateProduct(idx, 'currency', e.target.value)}
                                className="w-10 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-center"
                              />
                              <input
                                type="text"
                                placeholder="Price"
                                value={prod.price}
                                onChange={(e) => updateProduct(idx, 'price', e.target.value)}
                                className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Badge (e.g. Best Seller)"
                              value={prod.badge || ''}
                              onChange={(e) => updateProduct(idx, 'badge', e.target.value)}
                              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Image URL"
                            value={prod.imageUrl}
                            onChange={(e) => updateProduct(idx, 'imageUrl', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                          />

                          <textarea
                            rows={2}
                            placeholder="Description"
                            value={prod.description}
                            onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. PORTFOLIO FIELDS */}
                {site.type === 'portfolio' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Professional Role / Title
                      </label>
                      <input
                        type="text"
                        value={site.portfolioRoleTitle || ''}
                        onChange={(e) => updateField('portfolioRoleTitle', e.target.value)}
                        placeholder="e.g. Senior Visual Designer & Brand Strategist"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Profile Avatar / Photo URL
                      </label>
                      <input
                        type="text"
                        value={site.portfolioAvatarUrl || ''}
                        onChange={(e) => updateField('portfolioAvatarUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        About Me Bio
                      </label>
                      <textarea
                        rows={4}
                        value={site.portfolioAbout || ''}
                        onChange={(e) => updateField('portfolioAbout', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    {/* Projects Gallery */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Projects Showcase
                        </label>
                        <button
                          onClick={() => {
                            const newProj: PortfolioProject = {
                              id: `proj-${Date.now()}`,
                              title: 'New Showcase Project',
                              description: 'Case study delivering outstanding client results.',
                              imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
                              tags: ['Strategy', 'UI/UX']
                            };
                            updateField('portfolioProjects', [...(site.portfolioProjects || []), newProj]);
                          }}
                          className="py-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Project
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(site.portfolioProjects || []).map((proj, pIdx) => (
                          <div key={proj.id || pIdx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">Project #{pIdx + 1}</span>
                              <button
                                onClick={() => {
                                  const updated = [...(site.portfolioProjects || [])];
                                  updated.splice(pIdx, 1);
                                  updateField('portfolioProjects', updated);
                                }}
                                className="text-slate-400 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Project Title"
                              value={proj.title}
                              onChange={(e) => {
                                const updated = [...(site.portfolioProjects || [])];
                                updated[pIdx].title = e.target.value;
                                updateField('portfolioProjects', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                            <input
                              type="text"
                              placeholder="Image URL"
                              value={proj.imageUrl}
                              onChange={(e) => {
                                const updated = [...(site.portfolioProjects || [])];
                                updated[pIdx].imageUrl = e.target.value;
                                updateField('portfolioProjects', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                            <textarea
                              rows={2}
                              placeholder="Description"
                              value={proj.description}
                              onChange={(e) => {
                                const updated = [...(site.portfolioProjects || [])];
                                updated[pIdx].description = e.target.value;
                                updateField('portfolioProjects', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SINGLE PRODUCT SPECIFICS */}
                {site.type === 'single_product' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Hero Product Title
                      </label>
                      <input
                        type="text"
                        value={site.singleProduct?.productName || ''}
                        onChange={(e) =>
                          updateField('singleProduct', {
                            ...site.singleProduct,
                            productName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Tagline / Catchphrase
                      </label>
                      <input
                        type="text"
                        value={site.singleProduct?.tagline || ''}
                        onChange={(e) =>
                          updateField('singleProduct', {
                            ...site.singleProduct,
                            tagline: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Regular Price (Strikethrough)
                        </label>
                        <input
                          type="text"
                          value={site.singleProduct?.regularPrice || ''}
                          onChange={(e) =>
                            updateField('singleProduct', {
                              ...site.singleProduct,
                              regularPrice: e.target.value,
                            })
                          }
                          placeholder="4,999"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Sale Price (Active)
                        </label>
                        <input
                          type="text"
                          value={site.singleProduct?.salePrice || ''}
                          onChange={(e) =>
                            updateField('singleProduct', {
                              ...site.singleProduct,
                              salePrice: e.target.value,
                            })
                          }
                          placeholder="2,999"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Full Product Story / Description
                      </label>
                      <textarea
                        rows={3}
                        value={site.singleProduct?.description || ''}
                        onChange={(e) =>
                          updateField('singleProduct', {
                            ...site.singleProduct,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Right Canvas: Live Sandboxed Iframe Preview */}
        <section className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
          <div
            className={`h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
              viewport === 'desktop'
                ? 'w-full'
                : viewport === 'tablet'
                ? 'w-[768px]'
                : 'w-[375px]'
            }`}
          >
            {/* Iframe top header bar */}
            <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-0.5 rounded-full border border-slate-800 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>https://{site.slug}.dominal.in</span>
              </div>
              <a
                href={`/api/sites/${site.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white p-1"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Sandboxed Live Preview Iframe */}
            <div className="flex-1 bg-white relative">
              <iframe
                key={previewKey}
                ref={iframeRef}
                src={`/api/sites/${site.id}/preview`}
                className="w-full h-full border-none"
                title="Live Builder Preview"
              />
            </div>
          </div>
        </section>
      </div>

      {/* DEPLOYMENT PIPELINE MODAL */}
      {deployModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setDeployModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Publishing Customer Site</h3>
                <p className="text-xs text-slate-400 font-mono">{site.slug}.dominal.in</p>
              </div>
            </div>

            {/* Pipeline progress steps */}
            <div className="mt-4 space-y-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">1</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">GitHub Repo &amp; Commit</div>
                  <div className="text-[11px] text-slate-400">Creates {site.slug} repo &amp; pushes pure index.html</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">2</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">Vercel Project &amp; Custom Domain</div>
                  <div className="text-[11px] text-slate-400">Links repo &amp; assigns {site.slug}.dominal.in</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">3</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">Cloudflare CNAME Provisioning</div>
                  <div className="text-[11px] text-slate-400">DNS CNAME record (Proxy: OFF / Grey Cloud)</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">4</span>
                <div className="flex-1">
                  <div className="font-semibold text-white">Health Check &amp; Status Polling</div>
                  <div className="text-[11px] text-slate-400">Verifying live availability</div>
                </div>
                {deploying ? (
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>

            {/* Success message or error */}
            {deployError ? (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4" /> Pipeline Failure
                </div>
                <p>{deployError}</p>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handlePublish}
                    className="py-1.5 px-3 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600"
                  >
                    Retry Pipeline
                  </button>
                </div>
              </div>
            ) : !deploying ? (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-emerald-400 text-sm font-bold flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Published Successfully!
                </div>
                <p className="text-xs text-slate-300 mb-3 font-mono">
                  https://{site.slug}.dominal.in
                </p>
                <a
                  href={`https://${site.slug}.dominal.in`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-2 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span>Open Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : null}

            {/* Execution Logs */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Pipeline Logs
              </span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto space-y-1">
                {(site.deploymentLogs || []).map((l, i) => (
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
    </div>
  );
}
