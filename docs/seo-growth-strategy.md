# QRSeva — SEO, Visibility & Growth Strategy

**Domain**: `qrseva.in`  
**Target Market**: Indian restaurants, cafés, cloud kitchens, bakeries  
**Goal**: Rank #1 for "QR ordering India" and related keywords, drive organic signups

---

## 1. Keyword Strategy

### 1.1 Primary Keywords (High Intent)

| Keyword | Monthly Search Volume (Est.) | Difficulty | Target Page |
|---------|:----------------------------:|:----------:|-------------|
| QR code menu for restaurant | 2,400 | Medium | Home |
| restaurant QR ordering system | 1,600 | Low-Medium | Home |
| digital menu for restaurant India | 1,900 | Medium | Features |
| restaurant management software India | 3,200 | High | Home |
| QR code food ordering system | 1,800 | Medium | Features |
| online ordering system for restaurants | 4,100 | High | Features |
| kitchen display system | 1,200 | Low | Features |

### 1.2 Long-Tail Keywords (Blog / SEO Pages)

| Keyword | Target Content |
|---------|----------------|
| how to create QR code menu for restaurant free | Blog post |
| best restaurant billing software India 2026 | Comparison page |
| restaurant management app without commission | Features page |
| QR code ordering system for small restaurants | Landing page |
| how to digitize restaurant menu India | Blog post |
| cloud kitchen management software | Features page |
| restaurant POS alternative India | Blog post |
| cafe billing software free trial | Pricing page |
| dine-in QR ordering without app download | Home |
| restaurant analytics and reporting tools | Features page |

### 1.3 Regional Language Keywords

| Language | Keyword | Transliteration |
|----------|---------|-----------------|
| Hindi | रेस्टोरेंट मेनू QR कोड | Restaurant menu QR code |
| Hindi | डिजिटल मेनू ऑर्डरिंग सिस्टम | Digital menu ordering system |
| Marathi | रेस्टॉरंट व्यवस्थापन सॉफ्टवेअर | Restaurant vyavasthapan software |
| Tamil | உணவகம் QR குறியீடு ஆர்டர் | Unavagam QR code order |
| Bengali | রেস্তোরাঁ ম্যানেজমেন্ট সফটওয়্যার | Restaurant management software |

Target these in blog posts and FAQs to capture regional organic traffic.

---

## 2. On-Page SEO

### 2.1 Page-Level Meta Tags

#### Home Page (`qrseva.in`)
```html
<title>QRSeva — India's Smartest QR Ordering & Restaurant Management Platform</title>
<meta name="description" content="QRSeva helps Indian restaurants go digital with QR code menus, online ordering, kitchen display, billing & analytics. No commissions, no app download. Starts ₹799/mo.">
<meta name="keywords" content="QR ordering, restaurant management, digital menu India, KDS, restaurant billing, QR code menu, online ordering system">
<link rel="canonical" href="https://qrseva.in">
```

#### Features Page (`qrseva.in/features`)
```html
<title>Features — QR Menu, KDS, Billing, Analytics | QRSeva</title>
<meta name="description" content="Digital QR menus, kitchen display system, automated billing, real-time analytics, combo deals & loyalty programs. All-in-one restaurant management for Indian SMBs.">
```

#### Pricing Page (`qrseva.in/pricing`)
```html
<title>Pricing — Starting ₹799/month | QRSeva Restaurant Platform</title>
<meta name="description" content="Affordable restaurant management plans. LITE ₹799/mo, PRIME ₹1299/mo, SUPER ₹1999/mo. No setup fees, no commissions, 14-day free trial.">
```

#### Blog Index (`qrseva.in/blog`)
```html
<title>QRSeva Blog — Restaurant Technology & Growth Tips for Indian Restaurants</title>
<meta name="description" content="Expert guides on restaurant technology, digital menus, QR ordering, GST billing, and growing your restaurant business in India.">
```

### 2.2 Heading Structure (Every Page)

```
<h1> — One per page, contains primary keyword
  <h2> — Major sections
    <h3> — Sub-sections
      <h4> — Details (if needed)
```

### 2.3 Image SEO

