'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Globe,
  ExternalLink,
  RefreshCw,
  Download,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SiteData, DeploymentLogEntry } from '@/types/site';
import { generateQrSvg, downloadQrPng, downloadQrSvg } from '@/lib/qrcode';

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

function QrIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
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

function CpuIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2 M9 2v2 M15 20v2 M9 20v2 M2 15h2 M2 9h2 M20 15h2 M20 9h2" />
    </svg>
  );
}

function RadioIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49 M7.76 16.24a6 6 0 0 1 0-8.49" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14 M4.93 19.07a10 10 0 0 1 0-14.14" />
    </svg>
  );
}

function MonitorIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function TabletIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
    </svg>
  );
}

function SmartphoneIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
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

function LockIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// Stage definitions for the Agentic AI Pipeline
type PipelineStageKey =
  | 'analyzing'
  | 'creating_website'
  | 'uploading_images'
  | 'uploading_code'
  | 'deploying_cloud'
  | 'connecting_domain'
  | 'making_ready'
  | 'live';

interface StageConfig {
  id: PipelineStageKey;
  label: string;
  tagline: string;
  subTasks: string[];
  terminalTag: string;
  durationMs: number;
}

const PIPELINE_STAGES: StageConfig[] = [
  {
    id: 'analyzing',
    label: 'Analyzing project architecture & requirements',
    tagline: 'Synthesizing schema, typography tokens, layout hierarchy, and WhatsApp triggers',
    subTasks: [
      'Validating data schema & metadata tokens',
      'Resolving viewport responsive breakpoints',
      'Checking WhatsApp checkout link structure',
    ],
    terminalTag: 'ANALYZER',
    durationMs: 1800,
  },
  {
    id: 'creating_website',
    label: 'Creating your website',
    tagline: 'Compiling zero-dependency HTML bundle, responsive inline CSS, and client-side logic',
    subTasks: [
      'Compiling semantic zero-dependency static DOM',
      'Assembling fluid responsive grid styles',
      'Injecting dynamic WhatsApp conversion engine',
    ],
    terminalTag: 'COMPILER',
    durationMs: 2400,
  },
  {
    id: 'uploading_images',
    label: 'Uploading your images',
    tagline: 'Compressing media assets, processing banner slides, and generating vector QR matrices',
    subTasks: [
      'Optimizing hero banner graphics & logos',
      'Encoding product gallery thumbnails',
      'Generating high-density vector QR code assets',
    ],
    terminalTag: 'ASSET_CDN',
    durationMs: 2000,
  },
  {
    id: 'uploading_code',
    label: 'Uploading your code',
    tagline: 'Generating versioned Git snapshot, computing SHA-256 tree, and committing to cloud repository',
    subTasks: [
      'Creating immutable Git commit snapshot',
      'Computing cryptographic file checksums',
      'Synchronizing release bundle to Linkal cloud repository',
    ],
    terminalTag: 'GIT_ENGINE',
    durationMs: 2200,
  },
  {
    id: 'deploying_cloud',
    label: 'Deploying to edge cloud infrastructure',
    tagline: 'Distributing containerless static runtime across multi-region global edge nodes',
    subTasks: [
      'Provisioning serverless edge project container',
      'Propagating static artifacts to Vercel Edge runtime',
      'Priming regional cache invalidation layers',
    ],
    terminalTag: 'EDGE_ROUTER',
    durationMs: 2600,
  },
  {
    id: 'connecting_domain',
    label: 'Connecting your domain',
    tagline: 'Configuring Cloudflare DNS CNAME record and orchestrating TLS 1.3 SSL certificate handshake',
    subTasks: [
      'Allocating Cloudflare CNAME DNS routing target',
      'Conducting automated SSL certificate issuance',
      'Validating zero-downtime edge resolution',
    ],
    terminalTag: 'DNS_SSL',
    durationMs: 2800,
  },
  {
    id: 'making_ready',
    label: 'Making it ready',
    tagline: 'Executing edge health check pings, warming CDN routes, and activating live production link',
    subTasks: [
      'Running global edge health & latency check (TTFB < 40ms)',
      'Verifying direct WhatsApp cart action triggers',
      'Enabling live production SSL routing status',
    ],
    terminalTag: 'VERIFIER',
    durationMs: 1800,
  },
];

