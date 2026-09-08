import fs from 'fs';
import path from 'path';
import { SiteData } from '@/types/site';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'sites.json');

const INITIAL_SITES: SiteData[] = [
  {
    id: 'demo-shop',
    name: 'Aura Luxury Handbags',
    slug: 'aura-luxury',
    type: 'ecommerce',
    status: 'draft',
    whatsappNumber: '919876543210',
    defaultWhatsappMessage: 'Hi Aura Luxury, I am interested in ordering {item}!',
    logoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&auto=format&fit=crop&q=80',
    themeColor: '#059669', // Emerald
    fontFamily: 'Plus Jakarta Sans',
    sliderAutoRotateSeconds: 4,
    bannerSlider: [
      {
        id: 'slide-1',
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&auto=format&fit=crop&q=80',
        title: 'Autumn Elegance Collection',
        subtitle: 'Handcrafted genuine leather accessories designed for timeless everyday luxury.',
        ctaText: 'Shop New Arrivals'
      },
      {
        id: 'slide-2',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1600&auto=format&fit=crop&q=80',
        title: 'Limited Edition Silk Totes',
        subtitle: 'Direct WhatsApp checkout with priority doorstep express delivery across India.',
        ctaText: 'Explore Exclusive'
      }
    ],
    products: [
      {
        id: 'prod-1',
        name: 'The Classic Siena Leather Tote',
        price: '4,499',
        currency: '₹',
        description: 'Full-grain Italian style leather with gold-tone hardware and zippered laptop compartment.',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
        badge: 'Best Seller',
        inStock: true
      },
      {
        id: 'prod-2',
        name: 'Milano Crossbody Bag',
        price: '2,999',
        currency: '₹',
        description: 'Compact everyday companion with adjustable strap, magnetic clasp, and water-resistant lining.',
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
        badge: 'Trending',
        inStock: true
      },
      {
        id: 'prod-3',
        name: 'Verona Mini Clutch',
        price: '1,899',
        currency: '₹',
        description: 'Minimalist evening purse with detachable delicate chain strap and interior card slots.',
        imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop&q=80',
        badge: 'Sale',
        inStock: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-portfolio',
    name: 'Kabir Verma — Visual & Product Designer',
    slug: 'kabir-portfolio',
    type: 'portfolio',
    status: 'draft',
    whatsappNumber: '919876543210',
    defaultWhatsappMessage: 'Hi Kabir, I saw your portfolio and would love to collaborate on a design project!',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    themeColor: '#4f46e5', // Indigo
    fontFamily: 'Inter',
    portfolioRoleTitle: 'Senior Product Designer & Brand Strategist',
    portfolioAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    portfolioAbout: 'I design intuitive digital experiences and high-converting brand identities. Over the last 7 years, I have helped 40+ startups and established brands scale through thoughtful design and human-centric systems.',
    bannerSlider: [
      {
        id: 'p-slide-1',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80',
        title: 'Building Intuitive Digital Products',
        subtitle: 'From user research and design systems to production-ready interfaces.',
        ctaText: 'Hire Me on WhatsApp'
      }
    ],
    portfolioSkills: [
      { id: 'sk-1', name: 'UI/UX Design', level: 'Expert', category: 'Design' },
      { id: 'sk-2', name: 'Design Systems', level: 'Expert', category: 'Design' },
      { id: 'sk-3', name: 'Figma & Prototyping', level: 'Advanced', category: 'Tooling' },
      { id: 'sk-4', name: 'Mobile App Experience', level: 'Advanced', category: 'Product' },
      { id: 'sk-5', name: 'Brand Strategy', level: 'Intermediate', category: 'Branding' }
    ],
    portfolioProjects: [
      {
        id: 'proj-1',
        title: 'Finflow — Next-Gen Neobank App',
        description: 'End-to-end mobile design for a modern financial management app with 250k+ active users.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        tags: ['Fintech', 'Mobile UX', 'Design System']
      },
      {
        id: 'proj-2',
        title: 'Lumina Smart Home Ecosystem',
        description: 'Unified IoT control interface across iOS, Android, and smart home hub screens.',
        imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=80',
        tags: ['IoT', 'Hardware UI', 'Tablet']
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-single-product',
    name: 'SonicPro Ultra Noise Cancelling Headphones',
    slug: 'sonicpro-ultra',
    type: 'single_product',
    status: 'draft',
    whatsappNumber: '919876543210',
    defaultWhatsappMessage: 'Hi SonicPro Team, I want to place an order for the SonicPro Ultra!',
    logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    themeColor: '#ea580c', // Orange
    fontFamily: 'Outfit',
    bannerSlider: [
      {
        id: 'sp-slide-1',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
        title: 'Hear Nothing Else.',
        subtitle: 'Studio-grade acoustic precision with 40-hour ultra battery life and hybrid active noise cancellation.',
        ctaText: 'Order via WhatsApp'
      }
    ],
    singleProduct: {
      productName: 'SonicPro Ultra Wireless Headset',
      tagline: 'Immersive Spatial Audio with Industry-Leading Active Noise Cancellation',
      regularPrice: '14,999',
      salePrice: '9,999',
      currency: '₹',
      description: 'Engineered for audio purists and daily commuters alike. The SonicPro Ultra delivers rich bass, crystal-clear treble, and whisper-quiet silence on demand with 6 beamforming microphones.',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
      ],
      features: [
        '40dB Hybrid Active Noise Cancellation with Transparency Mode',
        'Up to 40 Hours continuous playback on a single charge',
        '10-Minute Rapid Charge yields 5 hours of listening time',
        'Custom 45mm Titanium Audio Drivers for deep, distortion-free sound',
        'Dual device Bluetooth 5.3 multipoint connectivity'
      ],
      specifications: [
        { label: 'Weight', value: '250g ultra-lightweight' },
        { label: 'Battery Capacity', value: '800 mAh Li-ion' },
        { label: 'Charging Port', value: 'USB Type-C Fast Charge' },
        { label: 'Connectivity', value: 'Bluetooth 5.3 & 3.5mm Aux' },
        { label: 'Warranty', value: '1 Year Brand Replacement Warranty' }
      ],
      reviews: [
        { reviewerName: 'Rohit Sharma', rating: 5, comment: 'Hands down the best headphones under 15k. Battery lasts forever and ANC is magical.' },
        { reviewerName: 'Pooja Nair', rating: 5, comment: 'Ordered directly on WhatsApp and arrived within 48 hours. Beautiful packaging!' }
      ],
      guaranteeText: '100% Original Brand Guarantee | 7-Day Replacement | Express Delivery'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SITES, null, 2), 'utf-8');
  }
}

export async function getAllSites(): Promise<SiteData[]> {
  try {
    ensureDataFile();
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading sites:', error);
    return INITIAL_SITES;
  }
}

export async function getSiteById(id: string): Promise<SiteData | null> {
  const sites = await getAllSites();
  return sites.find(s => s.id === id) || null;
}

export async function getSiteBySlug(slug: string): Promise<SiteData | null> {
  const sites = await getAllSites();
  return sites.find(s => s.slug === slug) || null;
}

export async function saveSite(site: SiteData): Promise<SiteData> {
  ensureDataFile();
  const sites = await getAllSites();
  const index = sites.findIndex(s => s.id === site.id);
  
  const updatedSite: SiteData = {
    ...site,
    updatedAt: new Date().toISOString()
  };
  
  if (index >= 0) {
    sites[index] = updatedSite;
  } else {
    sites.unshift(updatedSite);
  }
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(sites, null, 2), 'utf-8');
  return updatedSite;
}

export async function deleteSite(id: string): Promise<boolean> {
  ensureDataFile();
  const sites = await getAllSites();
  const filtered = sites.filter(s => s.id !== id);
  if (filtered.length === sites.length) return false;
  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}