| Attribute | Rule |
|-----------|------|
| `alt` text | Descriptive, keyword-rich (e.g., `"QRSeva restaurant dashboard showing daily orders and revenue analytics"`) |
| File names | Lowercase, hyphenated (e.g., `qrseva-kitchen-display-system.webp`) |
| Format | WebP with JPEG fallback |
| Lazy loading | `loading="lazy"` on below-fold images |
| Compression | < 100KB per image, max 1920px width |

### 2.4 Internal Linking Strategy

```
Home → Features (each feature links deeper)
Home → Pricing (CTA on every page)
Features → Pricing (upgrade path)
Blog posts → Features (contextual links)
Blog posts → Pricing (CTA at end)
Every page → Free Trial CTA
Footer → All pages + Legal
```

---

## 3. Technical SEO

### 3.1 Core Web Vitals Targets

| Metric | Target | How |
|--------|--------|-----|
| **LCP** (Largest Contentful Paint) | < 2.5s | Preload hero image, server-side render above-fold |
| **FID** (First Input Delay) | < 100ms | Code-split JS, defer non-critical scripts |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Set explicit image dimensions, font-display: swap |
| **TTFB** (Time to First Byte) | < 200ms | Netlify CDN handles this |
| **INP** (Interaction to Next Paint) | < 200ms | Optimize event handlers, avoid long tasks |

### 3.2 Sitemap

Auto-generate and serve at `qrseva.in/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://qrseva.in/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://qrseva.in/features</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://qrseva.in/pricing</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://qrseva.in/contact</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://qrseva.in/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Blog posts dynamically added -->
</urlset>
```

### 3.3 Robots.txt

```txt
# qrseva.in/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /sales/

Sitemap: https://qrseva.in/sitemap.xml
```

### 3.4 Structured Data (JSON-LD)

#### Organization Schema (Home Page)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "QRSeva",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "India's smartest QR ordering and restaurant management platform",
  "url": "https://qrseva.in",
  "author": {
    "@type": "Organization",
    "name": "Socketix Labs",
    "url": "https://qrseva.in"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "799",
    "highPrice": "1999",
    "priceCurrency": "INR",
    "offerCount": "3"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  }
}
```

#### FAQ Schema (Pricing / Features Page)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does QRSeva charge commission on orders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. QRSeva charges a flat monthly subscription fee. We never take commissions on your orders."
      }
    },
    {
      "@type": "Question",
      "name": "Do my customers need to download an app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Customers simply scan a QR code and the menu opens directly in their phone browser. No app download required."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free trial?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Every restaurant gets a 14-day free trial with full access to the LITE plan features."
      }
    }
  ]
}
```

