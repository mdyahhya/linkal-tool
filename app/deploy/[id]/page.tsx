'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteData } from '@/types/site';
import { generateQrSvg, downloadQrPng, downloadQrSvg } from '@/lib/qrcode';

// Clean, Minimal SVG Icons (Zero Dependencies, Crisp & Reliable)
function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ExternalLinkIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ArrowLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function DownloadIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function RefreshIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.19" />
    </svg>
  );
}

function SpinnerIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function CodeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function CloudUploadIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <polyline points="12 13 12 9 10 11" />
      <line x1="12" y1="9" x2="12" y2="17" />
    </svg>
  );
}

function GlobeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SearchSeoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <path d="m11 8 2 3-4 1 2 3" strokeWidth="1.5" />
    </svg>
  );
}

function LiveSignalIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h5l3 8 4-16 3 8h5" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

// 5 Specific Process Steps requested by the user
interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: (className?: string) => React.ReactNode;
}

const STEPS: ProcessStep[] = [
  {
    id: 'code',
    title: 'Creating your code',
    description: 'Compiling zero-dependency HTML bundle, responsive layouts, and assets',
    icon: (cls) => <CodeIcon className={cls} />,
  },
  {
    id: 'deploy',
    title: 'Deploying your code',
    description: 'Uploading and distributing production bundle across cloud edge servers',
    icon: (cls) => <CloudUploadIcon className={cls} />,
  },
  {
    id: 'domain',
    title: 'Connecting your domain',
    description: 'Routing custom subdomain and issuing automated SSL certificate',
    icon: (cls) => <GlobeIcon className={cls} />,
  },
  {
    id: 'seo',
    title: 'Doing Google SEO and all',
    description: 'Generating search metadata, social OpenGraph tags, and indexing schema',
    icon: (cls) => <SearchSeoIcon className={cls} />,
  },
  {
    id: 'live',
    title: 'Making your website live',
    description: 'Running health verification check and activating live production link',
    icon: (cls) => <LiveSignalIcon className={cls} />,
  },
];

