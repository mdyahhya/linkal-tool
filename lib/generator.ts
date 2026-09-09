import { SiteData } from '@/types/site';

function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTrustBadgeIconSvg(icon?: string): string {
  switch (icon) {
    case 'truck':
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>';
    case 'clock':
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    case 'refresh':
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>';
    case 'star':
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    case 'heart':
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
    case 'shield':
    default:
      return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  }
}

function renderTrustBadgesHtml(site: SiteData): string {
  if (site.trustBadgesEnabled === false) return '';
  const badges = (site.trustBadges && site.trustBadges.length > 0)
    ? site.trustBadges
    : [
        { id: 'tb-1', icon: 'shield' as const, title: '100% Authentic', subtitle: 'Curated Premium Selection' },
        { id: 'tb-2', icon: 'truck' as const, title: 'Fast Doorstep Shipping', subtitle: 'Safe & Express Transit' },
        { id: 'tb-3', icon: 'clock' as const, title: 'WhatsApp Direct Support', subtitle: 'Instant Seller Communication' },
        { id: 'tb-4', icon: 'refresh' as const, title: 'Easy Exchanges', subtitle: 'Hassle-Free Guarantee' },
      ];

  return `
    <section class="features-bar">
      <div class="container features-grid">
        ${badges.map(b => `
          <div class="feature-item">
            <span class="feature-icon">${getTrustBadgeIconSvg(b.icon)}</span>
            <div><strong>${escapeHtml(b.title)}</strong><p>${escapeHtml(b.subtitle)}</p></div>
          </div>
        `).join('\n')}
      </div>
    </section>
  `;
}

function renderReviewsHtml(site: SiteData): string {
  if (site.reviewsEnabled === false) return '';
  const reviews = (site.reviews && site.reviews.length > 0)
    ? site.reviews
    : (site.type === 'portfolio' ? [
        { id: 'r-1', reviewerName: 'Arjun Mehta', rating: 5, comment: 'Incredible design sense and attention to detail. Delivered our project ahead of schedule with flawless precision.', location: 'Founder, NextWave' },
        { id: 'r-2', reviewerName: 'Pooja Sharma', rating: 5, comment: 'Transformed our brand identity completely. Seamless communication on WhatsApp made everything effortless.', location: 'Product Lead, Studio X' },
      ] : [
        { id: 'r-1', reviewerName: 'Rohan Deshmukh', rating: 5, comment: 'Super fast ordering through WhatsApp! The item quality exceeded expectations and arrived in 2 days.', location: 'Verified Buyer, Mumbai' },
        { id: 'r-2', reviewerName: 'Sneha Roy', rating: 5, comment: 'Genuine products, responsive seller, and great packaging. 10/10 recommend shopping here!', location: 'Verified Buyer, Bangalore' },
        { id: 'r-3', reviewerName: 'Vikram Singh', rating: 5, comment: 'Direct contact with the merchant made sizing questions so simple. Will definitely purchase again.', location: 'Verified Buyer, Delhi' },
      ]);

  const title = escapeHtml(site.reviewsTitle || 'Customer Reviews & Feedback');
  const subtitle = escapeHtml(site.reviewsSubtitle || 'Trusted by customers across India with verified 5-star experiences.');

  return `
    <section class="section reviews-section" id="reviews">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">${subtitle}</p>
        </div>
        <div class="reviews-grid">
          ${reviews.map(r => `
            <div class="review-card">
              <div class="stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(Math.max(0, 5 - (r.rating || 5)))}</div>
              <p class="review-comment">"${escapeHtml(r.comment)}"</p>
              <div class="reviewer-meta">
                <span class="reviewer-name">${escapeHtml(r.reviewerName)}</span>
                ${r.location ? `<span class="reviewer-location">${escapeHtml(r.location)}</span>` : ''}
              </div>
            </div>
          `).join('\n')}
        </div>
      </div>
    </section>
  `;
}