#### Breadcrumb Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://qrseva.in" },
    { "@type": "ListItem", "position": 2, "name": "Features", "item": "https://qrseva.in/features" }
  ]
}
```

### 3.5 Performance Optimizations

| Technique | Implementation |
|-----------|---------------|
| Code splitting | Vite automatic chunk splitting per route |
| Tree shaking | Only import used Firebase modules |
| Font optimization | `font-display: swap`, preload critical fonts |
| Image CDN | Use Netlify Image CDN or external (Cloudinary) |
| Prefetch | `<link rel="prefetch">` for next likely page |
| Gzip/Brotli | Netlify auto-compresses (Brotli by default) |

---

## 4. Open Graph & Social Media Meta Tags

### 4.1 Default Tags (All Pages)

```html
<!-- Open Graph -->
<meta property="og:site_name" content="QRSeva">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:image" content="https://qrseva.in/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@qrseva">
<meta name="twitter:image" content="https://qrseva.in/og-image.png">
```

### 4.2 OG Image Specifications

| Element | Spec |
|---------|------|
| Size | 1200 × 630 px |
| Format | PNG or JPEG |
| Content | QRSeva logo + tagline + visual of dashboard |
| Text | "India's Smartest QR Ordering Platform" |
| Branding | Maroon/amber gradient (#8B1A1A → #F5A623) |

Create page-specific OG images for:
- Home: Product overview
- Features: Feature grid visual
- Pricing: Plan comparison visual
- Blog posts: Post title + thumbnail

---

## 5. Content Marketing & Blog Strategy

### 5.1 Blog Categories

| Category | Purpose | Frequency |
|----------|---------|-----------|
| **Restaurant Tech** | SEO traffic for primary keywords | 2/month |
| **Guides & Tutorials** | How-to content, long-tail keywords | 2/month |
| **Case Studies** | Social proof, conversion | 1/month |
| **Industry News** | Freshness signal, thought leadership | 1/month |
| **Product Updates** | Retain existing customers | As needed |

### 5.2 Suggested Blog Posts (First 3 Months)

#### Month 1 — Foundation
1. "How to Create a QR Code Menu for Your Restaurant (Step-by-Step Guide)"
2. "5 Reasons Indian Restaurants Should Switch to Digital Menus in 2026"
3. "QRSeva vs Zomato/Swiggy: Why You Don't Need to Pay 25% Commission"
4. "What is a Kitchen Display System? Complete Guide for Restaurant Owners"

#### Month 2 — Comparison & Authority
5. "Best Restaurant Management Software in India (2026 Comparison)"
6. "How QR Ordering Increases Average Order Value by 15-20%"
7. "GST Billing for Restaurants: Complete Guide with Free Templates"
8. "Case Study: How [Restaurant Name] Reduced Wait Times by 40% with QRSeva"

#### Month 3 — Long-tail + Regional
9. "Cloud Kitchen Management: The Complete Digital Toolkit"
10. "Restaurant Analytics: 7 Metrics Every Restaurant Owner Should Track"
11. "How Small Cafes in Pune Use QR Ordering to Compete with Chains"
12. "Setting Up Digital Menu in Hindi for Your Restaurant"

### 5.3 Blog Post SEO Template

```markdown
# [Primary Keyword in Title] — [Benefit/Hook]

**Meta Description**: [150-160 chars with primary keyword + CTA]

## Introduction (100-150 words)
- Hook with a stat or pain point
- State what the reader will learn

## [H2 with secondary keyword]
- Content with internal links
- Images with alt text

## [H2 with related keyword]
- Lists, tables, or step-by-step
- Embed a relevant QRSeva feature

## FAQ Section
- 3-5 questions with schema markup