export default function CleanDeployPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const siteId = resolvedParams.id;
  const router = useRouter();

  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Process progression
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load site on mount
  useEffect(() => {
    const fetchSite = async () => {
      try {
        setLoading(true);
        // Instant read from cache
        try {
          const cached = localStorage.getItem('linkal_sites_history');
          if (cached) {
            const list: SiteData[] = JSON.parse(cached);
            const found = list.find((s) => s.id === siteId);
            if (found) {
              setSite(found);
              if (found.status === 'live') {
                setIsLive(true);
                setActiveStepIndex(STEPS.length);
              }
            }
          }
        } catch {}

        // Authoritative server fetch
        const res = await fetch(`/api/sites/${siteId}`);
        if (!res.ok) throw new Error('Site not found');
        const data = await res.json();
        const serverSite: SiteData = data.site;
        setSite(serverSite);

        if (serverSite.status === 'live') {
          setIsLive(true);
          setActiveStepIndex(STEPS.length);
        } else {
          // Auto start clean deployment process
          triggerProcess(serverSite);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load site');
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [siteId]);

  // Clean sequential step runner
  const triggerProcess = async (targetSite: SiteData) => {
    if (isDeploying) return;
    setIsDeploying(true);
    setIsLive(false);
    setError(null);
    setActiveStepIndex(0);

    // Call server pipeline in background
    const publishPromise = fetch(`/api/sites/${targetSite.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: targetSite }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Publishing failed');
      }
      return data;
    });

    try {
      // Step through all 5 clean steps with natural, smooth timing
      for (let i = 0; i < STEPS.length; i++) {
        setActiveStepIndex(i);
        // Wait realistic step duration
        await new Promise((r) => setTimeout(r, 1400));
      }

      // Await backend completion
      const backendResult = await publishPromise;

      const liveUrl = backendResult.site?.liveUrl || `https://${targetSite.slug}.dominal.in`;
      const finalSite: SiteData = {
        ...(backendResult.site || targetSite),
        status: 'live',
        liveUrl,
        lastDeployedAt: new Date().toISOString(),
      };

      setSite(finalSite);
      setActiveStepIndex(STEPS.length);
      setIsLive(true);

      // Persist to local history
      try {
        const local = localStorage.getItem('linkal_sites_history');
        if (local) {
          const list: SiteData[] = JSON.parse(local);
          const idx = list.findIndex((s) => s.id === finalSite.id);
          if (idx >= 0) list[idx] = finalSite;
          else list.unshift(finalSite);
          localStorage.setItem('linkal_sites_history', JSON.stringify(list));
        } else {
          localStorage.setItem('linkal_sites_history', JSON.stringify([finalSite]));
        }
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Deployment error');
    } finally {
      setIsDeploying(false);
    }
  };

  const copyLiveLink = () => {
    if (!site) return;
    const url = site.liveUrl || `https://${site.slug}.dominal.in`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const liveDomainUrl = site?.liveUrl || (site ? `https://${site.slug}.dominal.in` : 'https://dominal.in');

  if (loading && !site) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 flex flex-col items-center justify-center space-y-3">
        <SpinnerIcon className="w-6 h-6 text-zinc-950" />
        <p className="text-xs font-medium text-zinc-500">Loading deployment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 flex flex-col font-sans antialiased">
      {/* Top Clean Minimal Navbar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(site ? `/builder/${site.id}` : '/dashboard')}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
            title="Back"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-950 tracking-tight">
                Linkal
              </span>
              <span className="text-zinc-300">/</span>
              <span className="text-xs font-medium text-zinc-600">
                {site ? site.name : 'Storefront'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {site && (
            <button
              type="button"
              onClick={() => router.push(`/builder/${site.id}`)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-all"
            >
              Back to Builder
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-all"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Centered Minimal Workspace */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Header Title Section */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            {isLive ? 'Your website is live' : 'Publishing your website'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal">
            {isLive
              ? 'Your website is published, connected to your domain, and ready to share.'
              : 'Please wait while we prepare and deploy your site to the cloud.'}
          </p>
        </div>

        {/* Process Card (White Background, Black Text, Clean Border) */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Progress Header / Percentage */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <span className="text-xs font-semibold text-zinc-700">
              {isLive ? 'Status: Complete' : 'Process'}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-950">
              {isLive ? '100%' : `${Math.min(95, Math.round(((activeStepIndex + 1) / STEPS.length) * 100))}%`}
            </span>
          </div>

          {/* Clean Progress Bar */}
          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-zinc-950 rounded-full transition-all duration-500 ease-out"
              style={{
                width: isLive
                  ? '100%'
                  : `${Math.min(95, Math.round(((activeStepIndex + 1) / STEPS.length) * 100))}%`,
              }}
            />
          </div>

          {/* 5 Process Steps in Order */}
          <div className="space-y-4 pt-2">
            {STEPS.map((step, index) => {
              const isCompleted = isLive || index < activeStepIndex;
              const isCurrent = !isLive && index === activeStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-zinc-50/80 border-zinc-900 shadow-xs'
                      : isCompleted
                      ? 'bg-white border-zinc-200'
                      : 'bg-white border-zinc-100 opacity-60'
                  }`}
                >
                  {/* Step Status Icon */}
                  <div className="pt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                        <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-950 flex items-center justify-center text-zinc-950">
                        <SpinnerIcon className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-zinc-300 text-zinc-400 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Step Text Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-xs sm:text-sm font-semibold ${isCurrent ? 'text-zinc-950 font-bold' : isCompleted ? 'text-zinc-900' : 'text-zinc-500'}`}>
                        {step.title}
                      </h3>
                      <span className={`text-[11px] font-medium ${isCompleted ? 'text-zinc-600' : isCurrent ? 'text-zinc-950 font-semibold' : 'text-zinc-400'}`}>
                        {isCompleted ? 'Done' : isCurrent ? 'In progress...' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 space-y-1">
              <p className="font-semibold text-zinc-950">Deployment Notice</p>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => site && triggerProcess(site)}
                className="mt-2 text-xs font-semibold text-zinc-950 underline hover:no-underline inline-flex items-center gap-1"
              >
                <RefreshIcon className="w-3 h-3" />
                <span>Retry process</span>
              </button>
            </div>
          )}
        </div>

        {/* Completed State: Share Link & QR Code Section */}
        {isLive && site && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Share Link Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-zinc-950">
                  Share your live website link
                </h2>
                <p className="text-xs text-zinc-500">
                  Anyone with this link can now view and interact with your site online.
                </p>
              </div>

              {/* Link Input & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-medium text-zinc-900 truncate select-all">
                  {liveDomainUrl}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyLiveLink}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copiedLink ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={liveDomainUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Visit Website</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Quick WhatsApp Share Action */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">
                  Share directly with customers:
                </span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out our website: ${liveDomainUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-900 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Share on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* QR Code Image Box */}
                <div
                  className="p-3 bg-white rounded-xl border border-zinc-200 shadow-xs shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: generateQrSvg(liveDomainUrl, 130),
                  }}
                />

                {/* QR Description & Download Buttons */}
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">
                      Website QR Code
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Customers can scan this code with their phone camera to instantly open your website. Ideal for print menus, product packaging, and store signs.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => downloadQrPng(liveDomainUrl, `${site.slug}-qr.png`, 800)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <DownloadIcon className="w-3.5 h-3.5" />
                      <span>Download PNG (HD)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadQrSvg(liveDomainUrl, `${site.slug}-qr.svg`)}
                      className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <DownloadIcon className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Download SVG</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Live Preview Accordion (Optional Clean View) */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between text-xs font-semibold text-zinc-900 py-1"
              >
                <span>{showPreview ? 'Hide Website Preview' : 'Show Website Preview'}</span>
                <span className="text-zinc-400 text-[11px]">{showPreview ? 'Close' : 'Click to preview'}</span>
              </button>

              {showPreview && (
                <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
                  <div className="w-full h-80 rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-inner">
                    <iframe
                      src={`/api/sites/${site.id}/preview`}
                      className="w-full h-full border-0"
                      title="Website Preview"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => triggerProcess(site)}
                disabled={isDeploying}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Re-publish updates</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/builder/${site.id}`)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold transition-colors"
                >
                  Edit in Builder
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-semibold transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
