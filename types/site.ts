export type SiteType = 'ecommerce' | 'portfolio' | 'single_product';

export type SiteStatus = 'draft' | 'published' | 'deploying' | 'live' | 'failed';

export interface BannerSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: string;
  currency?: string;
  description: string;
  imageUrl: string;
  badge?: string; // e.g., 'Best Seller', 'New Arrival', 'Sale'
  inStock?: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags?: string[];
  link?: string;
}

export interface PortfolioSkill {
  id: string;
  name: string;
  level?: string; // e.g. 'Advanced', 'Expert' or percentage
  category?: string;
}

export interface SingleProductDetails {
  productName: string;
  tagline: string;
  regularPrice: string;
  salePrice: string;
  currency: string;
  description: string;
  images: string[];
  features: string[];
  specifications: Array<{ label: string; value: string }>;
  reviews?: Array<{ reviewerName: string; rating: number; comment: string }>;
  guaranteeText?: string;
}

export interface DeploymentLogEntry {
  step: 'github' | 'vercel' | 'cloudflare' | 'poll' | 'general';
  status: 'pending' | 'success' | 'failed' | 'in_progress';
  message: string;
  timestamp: string;
  details?: any;
}

export interface TrustBadgeItem {
  id: string;
  icon: 'truck' | 'shield' | 'clock' | 'refresh' | 'star' | 'heart';
  title: string;
  subtitle: string;
}

export interface ReviewItem {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  location?: string;
  verifiedBuyer?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteData {
  id: string;
  name: string;
  slug: string;
  type: SiteType;
  status: SiteStatus;
  whatsappNumber: string; // e.g. '919876543210' without '+'
  defaultWhatsappMessage?: string;
  logoUrl?: string;
  themeColor: string; // hex e.g. '#2563eb'
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Outfit' | 'Roboto' | 'Poppins';
  
  // Header customization
  headerCtaText?: string;

  // Announcement Ticker
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementBgColor?: string;
  announcementTextColor?: string;

  // Banner slider
  bannerSlider: BannerSlide[];
  sliderAutoRotateSeconds?: number;
  
  // E-commerce specific
  products?: ProductItem[];
  
  // Single product specific
  singleProduct?: SingleProductDetails;
  
  // Portfolio specific
  portfolioAbout?: string;
  portfolioSkills?: PortfolioSkill[];
  portfolioProjects?: PortfolioProject[];
  portfolioRoleTitle?: string;
  portfolioAvatarUrl?: string;

  // Trust Badges
  trustBadgesEnabled?: boolean;
  trustBadges?: TrustBadgeItem[];

  // Reviews & Testimonials
  reviewsEnabled?: boolean;
  reviewsTitle?: string;
  reviewsSubtitle?: string;
  reviews?: ReviewItem[];

  // FAQ
  faqEnabled?: boolean;
  faqTitle?: string;
  faqs?: FaqItem[];

  // About Us / Brand Story
  aboutEnabled?: boolean;
  aboutTitle?: string;
  aboutText?: string;
  aboutImageUrl?: string;

  // Footer & Social
  footerBlurb?: string;
  footerCopyright?: string;
  footerInstagramUrl?: string;
  footerAddress?: string;
  footerEmail?: string;
  
  // Deployment metadata
  liveUrl?: string; // e.g. 'https://myshop.dominal.in'
  githubRepoUrl?: string;
  vercelProjectId?: string;
  vercelDeploymentId?: string;
  cloudflareDnsId?: string;
  deploymentLogs?: DeploymentLogEntry[];
  lastDeployedAt?: string;
  lastError?: string;
  
  createdAt: string;
  updatedAt: string;
}
