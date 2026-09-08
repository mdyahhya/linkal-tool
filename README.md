# 🚀 Linkal Website Builder — SaaS Platform

**Linkal** is a modern, high-performance website builder SaaS designed to create, customize, preview, and one-click publish framework-free, mobile-responsive customer websites with automated GitHub repo creation, Vercel deployment, and Cloudflare DNS provisioning under the `dominal.in` domain.

---

## ✨ Features

- ⚡ **Zero-Dependency Customer Sites**: Generated sites are compiled into a standalone, pure static `index.html` (with inline CSS + vanilla JS) for sub-second load times and zero hosting complexity.
- 💬 **WhatsApp Direct-to-Chat Conversion**: WhatsApp CTAs with prefilled dynamic messages for every product, service, or inquiry.
- 🎨 **3 High-Converting Templates**:
  1. **E-commerce / Shop**: Product catalog, badges, prices, and direct WhatsApp order links.
  2. **Single Product Showcase**: High-impact hero landing page, feature highlights, specs grid, and customer reviews.
  3. **Personal Portfolio**: Bio, skills breakdown, project showcase gallery, and direct WhatsApp hire button.
- 🛠️ **Live Interactive Builder**: Split-screen builder with instant responsive viewport toggle (Desktop, Tablet, Mobile) and live iframe preview.
- 🚀 **One-Click Automated Deployment Pipeline**:
  - **GitHub**: Automatic repository creation and file commit (`index.html`).
  - **Vercel**: Project provisioning and custom domain attachment.
  - **Cloudflare**: CNAME DNS record setup (`{slug}.dominal.in` ➔ `cname.vercel-dns.com` with Proxy OFF).
  - **Live Verification**: Automated status checks with real-time log streaming and retry capability.
- 🔐 **Secure Platform Owner Dashboard**: Protected by JWT session cookies with site metrics, filtering, live links, and full site management.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Security**: JWT session cookie authentication (`jose`)
- **APIs Integrated**: GitHub REST API, Vercel REST API, Cloudflare REST API v4

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/mdyahhya/linkal-tool.git
cd linkal-tool
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your configuration:

```env
# Platform Owner Credentials
ADMIN_EMAIL=admin@linkal.in
ADMIN_PASSWORD=linkal123
AUTH_SECRET=your-random-secret-at-least-32-chars

# GitHub REST API
GITHUB_TOKEN=ghp_yourPersonalAccessTokenWithRepoScope
GITHUB_OWNER=your-github-username-or-org

# Vercel REST API
VERCEL_TOKEN=your_vercel_bearer_token
VERCEL_TEAM_ID=

# Cloudflare REST API
CLOUDFLARE_API_TOKEN=your_cloudflare_scoped_token
CLOUDFLARE_ZONE_ID=your_zone_id_for_dominal_in
```

> **Note**: If API tokens are not provided, the platform automatically runs the deployment in **Development Simulation Mode**, letting you preview and test the complete end-to-end workflow without live cloud credentials!

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- Login credentials:
  - **Email**: `admin@linkal.in`
  - **Password**: `linkal123`

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Login, logout & session verification
│   │   └── sites/         # Site CRUD, preview, export & publish endpoints
│   ├── builder/[id]/      # Split-screen visual site editor & live iframe preview
│   ├── dashboard/         # Platform owner management console & deployment modal
│   └── login/             # Clean, modern authentication screen
├── lib/
│   ├── auth.ts            # JWT cookie session handling
│   ├── generator.ts       # Zero-dependency static HTML/CSS/JS compiler
│   ├── storage.ts         # Persistent data storage layer & default demo seeds
│   └── deployment/
│       ├── github.ts      # GitHub repo creation & contents commit API
│       ├── vercel.ts      # Vercel project creation, custom domain & deploy API
│       ├── cloudflare.ts  # Cloudflare CNAME DNS record creation & verification
│       └── pipeline.ts    # Deployment pipeline orchestrator & logger
├── types/
│   └── site.ts            # TypeScript interfaces & domain models
└── data/                  # Persistent site records (sites.json)
```

---

## 📄 License

MIT © Linkal