function renderFaqHtml(site: SiteData): string {
  if (site.faqEnabled === false) return '';
  const faqs = (site.faqs && site.faqs.length > 0)
    ? site.faqs
    : [
        { id: 'f-1', question: 'How do I place an order?', answer: 'Simply click "Order on WhatsApp" on any product. A pre-filled order message with the product name and price will automatically open in your WhatsApp, where you can finalize shipping details directly with us.' },
        { id: 'f-2', question: 'What payment options do you support?', answer: 'We support UPI (Google Pay, PhonePe, Paytm), Bank Transfers, and Cash on Delivery (COD) in eligible pincodes across India.' },
        { id: 'f-3', question: 'How long does delivery take?', answer: 'Orders are dispatched within 24 hours. Metro deliveries arrive in 2-3 business days, and all-India express delivery typically takes 3-5 business days with full tracking.' },
        { id: 'f-4', question: 'What is your exchange and return policy?', answer: 'We provide a 7-day hassle-free replacement or exchange if an item is damaged or sizing needs adjustment. Just message us on WhatsApp with a photo.' },
      ];

  const title = escapeHtml(site.faqTitle || 'Frequently Asked Questions');

  return `
    <section class="section faq-section" id="faq">
      <div class="container max-w-3xl">
        <div class="section-header">
          <h2 class="section-title">${title}</h2>
          <p class="section-subtitle">Everything you need to know about ordering, delivery, and customer care.</p>
        </div>
        <div class="faq-accordion">
          ${faqs.map((f, i) => `
            <div class="faq-item ${i === 0 ? 'active' : ''}">
              <button class="faq-question" type="button" aria-expanded="${i === 0}">
                <span>${escapeHtml(f.question)}</span>
                <span class="faq-icon">${i === 0 ? '−' : '+'}</span>
              </button>
              <div class="faq-answer">
                <p>${escapeHtml(f.answer)}</p>
              </div>
            </div>
          `).join('\n')}
        </div>
      </div>
    </section>
  `;
}