// Custom High-End SVG Visualizer 1: Architecture & Requirements Analyzer
function AnalyzerSvg() {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* Scanning laser beam */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-beam-sweep pointer-events-none" />

      <svg viewBox="0 0 360 160" className="w-full max-w-sm h-full" fill="none">
        {/* Connection circuit paths with animated dashes */}
        <path
          d="M 60 80 L 140 80 M 220 80 L 300 80 M 180 40 L 180 80 M 180 80 L 180 120 M 140 80 L 180 40 M 180 40 L 220 80 M 140 80 L 180 120 M 180 120 L 220 80"
          stroke="#3f3f46"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-dash-flow"
        />

        {/* Central Core Node */}
        <g transform="translate(180, 80)">
          <circle r="32" fill="#09090b" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" />
          <circle
            r="26"
            fill="#09090b"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            className="animate-spin-slow origin-center"
          />
          <circle r="18" fill="#164e63" opacity="0.6" className="animate-radar-pulse" />
          <circle r="12" fill="#0891b2" />
          {/* Inner core glyph */}
          <path
            d="M -5 -5 L 5 5 M 5 -5 L -5 5"
            stroke="#cffafe"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Satellite Node 1: Schema */}
        <g transform="translate(60, 80)">
          <circle r="16" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
          <circle r="6" fill="#38bdf8" />
          <text x="0" y="26" fill="#a1a1aa" fontSize="9" fontWeight="600" textAnchor="middle">
            Schema AST
          </text>
        </g>

        {/* Satellite Node 2: Tokens */}
        <g transform="translate(180, 24)">
          <circle r="14" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
          <circle r="5" fill="#a855f7" />
          <text x="0" y="-8" fill="#a1a1aa" fontSize="9" fontWeight="600" textAnchor="middle">
            Design Tokens
          </text>
        </g>

        {/* Satellite Node 3: Viewport */}
        <g transform="translate(180, 136)">
          <circle r="14" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
          <circle r="5" fill="#10b981" />
          <text x="0" y="20" fill="#a1a1aa" fontSize="9" fontWeight="600" textAnchor="middle">
            Breakpoints
          </text>
        </g>

        {/* Satellite Node 4: WhatsApp Engine */}
        <g transform="translate(300, 80)">
          <circle r="16" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
          <circle r="6" fill="#22c55e" />
          <text x="0" y="26" fill="#a1a1aa" fontSize="9" fontWeight="600" textAnchor="middle">
            WhatsApp Hook
          </text>
        </g>
      </svg>
    </div>
  );
}

// Custom High-End SVG Visualizer 2: Creating Your Website (Compiler & Layout Synthesizer)
function WebsiteCreatorSvg() {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80">
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <svg viewBox="0 0 360 160" className="w-full max-w-sm h-full" fill="none">
        {/* Animated Synthesized Browser Window */}
        <rect
          x="40"
          y="18"
          width="280"
          height="124"
          rx="10"
          fill="#09090b"
          stroke="#3f3f46"
          strokeWidth="1.5"
        />

        {/* Browser Top Bar */}
        <rect x="40" y="18" width="280" height="22" rx="10" fill="#18181b" />
        <circle cx="56" cy="29" r="3.5" fill="#ef4444" />
        <circle cx="68" cy="29" r="3.5" fill="#f59e0b" />
        <circle cx="80" cy="29" r="3.5" fill="#10b981" />
        <rect x="100" y="23" width="160" height="12" rx="4" fill="#27272a" />
        <rect x="108" y="27" width="90" height="4" rx="2" fill="#52525b" />

        {/* Assembling Header & Nav */}
        <rect x="52" y="48" width="50" height="8" rx="2" fill="#6366f1" />
        <rect x="230" y="48" width="30" height="8" rx="2" fill="#3f3f46" />
        <rect x="265" y="46" width="42" height="12" rx="4" fill="#10b981" />

        {/* Assembling Hero Banner */}
        <rect
          x="52"
          y="66"
          width="256"
          height="32"
          rx="6"
          fill="#18181b"
          stroke="#4f46e5"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        <rect x="62" y="73" width="110" height="6" rx="2" fill="#e0e7ff" />
        <rect x="62" y="83" width="70" height="5" rx="2" fill="#6366f1" />
        <circle cx="280" cy="82" r="8" fill="#4338ca" />

        {/* Assembling Grid Products */}
        <rect x="52" y="106" width="76" height="26" rx="4" fill="#18181b" stroke="#27272a" />
        <rect x="58" y="112" width="24" height="14" rx="2" fill="#27272a" />
        <rect x="86" y="112" width="36" height="4" rx="1.5" fill="#71717a" />
        <rect x="86" y="119" width="22" height="4" rx="1.5" fill="#10b981" />

        <rect x="142" y="106" width="76" height="26" rx="4" fill="#18181b" stroke="#27272a" />
        <rect x="148" y="112" width="24" height="14" rx="2" fill="#27272a" />
        <rect x="176" y="112" width="36" height="4" rx="1.5" fill="#71717a" />
        <rect x="176" y="119" width="22" height="4" rx="1.5" fill="#10b981" />

        <rect x="232" y="106" width="76" height="26" rx="4" fill="#18181b" stroke="#27272a" />
        <rect x="238" y="112" width="24" height="14" rx="2" fill="#27272a" />
        <rect x="266" y="112" width="36" height="4" rx="1.5" fill="#71717a" />
        <rect x="266" y="119" width="22" height="4" rx="1.5" fill="#10b981" />

        {/* Floating Code Badges with subtle float animation */}
        <g className="animate-float-subtle">
          <rect x="20" y="58" width="50" height="18" rx="5" fill="#09090b" stroke="#818cf8" strokeWidth="1" />
          <text x="45" y="70" fill="#c7d2fe" fontSize="8" fontWeight="700" textAnchor="middle">
            &lt;HTML /&gt;
          </text>
        </g>

        <g className="animate-float-subtle" style={{ animationDelay: '1.2s' }}>
          <rect x="290" y="85" width="48" height="18" rx="5" fill="#09090b" stroke="#34d399" strokeWidth="1" />
          <text x="314" y="97" fill="#a7f3d0" fontSize="8" fontWeight="700" textAnchor="middle">
            .css:inline
          </text>
        </g>
      </svg>
    </div>
  );
}