## CTA Section
- "Ready to digitize your restaurant? Start your free trial →"
- Link to /pricing or /signup
```

---

## 6. Local SEO (Critical for India Market)

### 6.1 Google Business Profile

Create a GBP for "QRSeva — Restaurant Management Software":
- **Category**: Software Company, Technology Company
- **Address**: Socketix Labs office address
- **Phone**: Business phone
- **Website**: https://qrseva.in
- **Description**: Include primary keywords naturally
- **Photos**: Dashboard screenshots, team photos
- **Posts**: Weekly updates about features, blog posts

### 6.2 Business Listings (Indian Directories)

| Directory | Priority | URL |
|-----------|----------|-----|
| Google Business Profile | 🔴 Must | google.com/business |
| JustDial | 🔴 Must | justdial.com |
| IndiaMART | 🟡 Important | indiamart.com |
| Sulekha | 🟡 Important | sulekha.com |
| TradeIndia | 🟢 Nice | tradeindia.com |
| Clutch.co | 🟡 Important | clutch.co |
| G2 | 🟡 Important | g2.com |
| Capterra | 🟡 Important | capterra.com |
| Product Hunt | 🟡 Important | producthunt.com |
| LinkedIn Company Page | 🔴 Must | linkedin.com |

### 6.3 NAP Consistency

Ensure **Name, Address, Phone** is identical across all listings:
```
QRSeva (by Socketix Labs)
[Full Address]
[Phone Number]
https://qrseva.in
```

---

## 7. Virality & Growth Hacks

### 7.1 Built-In Viral Loops

| Loop | How It Works | Impact |
|------|-------------|--------|
| **"Powered by QRSeva"** | Shown on every customer-facing bill and menu | Every order = brand impression |
| **QR Code Branding** | QRSeva logo watermark on generated QR codes (LITE plan) | Every table tent = free ad |
| **Customer Menu Footer** | Small "Create your digital menu → qrseva.in" link | Customers who are restaurant owners discover QRSeva |
| **Share Bill** | Customers can share their digital bill (with QRSeva branding) | WhatsApp sharing = organic reach |
| **Referral Program** | "Refer a restaurant, get 1 month free" | Word-of-mouth from existing users |

### 7.2 "Powered by QRSeva" Badge

Present on LITE + PRIME plans (removable on SUPER):

```
┌─────────────────────────────────┐
│                                 │
│   [Customer's Digital Bill]     │
│                                 │
│   ─────────────────────────     │
│   Powered by QRSeva             │
│   qrseva.in                     │
│   Free QR Menu for Restaurants  │
│                                 │
└─────────────────────────────────┘
```

Every order placed through QRSeva = **free brand impression** to the customer.

### 7.3 Restaurant Onboarding Kit (Physical)

For sales team to distribute:
- QR code table tent template (branded)
- "We accept QR orders" sticker for glass doors
- Menu digitization guide (printed one-pager)
- Owner testimonial card

### 7.4 Social Proof Widgets

| Type | Placement |
|------|-----------|
| "500+ restaurants trust QRSeva" | Home hero section |
| Restaurant logo carousel | Home, below hero |
| Star ratings from G2/Capterra | Pricing page |
| Video testimonial | Features page |
| "X orders processed today" counter | Home (live or estimated) |

### 7.5 WhatsApp Marketing (Organic)

| Tactic | Description |
|--------|-------------|
| Restaurant owner WhatsApp groups | Share helpful content, not ads |
| Status updates | Weekly feature tips with QRSeva branding |
| Quick reply template | "Check out our digital menu: [QR link]" for restaurants to share |
| Demo video (< 60sec) | Short WhatsApp-sized demo video |

---

## 8. Social Media Strategy

### 8.1 Platform Priority

| Platform | Priority | Content Type | Posting |
|----------|----------|-------------|---------|
| **Instagram** | 🔴 High | Reels, carousels, stories | 4-5/week |
| **YouTube** | 🔴 High | Tutorials, demos, testimonials | 1-2/week |
| **LinkedIn** | 🟡 Medium | Thought leadership, case studies | 2-3/week |
| **Twitter/X** | 🟢 Low | Product updates, industry news | 3-4/week |
| **Facebook** | 🟢 Low | Community group, share blog | 2-3/week |

### 8.2 Content Pillars

1. **Product demos** — "Watch how easy it is to set up your QR menu"
2. **Restaurant success stories** — "How [name] saved ₹15K/month"
3. **Industry tips** — "5 ways to increase your restaurant's average order value"
4. **Behind the scenes** — Team building QRSeva, feature development
5. **Memes / relatable content** — Restaurant owner pain points (comic format)

### 8.3 Instagram Reels Ideas

| # | Reel Concept | Hook |
|---|-------------|------|
| 1 | "Your restaurant without QR ordering vs with" | Before/after split screen |
| 2 | "Stop paying 25% commission to food apps" | Trending audio + text overlay |
| 3 | "Setup your digital menu in 5 minutes" | Speed tutorial |
| 4 | "3 features restaurant owners didn't know they needed" | List format |
| 5 | "Customer scans QR → order appears on KDS in real-time" | Screen recording |

### 8.4 YouTube Channel Structure

| Series | Format | Length |
|--------|--------|--------|
| QRSeva Tutorials | Screen recording + voiceover | 3-8 min |
| Restaurant Tech Explained | Animated explainer | 2-5 min |
| Customer Stories | Interview format | 5-10 min |
| Product Updates | Feature announcement | 1-3 min |
| Restaurant Growth Tips | Talking head + slides | 5-8 min |

---

## 9. Email Marketing (Drip Campaigns)

### 9.1 Signup Nurture Sequence

| Day | Email | Subject Line |
|-----|-------|-------------|
| 0 | Welcome | "Welcome to QRSeva! Here's your quick-start guide 🎉" |
| 1 | Setup guide | "Set up your QR menu in 3 easy steps" |
| 3 | Feature highlight | "Did you know? Your dashboard tracks daily revenue automatically" |
| 7 | Social proof | "500+ restaurants trust QRSeva — here's why" |
| 10 | Trial reminder | "4 days left on your free trial ⏰" |
| 13 | Last chance | "Your trial ends tomorrow — lock in ₹799/mo pricing" |
| 14 | Trial expired | "We saved your data — restart anytime" |

### 9.2 Monthly Newsletter

| Section | Content |
|---------|---------|
| New features | Product updates with screenshots |
| Tip of the month | One actionable restaurant tip |
| Customer spotlight | Success story from a QRSeva restaurant |
| Industry news | Relevant restaurant tech news |

---

## 10. Analytics & Tracking

### 10.1 Tools

| Tool | Purpose | Setup |
|------|---------|-------|
| **Google Analytics 4** | Traffic, conversions, behavior | GA4 tag on all pages |
| **Google Search Console** | Search performance, indexing | Verify via DNS TXT record |
| **Google Tag Manager** | Event tracking | Container on all pages |
| **Hotjar / Microsoft Clarity** | Heatmaps, session recordings | Free tier for landing page |
| **Ahrefs / SEMrush** | Keyword tracking, backlinks | Track top 50 keywords |

### 10.2 Conversion Goals (GA4)

| # | Event Name | Trigger |
|---|-----------|---------|
| 1 | `signup_started` | Click "Get Started" / "Free Trial" |
| 2 | `signup_completed` | Registration form submitted |
| 3 | `demo_started` | Demo page loaded |
| 4 | `pricing_viewed` | Pricing page scroll > 50% |
| 5 | `contact_submitted` | Contact form submitted |
| 6 | `blog_cta_clicked` | CTA clicked from blog post |

### 10.3 UTM Parameter Strategy

```
https://qrseva.in/?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}
```

| Source | Medium | Campaign | Usage |
|--------|--------|----------|-------|
| google | cpc | restaurant_software | Google Ads |
| instagram | social | feature_reel_jan26 | Instagram Reels |
| whatsapp | referral | owner_share | Owner sharing |
| blog | organic | qr_menu_guide | Blog CTA |
| email | newsletter | jan26_newsletter | Monthly email |
| g2 | listing | software_review | G2 profile |

---

## 11. SEO Implementation Checklist

### Technical SEO
- [ ] sitemap.xml auto-generated and submitted to Google Search Console
- [ ] robots.txt configured (block /admin, /sales, /api)
- [ ] Canonical URLs on all pages
- [ ] Structured data (Organization, FAQ, Breadcrumb, SoftwareApplication)
- [ ] 404 page with search + popular links
- [ ] 301 redirects for any URL changes
- [ ] Hreflang tags for multi-language pages (if applicable)
- [ ] Page speed > 90 on Google PageSpeed Insights
- [ ] Mobile-friendly test passing
- [ ] HTTPS on all subdomains

### On-Page SEO
- [ ] Unique title tags on all pages (< 60 chars)
- [ ] Meta descriptions on all pages (< 160 chars)
- [ ] H1 on every page with primary keyword
- [ ] Image alt text on all images
- [ ] Internal linking between all pages
- [ ] External links to authoritative sources (in blog posts)
- [ ] URL structure: clean, lowercase, hyphenated

### Content
- [ ] Blog set up at qrseva.in/blog
- [ ] First 4 blog posts published
- [ ] FAQ page with schema markup
- [ ] Comparison page ("QRSeva vs [competitor]")
- [ ] Case study page (at least 1)

### Off-Page SEO
- [ ] Google Business Profile created and verified
- [ ] Listed on G2, Capterra, Product Hunt
- [ ] Listed on JustDial, IndiaMART
- [ ] LinkedIn company page active
- [ ] YouTube channel with 3+ videos
- [ ] Instagram account with 10+ posts

### Analytics
- [ ] GA4 installed on all pages
- [ ] Google Search Console verified
- [ ] Conversion events configured
- [ ] UTM parameters documented for team

---

> **Related Docs**:
> - [Phase 8 — Landing Page & Public Website](./phase-8-landing-page.md)
> - [Deployment Documentation](./deployment.md)