function renderAboutStoryHtml(site: SiteData): string {
  if (!site.aboutEnabled || (!site.aboutText && !site.aboutTitle)) return '';
  const title = escapeHtml(site.aboutTitle || `About ${site.name}`);
  const text = escapeHtml(site.aboutText || '');

  return `
    <section class="section story-section" id="story">
      <div class="container">
        <div class="story-grid ${site.aboutImageUrl ? 'has-image' : 'text-only'}">
          ${site.aboutImageUrl ? `
            <div class="story-image-wrap">
              <img src="${escapeHtml(site.aboutImageUrl)}" alt="${title}" loading="lazy" />
            </div>
          ` : ''}
          <div class="story-content">
            <h2 class="section-title">${title}</h2>
            <div class="story-text">
              ${text.split('\n\n').map(p => `<p>${p}</p>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function generateStaticHtml(site: SiteData): string {
  const phone = cleanPhone(site.whatsappNumber);
  const themeColor = site.themeColor || '#2563eb';
  const fontFamily = site.fontFamily || 'Inter';
  const siteTitle = escapeHtml(site.name || 'My Website');
  const rotateSec = site.sliderAutoRotateSeconds || 4;

  const slides = (site.bannerSlider && site.bannerSlider.length > 0)
    ? site.bannerSlider
    : [
        {
          id: 'def-slide',
          imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&auto=format&fit=crop&q=80',
          title: site.name,
          subtitle: 'Welcome to our official website. Connect with us instantly on WhatsApp.',
          ctaText: 'Chat on WhatsApp'
        }
      ];

  // Helper to build WhatsApp URL
  const buildWaUrl = (message: string) => {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Header Logo / Brand
  const brandHtml = site.logoUrl
    ? `<img src="${escapeHtml(site.logoUrl)}" alt="${siteTitle}" class="brand-logo" /> <span class="brand-name">${siteTitle}</span>`
    : `<span class="brand-name">${siteTitle}</span>`;

  // Top Banner Slides HTML
  const slidesHtml = slides.map((slide, idx) => {
    const slideCtaText = slide.ctaText || 'Connect on WhatsApp';
    const slideMsg = site.defaultWhatsappMessage
      ? site.defaultWhatsappMessage.replace('{item}', slide.title || site.name)
      : `Hi, I saw your website "${site.name}" and want to inquire about ${slide.title || 'your services'}`;
    const slideWaUrl = buildWaUrl(slideMsg);

    return `
      <div class="carousel-slide ${idx === 0 ? 'active' : ''}" style="background-image: linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.5) 100%), url('${escapeHtml(slide.imageUrl)}');">
        <div class="slide-content">
          ${slide.title ? `<h2 class="slide-title">${escapeHtml(slide.title)}</h2>` : ''}
          ${slide.subtitle ? `<p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>` : ''}
          <a href="${slideWaUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.771.815 2.796.815 3.182 0 5.768-2.587 5.768-5.767.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.768c0 5.48-4.453 9.932-9.969 9.932-1.748 0-3.38-.456-4.807-1.252l-5.224 1.38 1.399-5.109c-.896-1.487-1.408-3.228-1.408-5.087 0-5.48 4.453-9.932 9.969-9.932 5.516 0 10.04 4.452 10.04 9.932z"/></svg>
            ${escapeHtml(slideCtaText)}
          </a>
        </div>
      </div>
    `;
  }).join('\n');

  const dotsHtml = slides.length > 1
    ? `<div class="carousel-dots">
        ${slides.map((_, i) => `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('')}
       </div>`
    : '';

  const arrowsHtml = slides.length > 1
    ? `<button class="carousel-arrow prev" aria-label="Previous Slide">&#10094;</button>
       <button class="carousel-arrow next" aria-label="Next Slide">&#10095;</button>`
    : '';

  // Template Body generation
  let templateContent = '';

  if (site.type === 'ecommerce') {
    const products = site.products || [];
    const productsCards = products.map(prod => {
      const prodMsg = `Hi ${site.name}, I would like to order "${prod.name}" priced at ${prod.currency || '₹'}${prod.price}!`;
      const prodWaUrl = buildWaUrl(prodMsg);

      return `
        <div class="product-card">
          <div class="product-img-wrap">
            <img src="${escapeHtml(prod.imageUrl)}" alt="${escapeHtml(prod.name)}" loading="lazy" />
            ${prod.badge ? `<span class="product-badge">${escapeHtml(prod.badge)}</span>` : ''}
          </div>
          <div class="product-body">
            <h3 class="product-title">${escapeHtml(prod.name)}</h3>
            <p class="product-desc">${escapeHtml(prod.description)}</p>
            <div class="product-footer">
              <div class="product-price">
                <span class="currency">${escapeHtml(prod.currency || '₹')}</span>
                <span class="amount">${escapeHtml(prod.price)}</span>
              </div>
              <a href="${prodWaUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.771.815 2.796.815 3.182 0 5.768-2.587 5.768-5.767.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.768c0 5.48-4.453 9.932-9.969 9.932-1.748 0-3.38-.456-4.807-1.252l-5.224 1.38 1.399-5.109c-.896-1.487-1.408-3.228-1.408-5.087 0-5.48 4.453-9.932 9.969-9.932 5.516 0 10.04 4.452 10.04 9.932z"/></svg>
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('\n');

    templateContent = `
      ${renderTrustBadgesHtml(site)}

      <section class="section products-section" id="products">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Featured Catalog</h2>
            <p class="section-subtitle">Click any product to chat directly with us on WhatsApp and place your order.</p>
          </div>
          <div class="products-grid">
            ${productsCards || '<p class="empty-state">No products added yet.</p>'}
          </div>
        </div>
      </section>

      ${renderAboutStoryHtml(site)}
      ${renderReviewsHtml(site)}
      ${renderFaqHtml(site)}
    `;
  } else if (site.type === 'portfolio') {
    const skills = site.portfolioSkills || [];
    const projects = site.portfolioProjects || [];

    const skillsHtml = skills.map(sk => `
      <div class="skill-tag">
        <span class="skill-name">${escapeHtml(sk.name)}</span>
        ${sk.level ? `<span class="skill-badge">${escapeHtml(sk.level)}</span>` : ''}
      </div>
    `).join('\n');

    const projectsHtml = projects.map(proj => {
      const projMsg = `Hi ${site.name}, I loved your project "${proj.title}" and would like to discuss a collaboration!`;
      const projWaUrl = buildWaUrl(projMsg);

      return `
        <div class="project-card">
          <div class="project-img-wrap">
            <img src="${escapeHtml(proj.imageUrl)}" alt="${escapeHtml(proj.title)}" loading="lazy" />
          </div>
          <div class="project-body">
            <h3 class="project-title">${escapeHtml(proj.title)}</h3>
            <p class="project-desc">${escapeHtml(proj.description)}</p>
            ${proj.tags && proj.tags.length > 0 ? `
              <div class="project-tags">
                ${proj.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
            <div class="project-footer">
              <a href="${projWaUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
                Discuss on WhatsApp
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('\n');

    templateContent = `
      <section class="section about-section" id="about">
        <div class="container about-grid">
          ${site.portfolioAvatarUrl ? `
            <div class="avatar-col">
              <img src="${escapeHtml(site.portfolioAvatarUrl)}" alt="${siteTitle}" class="profile-avatar" />
            </div>
          ` : ''}
          <div class="about-content">
            <span class="badge-role">${escapeHtml(site.portfolioRoleTitle || 'Professional Creator')}</span>
            <h2 class="about-heading">About Me</h2>
            <p class="about-text">${escapeHtml(site.portfolioAbout || 'Welcome to my official portfolio. Feel free to explore my work and reach out for new projects!')}</p>
            <div class="about-actions">
              <a href="${buildWaUrl(`Hi ${site.name}, let's discuss a new project!`)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.771.815 2.796.815 3.182 0 5.768-2.587 5.768-5.767.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.768c0 5.48-4.453 9.932-9.969 9.932-1.748 0-3.38-.456-4.807-1.252l-5.224 1.38 1.399-5.109c-.896-1.487-1.408-3.228-1.408-5.087 0-5.48 4.453-9.932 9.969-9.932 5.516 0 10.04 4.452 10.04 9.932z"/></svg>
                Hire Me on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      ${skills.length > 0 ? `
        <section class="section skills-section" id="skills">
          <div class="container">
            <h2 class="section-title">Skills & Specializations</h2>
            <div class="skills-wrap">
              ${skillsHtml}
            </div>
          </div>
        </section>
      ` : ''}

      <section class="section projects-section" id="projects">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Selected Projects</h2>
            <p class="section-subtitle">A showcase of recent work, client deliverables, and case studies.</p>
          </div>
          <div class="projects-grid">
            ${projectsHtml || '<p class="empty-state">No projects added yet.</p>'}
          </div>
        </div>
      </section>

      ${renderReviewsHtml(site)}
      ${renderFaqHtml(site)}
    `;
  } else if (site.type === 'single_product') {
    const sp = site.singleProduct || {
      productName: site.name,
      tagline: 'Premium Quality, Outstanding Performance',
      regularPrice: '4,999',
      salePrice: '2,999',
      currency: '₹',
      description: 'Handpicked craftsmanship with exceptional durability and modern design.',
      images: [slides[0]?.imageUrl || ''],
      features: ['Top-tier materials', '1-year warranty', 'Fast priority shipping'],
      specifications: [{ label: 'Condition', value: 'Brand New' }]
    };

    const spMsg = `Hi ${site.name}, I want to order the "${sp.productName}" for ${sp.currency}${sp.salePrice}!`;
    const spWaUrl = buildWaUrl(spMsg);

    templateContent = `
      <section class="section single-hero-section">
        <div class="container single-hero-grid">
          <div class="single-gallery">
            <div class="main-image-wrap">
              <img id="spMainImg" src="${escapeHtml(sp.images[0] || slides[0]?.imageUrl || '')}" alt="${escapeHtml(sp.productName)}" />
            </div>
            ${sp.images.length > 1 ? `
              <div class="thumb-strip">
                ${sp.images.map((img, i) => `
                  <button class="thumb-btn ${i === 0 ? 'active' : ''}" onclick="document.getElementById('spMainImg').src='${escapeHtml(img)}'; document.querySelectorAll('.thumb-btn').forEach(b=>b.classList.remove('active')); this.classList.add('active');">
                    <img src="${escapeHtml(img)}" alt="thumb" />
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="single-details">
            <span class="sale-pill">Limited Time Offer</span>
            <h1 class="single-title">${escapeHtml(sp.productName)}</h1>
            <p class="single-tagline">${escapeHtml(sp.tagline)}</p>

            <div class="single-pricing">
              <span class="sale-price">${escapeHtml(sp.currency)}${escapeHtml(sp.salePrice)}</span>
              ${sp.regularPrice ? `<span class="regular-price">${escapeHtml(sp.currency)}${escapeHtml(sp.regularPrice)}</span>` : ''}
              <span class="discount-pill">Special Deal</span>
            </div>

            <p class="single-desc">${escapeHtml(sp.description)}</p>

            <div class="single-cta-wrap">
              <a href="${spWaUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-xl pulse-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.771.815 2.796.815 3.182 0 5.768-2.587 5.768-5.767.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.768c0 5.48-4.453 9.932-9.969 9.932-1.748 0-3.38-.456-4.807-1.252l-5.224 1.38 1.399-5.109c-.896-1.487-1.408-3.228-1.408-5.087 0-5.48 4.453-9.932 9.969-9.932 5.516 0 10.04 4.452 10.04 9.932z"/></svg>
                Order Now on WhatsApp
              </a>
              <p class="assurance-note">🔒 Zero payment required now. Confirm details with seller on WhatsApp.</p>
            </div>

            ${sp.features && sp.features.length > 0 ? `
              <div class="features-checklist">
                <h3>Highlights & Features</h3>
                <ul>
                  ${sp.features.map(f => `<li><span class="chk">✓</span> ${escapeHtml(f)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      </section>

      ${renderTrustBadgesHtml(site)}

      ${sp.specifications && sp.specifications.length > 0 ? `
        <section class="section specs-section">
          <div class="container max-w-3xl">
            <h2 class="section-title">Technical Specifications</h2>
            <div class="specs-table-wrap">
              <table class="specs-table">
                <tbody>
                  ${sp.specifications.map(s => `
                    <tr>
                      <td class="spec-label">${escapeHtml(s.label)}</td>
                      <td class="spec-value">${escapeHtml(s.value)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ` : ''}

      ${renderAboutStoryHtml(site)}
      ${renderReviewsHtml(site)}
      ${renderFaqHtml(site)}
    `;
  }

  // Floating WhatsApp Button
  const defaultHelpMsg = site.defaultWhatsappMessage || `Hello ${site.name}, I have an inquiry!`;
  const floatingWaUrl = buildWaUrl(defaultHelpMsg);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${siteTitle}</title>
  <meta name="description" content="${siteTitle} — Instant WhatsApp ordering and customer support." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${themeColor};
      --primary-hover: ${themeColor}dd;
      --primary-light: ${themeColor}1a;
      --bg: #0f172a;
      --card-bg: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --font: '${fontFamily}', sans-serif;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { text-decoration: none; color: inherit; }
    img { max-width: 100%; height: auto; display: block; }
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    .max-w-3xl { max-width: 800px; }

    /* Header */
    .site-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 1rem 0;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
    }
    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      object-fit: cover;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      font-weight: 600;
      font-size: 0.95rem;
      border-radius: 9999px;
      transition: all 0.2s ease;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .btn-sm { padding: 0.45rem 0.9rem; font-size: 0.85rem; }
    .btn-lg { padding: 0.85rem 1.75rem; font-size: 1.05rem; }
    .btn-xl { padding: 1rem 2.2rem; font-size: 1.15rem; }
    .btn-primary {
      background-color: var(--primary);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    }
    .btn-primary:hover {
      background-color: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    }
    .btn-outline {
      border-color: var(--primary);
      color: var(--primary);
      background: transparent;
    }
    .btn-outline:hover {
      background: var(--primary);
      color: #fff;
    }
    .icon {
      width: 1.2rem;
      height: 1.2rem;
    }

    /* Banner Carousel */
    .carousel-container {
      position: relative;
      width: 100%;
      height: 480px;
      overflow: hidden;
      background: #020617;
    }
    @media (max-width: 768px) {
      .carousel-container { height: 380px; }
    }
    .carousel-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.7s ease, transform 0.7s ease;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 2rem 5%;
      transform: scale(1.03);
    }
    .carousel-slide.active {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
    }
    .slide-content {
      max-width: 650px;
      z-index: 2;
    }
    .slide-title {
      font-size: 2.75rem;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
      color: #ffffff;
    }
    @media (max-width: 768px) {
      .slide-title { font-size: 1.9rem; }
    }
    .slide-subtitle {
      font-size: 1.15rem;
      color: #e2e8f0;
      margin-bottom: 1.75rem;
      line-height: 1.6;
    }
    .carousel-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.6);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s;
    }
    .carousel-arrow:hover { background: rgba(15, 23, 42, 0.95); }
    .carousel-arrow.prev { left: 1rem; }
    .carousel-arrow.next { right: 1rem; }
    .carousel-dots {
      position: absolute;
      bottom: 1.25rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      z-index: 10;
    }
    .carousel-dot {
      width: 10px;
      height: 10px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.4);
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .carousel-dot.active {
      width: 28px;
      background: var(--primary);
    }

    /* Common Sections */
    .section {
      padding: 5rem 0;
    }
    .section-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .section-title {
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .section-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Features bar */
    .features-bar {
      background: #131d31;
      border-bottom: 1px solid var(--border);
      padding: 1.5rem 0;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      align-items: center;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .feature-icon { font-size: 1.8rem; }
    .feature-item strong { display: block; font-size: 0.95rem; }
    .feature-item p { font-size: 0.8rem; color: var(--text-muted); }

    /* E-commerce Catalog */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }
    .product-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5);
      border-color: var(--primary);
    }
    .product-img-wrap {
      position: relative;
      height: 240px;
      overflow: hidden;
      background: #090d16;
    }
    .product-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .product-card:hover .product-img-wrap img {
      transform: scale(1.05);
    }
    .product-badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: var(--primary);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .product-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .product-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .product-desc {
      color: var(--text-muted);
      font-size: 0.88rem;
      line-height: 1.5;
      margin-bottom: 1.25rem;
      flex-grow: 1;
    }
    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .product-price {
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
    }
    .product-price .currency { font-size: 0.9rem; font-weight: 600; color: var(--primary); }
    .product-price .amount { font-size: 1.35rem; font-weight: 800; }

    /* Single Product Shop */
    .single-hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5rem;
      align-items: start;
    }
    @media (max-width: 900px) {
      .single-hero-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
    .main-image-wrap {
      border-radius: 20px;
      overflow: hidden;
      background: var(--card-bg);
      border: 1px solid var(--border);
      height: 440px;
    }
    .main-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .thumb-strip {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    .thumb-btn {
      width: 76px;
      height: 76px;
      border-radius: 10px;
      overflow: hidden;
      border: 2px solid transparent;
      background: none;
      cursor: pointer;
      padding: 0;
    }
    .thumb-btn.active { border-color: var(--primary); }
    .thumb-btn img { width: 100%; height: 100%; object-fit: cover; }
    .sale-pill {
      display: inline-block;
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 700;
      font-size: 0.8rem;
      padding: 0.35rem 0.8rem;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
    }
    .single-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 0.5rem;
    }
    .single-tagline {
      font-size: 1.15rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .single-pricing {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .sale-price {
      font-size: 2.25rem;
      font-weight: 800;
      color: #fff;
    }
    .regular-price {
      font-size: 1.35rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }
    .discount-pill {
      background: #ef4444;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }
    .single-desc {
      color: #cbd5e1;
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 2rem;
    }
    .single-cta-wrap {
      margin-bottom: 2.5rem;
    }
    .pulse-btn {
      animation: gentle-pulse 2.5s infinite;
    }
    @keyframes gentle-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
      50% { box-shadow: 0 0 0 16px rgba(37, 99, 235, 0); }
    }
    .assurance-note {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 0.75rem;
    }
    .features-checklist h3 {
      font-size: 1.15rem;
      margin-bottom: 0.75rem;
    }
    .features-checklist ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .features-checklist li {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: #cbd5e1;
    }
    .chk {
      color: #10b981;
      font-weight: 800;
    }
    .specs-table-wrap {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    .specs-table {
      width: 100%;
      border-collapse: collapse;
    }
    .specs-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    .specs-table tr:last-child td { border-bottom: none; }
    .spec-label { color: var(--text-muted); font-weight: 600; width: 40%; }
    .spec-value { color: #fff; font-weight: 500; }
    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .review-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .stars { color: #f59e0b; margin-bottom: 0.5rem; font-size: 1.1rem; }
    .review-comment { color: #cbd5e1; font-style: italic; margin-bottom: 0.75rem; }
    .reviewer-name { font-weight: 600; font-size: 0.85rem; color: var(--text-muted); }

    /* Portfolio */
    .about-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 3.5rem;
      align-items: center;
    }
    @media (max-width: 768px) {
      .about-grid { grid-template-columns: 1fr; text-align: center; }
      .about-actions { justify-content: center; }
    }
    .profile-avatar {
      width: 250px;
      height: 250px;
      border-radius: 24px;
      object-fit: cover;
      border: 3px solid var(--primary);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
      margin: 0 auto;
    }
    .badge-role {
      display: inline-block;
      color: var(--primary);
      background: var(--primary-light);
      font-weight: 700;
      font-size: 0.85rem;
      padding: 0.35rem 0.8rem;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
    }
    .about-heading { font-size: 2.2rem; font-weight: 800; margin-bottom: 1rem; }
    .about-text { font-size: 1.1rem; color: #cbd5e1; line-height: 1.8; margin-bottom: 2rem; }
    .about-actions { display: flex; gap: 1rem; }
    .skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      max-width: 900px;
      margin: 0 auto;
    }
    .skill-tag {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 9999px;
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }
    .skill-badge {
      background: var(--primary-light);
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
    }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    .project-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease;
    }
    .project-card:hover { transform: translateY(-5px); border-color: var(--primary); }
    .project-img-wrap { height: 220px; overflow: hidden; }
    .project-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .project-body { padding: 1.5rem; display: flex; flex-direction: column; flex-grow: 1; }
    .project-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    .project-desc { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; flex-grow: 1; }
    .project-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }
    .tag { background: #0f172a; border: 1px solid var(--border); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px; color: #94a3b8; }

    /* Footer */
    .site-footer {
      border-top: 1px solid var(--border);
      background: #090d16;
      padding: 3rem 0;
      margin-top: 5rem;
    }
    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .footer-copy { color: var(--text-muted); font-size: 0.88rem; }

    /* Floating WhatsApp */
    .floating-wa {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 999;
      background: #25d366;
      color: #fff;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .floating-wa:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 30px rgba(37, 211, 102, 0.6);
    }
    .floating-wa svg {
      width: 32px;
      height: 32px;
    }

    /* Announcement Bar */
    .announcement-bar {
      padding: 0.55rem 1rem;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .announcement-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    /* FAQ Section */
    .faq-section {
      padding: 5rem 0;
    }
    .faq-accordion {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .faq-item {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .faq-item.active {
      border-color: var(--primary);
    }
    .faq-question {
      width: 100%;
      text-align: left;
      padding: 1.25rem 1.5rem;
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 1.05rem;
      font-weight: 700;
      font-family: var(--font);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }
    .faq-icon {
      font-size: 1.35rem;
      font-weight: 400;
      color: var(--primary);
      margin-left: 1rem;
      transition: transform 0.2s;
    }
    .faq-answer {
      display: none;
      padding: 0 1.5rem 1.25rem 1.5rem;
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }
    .faq-item.active .faq-answer {
      display: block;
    }

    /* Story Section */
    .story-section {
      padding: 4rem 0;
    }
    .story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }
    .story-grid.text-only {
      grid-template-columns: 1fr;
      max-width: 800px;
      margin: 0 auto;
    }
    @media (max-width: 768px) {
      .story-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
    .story-image-wrap {
      border-radius: 20px;
      overflow: hidden;
      height: 380px;
      border: 1px solid var(--border);
    }
    .story-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .story-text p {
      margin-bottom: 1rem;
      color: #cbd5e1;
      font-size: 1rem;
      line-height: 1.7;
    }

    /* Footer styling */
    .footer-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border);
    }
    .footer-blurb {
      max-width: 400px;
      color: var(--text-muted);
      font-size: 0.88rem;
    }
    .footer-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .footer-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      padding-top: 1.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .footer-address {
      font-size: 0.85rem;
    }
    .footer-email {
      color: var(--primary);
    }
  </style>
</head>
<body>

  <!-- Announcement Bar (Top) -->
  ${site.announcementEnabled !== false && (site.announcementText || '').trim() ? `
    <div class="announcement-bar" style="background: ${escapeHtml(site.announcementBgColor || themeColor)}; color: ${escapeHtml(site.announcementTextColor || '#ffffff')};">
      <div class="container announcement-inner">
        <span>${escapeHtml(site.announcementText || '')}</span>
      </div>
    </div>
  ` : ''}

  <!-- Sticky Header -->
  <header class="site-header">
    <div class="container header-inner">
      <a href="#" class="brand-wrap">
        ${brandHtml}
      </a>
      <a href="${floatingWaUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.771.815 2.796.815 3.182 0 5.768-2.587 5.768-5.767.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.768c0 5.48-4.453 9.932-9.969 9.932-1.748 0-3.38-.456-4.807-1.252l-5.224 1.38 1.399-5.109c-.896-1.487-1.408-3.228-1.408-5.087 0-5.48 4.453-9.932 9.969-9.932 5.516 0 10.04 4.452 10.04 9.932z"/></svg>
        ${escapeHtml(site.headerCtaText || 'WhatsApp Us')}
      </a>
    </div>
  </header>

  <!-- Banner Slider -->
  <div class="carousel-container" id="mainCarousel">
    ${slidesHtml}
    ${arrowsHtml}
    ${dotsHtml}
  </div>

  <!-- Dynamic Content -->
  ${templateContent}

  <!-- Footer -->
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-top">
        <div class="brand-wrap">
          ${brandHtml}
        </div>
        ${site.footerBlurb ? `<p class="footer-blurb">${escapeHtml(site.footerBlurb)}</p>` : ''}
        <div class="footer-actions">
          <a href="${floatingWaUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            Chat with Support
          </a>
          ${site.footerInstagramUrl ? `
            <a href="${escapeHtml(site.footerInstagramUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
              Instagram
            </a>
          ` : ''}
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">${escapeHtml(site.footerCopyright || `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved. Direct WhatsApp Commerce.`)}</p>
        ${site.footerAddress ? `<p class="footer-address">${escapeHtml(site.footerAddress)}</p>` : ''}
        ${site.footerEmail ? `<a href="mailto:${escapeHtml(site.footerEmail)}" class="footer-email">${escapeHtml(site.footerEmail)}</a>` : ''}
      </div>
    </div>
  </footer>

  <!-- Floating WhatsApp Action -->
  <a href="${floatingWaUrl}" target="_blank" rel="noopener noreferrer" class="floating-wa" title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.771.815 2.796.815 3.182 0 5.768-2.587 5.768-5.767.001-3.18-2.585-5.766-5.768-5.766zm9.969 5.768c0 5.48-4.453 9.932-9.969 9.932-1.748 0-3.38-.456-4.807-1.252l-5.224 1.38 1.399-5.109c-.896-1.487-1.408-3.228-1.408-5.087 0-5.48 4.453-9.932 9.969-9.932 5.516 0 10.04 4.452 10.04 9.932z"/></svg>
  </a>

  <!-- Interactive JavaScript -->
  <script>
    (function() {
      // FAQ Accordion Click Handler
      document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
          const item = button.closest('.faq-item');
          const wasActive = item.classList.contains('active');
          document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('active');
            const icon = i.querySelector('.faq-icon');
            if (icon) icon.textContent = '+';
          });
          if (!wasActive) {
            item.classList.add('active');
            const icon = item.querySelector('.faq-icon');
            if (icon) icon.textContent = '−';
          }
        });
      });
      const carousel = document.getElementById('mainCarousel');
      if (!carousel) return;

      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      const prevBtn = carousel.querySelector('.carousel-arrow.prev');
      const nextBtn = carousel.querySelector('.carousel-arrow.next');
      
      if (slides.length <= 1) return;

      let currentIndex = 0;
      let timer = null;
      const intervalMs = ${rotateSec * 1000};

      function showSlide(index) {
        slides.forEach((s, i) => {
          s.classList.toggle('active', i === index);
        });
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === index);
        });
        currentIndex = index;
      }

      function nextSlide() {
        showSlide((currentIndex + 1) % slides.length);
      }

      function prevSlide() {
        showSlide((currentIndex - 1 + slides.length) % slides.length);
      }

      function startAuto() {
        stopAuto();
        timer = setInterval(nextSlide, intervalMs);
      }

      function stopAuto() {
        if (timer) clearInterval(timer);
      }

      if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAuto(); });
      if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAuto(); });

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          showSlide(idx);
          startAuto();
        });
      });

      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);

      // Mobile Touch Swiping
      let touchStartX = 0;
      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carousel.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
          nextSlide();
          startAuto();
        } else if (touchEndX - touchStartX > 50) {
          prevSlide();
          startAuto();
        }
      }, { passive: true });

      startAuto();
    })();
  </script>
</body>
</html>`;
}