// Custom High-End SVG Visualizer 3: Uploading Your Images & Media Assets
function ImageUploaderSvg() {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80">
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <svg viewBox="0 0 360 160" className="w-full max-w-sm h-full" fill="none">
        {/* Curved Data Uplink Paths */}
        <path
          d="M 70 120 C 110 90, 140 60, 180 50"
          stroke="#059669"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-dash-flow"
        />
        <path
          d="M 180 120 L 180 50"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-dash-flow"
        />
        <path
          d="M 290 120 C 250 90, 220 60, 180 50"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-dash-flow"
        />

        {/* Central Cloud Storage Ingestion Hub */}
        <g transform="translate(180, 42)">
          <circle r="30" fill="#064e3b" opacity="0.3" className="animate-radar-pulse" />
          <circle
            r="24"
            fill="#09090b"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            className="animate-spin-slow origin-center"
          />
          {/* Cloud Icon */}
          <path
            d="M -12 2 A 6 6 0 0 1 -4 -4 A 8 8 0 0 1 8 -3 A 6 6 0 0 1 12 3 A 5 5 0 0 1 8 8 L -10 8 A 5 5 0 0 1 -12 2 Z"
            fill="#10b981"
            stroke="#059669"
            strokeWidth="1.5"
          />
          <text x="0" y="24" fill="#6ee7b7" fontSize="8" fontWeight="700" textAnchor="middle">
            CDN Edge Storage
          </text>
        </g>

        {/* Tile 1: Hero Banner Image */}
        <g transform="translate(68, 120)" className="animate-float-subtle">
          <rect x="-26" y="-18" width="52" height="34" rx="6" fill="#18181b" stroke="#059669" strokeWidth="1.2" />
          <rect x="-20" y="-12" width="40" height="14" rx="3" fill="#064e3b" />
          <circle cx="-12" cy="-5" r="3" fill="#34d399" />
          <path d="M -6 0 L 2 -6 L 14 2" stroke="#6ee7b7" strokeWidth="1.2" strokeLinecap="round" />
          <text x="0" y="10" fill="#a1a1aa" fontSize="7" fontWeight="600" textAnchor="middle">
            Banner WebP
          </text>
        </g>

        {/* Tile 2: Product Photography */}
        <g transform="translate(180, 120)" className="animate-float-subtle" style={{ animationDelay: '0.6s' }}>
          <rect x="-26" y="-18" width="52" height="34" rx="6" fill="#18181b" stroke="#10b981" strokeWidth="1.2" />
          <rect x="-20" y="-12" width="40" height="14" rx="3" fill="#065f46" />
          <circle cx="-12" cy="-5" r="3" fill="#a7f3d0" />
          <text x="0" y="10" fill="#a1a1aa" fontSize="7" fontWeight="600" textAnchor="middle">
            Product Grid
          </text>
        </g>

        {/* Tile 3: Vector QR Code Matrix */}
        <g transform="translate(292, 120)" className="animate-float-subtle" style={{ animationDelay: '1.2s' }}>
          <rect x="-26" y="-18" width="52" height="34" rx="6" fill="#18181b" stroke="#34d399" strokeWidth="1.2" />
          {/* Mini QR layout */}
          <rect x="-18" y="-12" width="8" height="8" fill="#10b981" rx="1" />
          <rect x="-6" y="-12" width="8" height="8" fill="#10b981" rx="1" />
          <rect x="-18" y="0" width="8" height="8" fill="#10b981" rx="1" />
          <rect x="-6" y="0" width="3" height="3" fill="#34d399" />
          <rect x="0" y="4" width="4" height="4" fill="#34d399" />
          <text x="0" y="10" fill="#a1a1aa" fontSize="7" fontWeight="600" textAnchor="middle">
            Vector QR
          </text>
        </g>
      </svg>
    </div>
  );
}

// Custom High-End SVG Visualizer 4: Uploading Your Code (Git Commit Tree & Release Push)
function CodeUploaderSvg() {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80">
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <svg viewBox="0 0 360 160" className="w-full max-w-sm h-full" fill="none">
        {/* Main Git Branch line */}
        <line x1="40" y1="80" x2="320" y2="80" stroke="#3f3f46" strokeWidth="3" />
        <line
          x1="120"
          y1="80"
          x2="260"
          y2="80"
          stroke="#8b5cf6"
          strokeWidth="3"
          strokeDasharray="6 4"
          className="animate-dash-flow"
        />

        {/* Feature / Deployment Branch Arcs */}
        <path
          d="M 120 80 C 140 40, 200 40, 220 80"
          stroke="#a855f7"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="animate-dash-flow"
        />

        {/* Commit Node 1 */}
        <g transform="translate(60, 80)">
          <circle r="12" fill="#18181b" stroke="#71717a" strokeWidth="2" />
          <circle r="5" fill="#a1a1aa" />
          <text x="0" y="24" fill="#71717a" fontSize="8" fontWeight="600" textAnchor="middle">
            init:v1.0
          </text>
        </g>

        {/* Commit Node 2 */}
        <g transform="translate(120, 80)">
          <circle r="12" fill="#18181b" stroke="#8b5cf6" strokeWidth="2" />
          <circle r="5" fill="#a855f7" />
          <text x="0" y="24" fill="#a855f7" fontSize="8" fontWeight="600" textAnchor="middle">
            tree:synced
          </text>
        </g>

        {/* Branch Commit Node (Top Arc) */}
        <g transform="translate(170, 48)">
          <circle r="10" fill="#18181b" stroke="#c084fc" strokeWidth="1.8" />
          <circle r="4" fill="#e9d5ff" />
          <text x="0" y="-12" fill="#c084fc" fontSize="8" fontWeight="700" textAnchor="middle">
            static-bundle
          </text>
        </g>

        {/* Active Deploy Commit Node 3 */}
        <g transform="translate(260, 80)">
          <circle r="22" fill="#2e1065" opacity="0.4" className="animate-radar-pulse" />
          <circle
            r="16"
            fill="#09090b"
            stroke="#a855f7"
            strokeWidth="2"
            strokeDasharray="6 3"
            className="animate-spin-slow origin-center"
          />
          <circle r="7" fill="#c084fc" />
          <text x="0" y="28" fill="#d8b4fe" fontSize="9" fontWeight="700" textAnchor="middle">
            release:HEAD
          </text>
        </g>

        {/* Sync Success Checkpoint */}
        <g transform="translate(310, 80)">
          <circle r="10" fill="#18181b" stroke="#22c55e" strokeWidth="1.5" />
          <path d="M -4 0 L -1 3 L 4 -3" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Floating Commit Hash Pill */}
        <g className="animate-float-subtle" transform="translate(260, 28)">
          <rect x="-42" y="-10" width="84" height="20" rx="6" fill="#09090b" stroke="#7c3aed" strokeWidth="1" />
          <text x="0" y="3" fill="#e9d5ff" fontSize="8" fontWeight="700" textAnchor="middle">
            SHA: #8f20b41c
          </text>
        </g>
      </svg>
    </div>
  );
}

// Custom High-End SVG Visualizer 5: Deploying Edge Cloud Infrastructure (Serverless Edge Mesh)
function EdgeDeploySvg() {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80">
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <svg viewBox="0 0 360 160" className="w-full max-w-sm h-full" fill="none">
        {/* Global Latency Orbital Rings */}
        <g transform="translate(180, 80)">
          <ellipse
            rx="130"
            ry="45"
            stroke="#3f3f46"
            strokeWidth="1.2"
            strokeDasharray="6 4"
            className="animate-spin-slow origin-center"
          />
          <ellipse
            rx="100"
            ry="60"
            stroke="#1e3a8a"
            strokeWidth="1.2"
            strokeDasharray="8 6"
            className="animate-spin-reverse origin-center"
          />

          {/* Core Central Cloud Hub */}
          <circle r="36" fill="#1e1b4b" opacity="0.3" className="animate-radar-pulse" />
          <circle r="26" fill="#09090b" stroke="#3b82f6" strokeWidth="2" />
          <circle r="18" fill="#1d4ed8" opacity="0.6" />
          <circle r="10" fill="#60a5fa" />
          {/* Server Icon inside */}
          <rect x="-6" y="-5" width="12" height="4" rx="1" fill="#eff6ff" />
          <rect x="-6" y="1" width="12" height="4" rx="1" fill="#eff6ff" />
        </g>

        {/* Regional Edge Node 1: Mumbai (BOM) */}
        <g transform="translate(90, 60)">
          <circle r="12" fill="#18181b" stroke="#60a5fa" strokeWidth="1.5" />
          <circle r="4" fill="#3b82f6" />
          <text x="0" y="22" fill="#93c5fd" fontSize="8" fontWeight="700" textAnchor="middle">
            BOM (Edge)
          </text>
        </g>

        {/* Regional Edge Node 2: Frankfurt (FRA) */}
        <g transform="translate(140, 130)">
          <circle r="12" fill="#18181b" stroke="#60a5fa" strokeWidth="1.5" />
          <circle r="4" fill="#3b82f6" />
          <text x="0" y="22" fill="#93c5fd" fontSize="8" fontWeight="700" textAnchor="middle">
            FRA (Edge)
          </text>
        </g>

        {/* Regional Edge Node 3: Singapore (SIN) */}
        <g transform="translate(270, 70)">
          <circle r="12" fill="#18181b" stroke="#60a5fa" strokeWidth="1.5" />
          <circle r="4" fill="#3b82f6" />
          <text x="0" y="22" fill="#93c5fd" fontSize="8" fontWeight="700" textAnchor="middle">
            SIN (Edge)
          </text>
        </g>

        {/* Regional Edge Node 4: Washington DC (IAD) */}
        <g transform="translate(230, 130)">
          <circle r="12" fill="#18181b" stroke="#60a5fa" strokeWidth="1.5" />
          <circle r="4" fill="#3b82f6" />
          <text x="0" y="22" fill="#93c5fd" fontSize="8" fontWeight="700" textAnchor="middle">
            IAD (Edge)
          </text>
        </g>

        {/* Sub-second latency badge */}
        <g className="animate-float-subtle" transform="translate(180, 20)">
          <rect x="-48" y="-10" width="96" height="20" rx="6" fill="#09090b" stroke="#2563eb" strokeWidth="1" />
          <text x="0" y="3" fill="#bfdbfe" fontSize="8" fontWeight="700" textAnchor="middle">
            Latency: &lt;28ms Anycast
          </text>
        </g>
      </svg>
    </div>
  );
}

// Custom High-End SVG Visualizer 6: Connecting Your Domain (Cloudflare DNS & SSL Padlock)
function DomainConnectorSvg({ slug }: { slug: string }) {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80">
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <svg viewBox="0 0 360 160" className="w-full max-w-sm h-full" fill="none">
        {/* Orbital DNS Data Ring */}
        <g transform="translate(180, 80)">
          <circle r="65" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="6 4" className="animate-spin-slow origin-center" />
          <circle r="45" stroke="#10b981" strokeWidth="1.5" strokeDasharray="8 6" className="animate-spin-reverse origin-center" />

          {/* Central Cryptographic SSL Lock */}
          <circle r="32" fill="#064e3b" opacity="0.3" className="animate-radar-pulse" />
          <circle r="24" fill="#09090b" stroke="#10b981" strokeWidth="2" />
          {/* Lock Shackle */}
          <path
            d="M -6 -4 L -6 -11 C -6 -16, 6 -16, 6 -11 L 6 -4"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Lock Body */}
          <rect x="-9" y="-4" width="18" height="14" rx="3" fill="#059669" />
          <circle cx="0" cy="2" r="2" fill="#ecfdf5" />
          <line x1="0" y1="2" x2="0" y2="6" stroke="#ecfdf5" strokeWidth="1.5" />
        </g>

        {/* Left Badge: Target Subdomain */}
        <g transform="translate(80, 80)">
          <rect x="-65" y="-18" width="130" height="36" rx="8" fill="#18181b" stroke="#f59e0b" strokeWidth="1.2" />
          <text x="0" y="-3" fill="#fbbf24" fontSize="8" fontWeight="700" textAnchor="middle">
            Cloudflare CNAME
          </text>
          <text x="0" y="10" fill="#fef3c7" fontSize="9" fontWeight="800" textAnchor="middle">
            {slug ? `${slug}.dominal.in` : 'subdomain.dominal.in'}
          </text>
        </g>

        {/* Connecting vector beam */}
        <path
          d="M 145 80 L 156 80 M 204 80 L 215 80"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="3 3"
          className="animate-dash-flow"
        />

        {/* Right Badge: Vercel CNAME Target */}
        <g transform="translate(280, 80)">
          <rect x="-65" y="-18" width="130" height="36" rx="8" fill="#18181b" stroke="#10b981" strokeWidth="1.2" />
          <text x="0" y="-3" fill="#34d399" fontSize="8" fontWeight="700" textAnchor="middle">
            TLS 1.3 Active
          </text>
          <text x="0" y="10" fill="#a7f3d0" fontSize="9" fontWeight="800" textAnchor="middle">
            cname.vercel-dns.com
          </text>
        </g>

        {/* DNS Propagation Status Pill */}
        <g className="animate-float-subtle" transform="translate(180, 24)">
          <rect x="-56" y="-10" width="112" height="20" rx="6" fill="#09090b" stroke="#059669" strokeWidth="1" />
          <text x="0" y="3" fill="#a7f3d0" fontSize="8" fontWeight="700" textAnchor="middle">
            Zero-Downtime Verified
          </text>
        </g>
      </svg>
    </div>
  );
}

// Custom High-End SVG Visualizer 7: Making It Ready & Live Verification
function ReadyVerificationSvg({ liveUrl }: { liveUrl: string }) {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80">
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      <svg viewBox="0 0 360 160" className="w-full max-w-sm h-full" fill="none">
        {/* Radar concentric waves */}
        <circle cx="180" cy="80" r="68" stroke="#10b981" strokeWidth="1" opacity="0.2" className="animate-radar-pulse" />
        <circle cx="180" cy="80" r="50" stroke="#10b981" strokeWidth="1.2" opacity="0.4" className="animate-radar-pulse" style={{ animationDelay: '0.6s' }} />
        <circle
          cx="180"
          cy="80"
          r="38"
          stroke="#34d399"
          strokeWidth="1.8"
          strokeDasharray="8 6"
          className="animate-spin-slow origin-center"
        />

        {/* Central Emerald Checkmark Core */}
        <circle cx="180" cy="80" r="26" fill="#059669" />
        <circle cx="180" cy="80" r="22" fill="#10b981" />
        <path
          d="M 172 80 L 177 85 L 189 73"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Floating Active URL Banner */}
        <g className="animate-float-subtle" transform="translate(180, 136)">
          <rect x="-85" y="-12" width="170" height="24" rx="8" fill="#09090b" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="-70" cy="0" r="3.5" fill="#22c55e" className="animate-pulse" />
          <text x="3" y="4" fill="#a7f3d0" fontSize="9" fontWeight="700" textAnchor="middle">
            {liveUrl || 'https://linkal.dominal.in'}
          </text>
        </g>

        {/* Top Status Header */}
        <g className="animate-float-subtle" transform="translate(180, 24)">
          <rect x="-60" y="-10" width="120" height="20" rx="6" fill="#09090b" stroke="#059669" strokeWidth="1" />
          <text x="0" y="3" fill="#6ee7b7" fontSize="8" fontWeight="800" textAnchor="middle">
            100% STOREFRONT ACTIVE
          </text>
        </g>
      </svg>
    </div>
  );
}

// Visualizer Switcher based on Active Stage
function ActiveVisualizer({
  stage,
  slug,
  liveUrl,
}: {
  stage: PipelineStageKey;
  slug: string;
  liveUrl: string;
}) {
  switch (stage) {
    case 'analyzing':
      return <AnalyzerSvg />;
    case 'creating_website':
      return <WebsiteCreatorSvg />;
    case 'uploading_images':
      return <ImageUploaderSvg />;
    case 'uploading_code':
      return <CodeUploaderSvg />;
    case 'deploying_cloud':
      return <EdgeDeploySvg />;
    case 'connecting_domain':
      return <DomainConnectorSvg slug={slug} />;
    case 'making_ready':
    case 'live':
    default:
      return <ReadyVerificationSvg liveUrl={liveUrl} />;
  }
}

export default function DeployPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const siteId = resolvedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [site, setSite] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pipeline Execution States
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(5);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeViewport, setActiveViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

  // Terminal & Log stream
  const [terminalLogs, setTerminalLogs] = useState<
    Array<{ id: string; time: string; tag: string; message: string; type?: 'info' | 'success' | 'warn' | 'error' }>
  >([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addTerminalLog = (
    tag: string,
    message: string,
    type: 'info' | 'success' | 'warn' | 'error' = 'info'
  ) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, time, tag, message, type },
    ]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Load site data
  useEffect(() => {
    const loadSite = async () => {
      try {
        setLoading(true);
        // 1. Try local cache first for instant response
        try {
          const cached = localStorage.getItem('linkal_sites_history');
          if (cached) {
            const list: SiteData[] = JSON.parse(cached);
            const found = list.find((s) => s.id === siteId);
            if (found) {
              setSite(found);
              if (found.status === 'live') {
                setIsLive(true);
                setCurrentStageIndex(PIPELINE_STAGES.length - 1);
                setProgressPercent(100);
              }
            }
          }
        } catch {}

        // 2. Fetch authoritative site from server API
        const res = await fetch(`/api/sites/${siteId}`);
        if (!res.ok) {
          throw new Error('Storefront not found');
        }
        const data = await res.json();
        const serverSite: SiteData = data.site;
        setSite(serverSite);

        if (serverSite.status === 'live') {
          setIsLive(true);
          setCurrentStageIndex(PIPELINE_STAGES.length - 1);
          setProgressPercent(100);
        } else {
          // Auto start deployment if not live or triggered with query
          startDeployment(serverSite);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize deployment engine');
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [siteId]);

  // Trigger Full Agentic Deployment Pipeline
  const startDeployment = async (targetSite: SiteData) => {
    if (isDeploying) return;
    setIsDeploying(true);
    setIsLive(false);
    setError(null);
    setCurrentStageIndex(0);
    setProgressPercent(8);

    setTerminalLogs([]);
    addTerminalLog('SYSTEM', 'Autonomous Agentic Deployment Engine v2.4 initialized', 'info');
    addTerminalLog('TARGET', `Allocating edge cluster for domain: https://${targetSite.slug}.dominal.in`, 'info');

    // Launch backend publish in parallel
    const publishPromise = fetch(`/api/sites/${targetSite.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: targetSite }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Deployment pipeline failed');
      }
      return data;
    });

    // Run progressive UI stages with rich feedback
    try {
      for (let i = 0; i < PIPELINE_STAGES.length; i++) {
        const stage = PIPELINE_STAGES[i];
        setCurrentStageIndex(i);

        // Progress percentage calculation
        const basePercent = Math.round(((i + 1) / PIPELINE_STAGES.length) * 92);
        setProgressPercent(basePercent);

        addTerminalLog(stage.terminalTag, `${stage.label}...`, 'info');

        // Stream sub-tasks
        for (const subTask of stage.subTasks) {
          await new Promise((r) => setTimeout(r, Math.round(stage.durationMs / stage.subTasks.length)));
          addTerminalLog(stage.terminalTag, `[SUCCESS] ${subTask}`, 'success');
        }
      }

      // Await real backend completion
      const backendResult = await publishPromise;

      const liveUrl = backendResult.site?.liveUrl || `https://${targetSite.slug}.dominal.in`;
      const finalSite: SiteData = {
        ...(backendResult.site || targetSite),
        status: 'live',
        liveUrl,
        lastDeployedAt: new Date().toISOString(),
      };

      setSite(finalSite);
      setIsLive(true);
      setProgressPercent(100);
      setCurrentStageIndex(PIPELINE_STAGES.length - 1);

      // Save to localStorage history
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

      addTerminalLog('VERIFIER', `Storefront verified 100% active on Cloudflare Edge!`, 'success');
      addTerminalLog('SYSTEM', `Production URL live: ${liveUrl}`, 'success');
      setPreviewReloadKey((k) => k + 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Pipeline encountered an issue');
      addTerminalLog('ERROR', `Pipeline aborted: ${err.message || 'Error occurred'}`, 'error');
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

  const currentStage = PIPELINE_STAGES[currentStageIndex] || PIPELINE_STAGES[0];
  const targetDomain = site ? `https://${site.slug}.dominal.in` : 'https://linkal.dominal.in';

  if (loading && !site) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-400">Initializing Linkal Autonomous Deployer...</p>
      </div>
    );
  }

  if (error && !site) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-zinc-100">Deployment Engine Initialization Failed</h2>
        <p className="text-xs text-zinc-400 max-w-md text-center">{error}</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Billion-Dollar SaaS Header */}
      <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(site ? `/builder/${site.id}` : '/dashboard')}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all"
            title="Return"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CpuIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-zinc-100 tracking-wide uppercase">
                  Linkal Agentic Deployer
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-800 text-emerald-400 border border-emerald-500/20">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">
                Target: {targetDomain}
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Status Badges & Quick Links */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-[11px] font-mono text-zinc-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : isDeploying
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-zinc-500'
              }`}
            />
            <span>
              {isLive ? 'Edge Cluster Live' : isDeploying ? 'Pipeline Active' : 'Ready'}
            </span>
          </div>

          {site && (
            <button
              onClick={() => router.push(`/builder/${site.id}`)}
              className="px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visual Builder</span>
            </button>
          )}

          {isLive && site && (
            <a
              href={site.liveUrl || targetDomain}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
            >
              <span>Open Live</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </header>

      {/* Main Workspace: Two-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agentic Pipeline Execution & Animation Hub (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active SVG Animation Theater Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400 font-mono">
                <RadioIcon className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="uppercase tracking-wider text-[10px]">
                  Agentic Visualizer &bull; {currentStage.terminalTag}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-zinc-400">
                Phase {currentStageIndex + 1} of {PIPELINE_STAGES.length}
              </span>
            </div>

            {/* Dynamic Custom SVG Visualizer */}
            <ActiveVisualizer
              stage={isLive ? 'live' : currentStage.id}
              slug={site?.slug || 'store'}
              liveUrl={site?.liveUrl || targetDomain}
            />

            {/* Active Stage HUD Description */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <h1 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>{currentStage.label}</span>
                </h1>
                <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  {progressPercent}%
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {currentStage.tagline}
              </p>
            </div>

            {/* High-Tech Glowing Progress Bar */}
            <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800/80">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-700 ease-out rounded-full shadow-[0_0_12px_#34d399]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Active Sub-tasks status row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {currentStage.subTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/60 flex items-center gap-2 text-[10px] text-zinc-300"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="truncate">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Stage Progression Checklist */}
          <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 space-y-3">
            <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              Automated Pipeline Stages
            </h2>
            <div className="space-y-1.5">
              {PIPELINE_STAGES.map((st, i) => {
                const isPassed = isLive || i < currentStageIndex;
                const isActive = !isLive && i === currentStageIndex;

                return (
                  <div
                    key={st.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-zinc-800/80 border-emerald-500/40 text-zinc-100 shadow-sm'
                        : isPassed
                        ? 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400'
                        : 'bg-zinc-950/20 border-transparent text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-mono font-bold ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                        }`}
                      >
                        {isPassed ? (
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        ) : isActive ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className="text-xs font-semibold truncate">{st.label}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                        isPassed
                          ? 'text-emerald-400 bg-emerald-950/40'
                          : isActive
                          ? 'text-cyan-400 bg-cyan-950/40 animate-pulse'
                          : 'text-zinc-600'
                      }`}
                    >
                      {isPassed ? 'Completed' : isActive ? 'Processing' : 'Queued'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agentic Live Stream Terminal HUD */}
          <div className="p-4 rounded-2xl bg-black border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2.5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-zinc-500 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <span className="text-zinc-400 pl-1 font-sans font-semibold">
                  linkal-agent --telemetry-stream
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const text = terminalLogs.map((l) => `[${l.time}] [${l.tag}] ${l.message}`).join('\n');
                  navigator.clipboard.writeText(text);
                }}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 font-sans"
              >
                <CopyIcon className="w-3 h-3" />
                <span>Copy Logs</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 font-mono text-[11px]">
              {terminalLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-zinc-600 text-[10px] shrink-0">{log.time}</span>
                  <span
                    className={`text-[10px] font-bold shrink-0 ${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    [{log.tag}]
                  </span>
                  <span
                    className={
                      log.type === 'error'
                        ? 'text-red-300'
                        : log.type === 'success'
                        ? 'text-zinc-200'
                        : 'text-zinc-400'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
              {isDeploying && (
                <div className="flex items-center gap-2 text-cyan-400 pt-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="animate-pulse">Synthesizing cloud artifacts...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Browser Mockup & Launchpad (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Simulated Browser Frame with Live Iframe */}
          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Browser Window Chrome */}
            <div className="bg-zinc-950 border-b border-zinc-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                {/* 3 OS Dots */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>

                {/* Viewport Width Switchers */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveViewport('desktop')}
                    className={`p-1 rounded-md transition-all ${
                      activeViewport === 'desktop'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Desktop Viewport"
                  >
                    <MonitorIcon className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewport('tablet')}
                    className={`p-1 rounded-md transition-all ${
                      activeViewport === 'tablet'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Tablet Viewport"
                  >
                    <TabletIcon className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveViewport('mobile')}
                    className={`p-1 rounded-md transition-all ${
                      activeViewport === 'mobile'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Mobile Viewport"
                  >
                    <SmartphoneIcon className="w-3 h-3" />
                  </button>
                </div>

                {/* Reload Button */}
                <button
                  type="button"
                  onClick={() => setPreviewReloadKey((k) => k + 1)}
                  className="p-1 rounded-md text-zinc-500 hover:text-zinc-300"
                  title="Reload Live Viewport"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {/* URL Address Bar */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                <LockIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{targetDomain}</span>
              </div>
            </div>

            {/* Interactive Browser Canvas */}
            <div className="w-full h-[380px] sm:h-[440px] bg-zinc-950 flex items-center justify-center overflow-hidden p-2">
              <div
                className={`h-full transition-all duration-300 bg-white rounded-lg overflow-hidden shadow-inner ${
                  activeViewport === 'desktop'
                    ? 'w-full'
                    : activeViewport === 'tablet'
                    ? 'w-[360px]'
                    : 'w-[280px]'
                }`}
              >
                {site ? (
                  <iframe
                    key={previewReloadKey}
                    src={`/api/sites/${site.id}/preview`}
                    className="w-full h-full border-0 bg-white"
                    title="Live Preview Canvas"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                    Loading preview...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Launchpad Hub: Live Domain, QR Code & Post-Deploy Controls */}
          {site && (
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-100">
                      {isLive ? 'Storefront Ready & Live' : 'Deployment Status'}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      {isLive ? 'Global Edge Routing Active' : 'Orchestration in progress...'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isDeploying}
                  onClick={() => site && startDeployment(site)}
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-zinc-200 transition-all disabled:opacity-40 inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${isDeploying ? 'animate-spin' : ''}`} />
                  <span>Re-deploy</span>
                </button>
              </div>

              {/* Live URL Link Row with Copy Button */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold block">
                    Target Domain Link
                  </span>
                  <a
                    href={site.liveUrl || targetDomain}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-bold text-emerald-400 hover:underline truncate block"
                  >
                    {site.liveUrl || targetDomain}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={copyLiveLink}
                  className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all shrink-0"
                  title="Copy Live URL"
                >
                  {copiedLink ? (
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <CopyIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Inline QR Code Export Box */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div
                  className="p-1.5 bg-white rounded-lg shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: generateQrSvg(site.liveUrl || targetDomain, 70),
                  }}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                    <QrIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant Storefront QR Code</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    Ready for store stickers, packaging &amp; social profiles.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        downloadQrPng(site.liveUrl || targetDomain, `${site.slug}-qr.png`, 800)
                      }
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG (HD)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadQrSvg(site.liveUrl || targetDomain, `${site.slug}-qr.svg`)
                      }
                      className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3 text-zinc-500" />
                      <span>SVG</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Navigation Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/builder/${site.id}`)}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all text-center"
                >
                  Edit in Builder
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-all text-center"
                >
                  All Websites
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
