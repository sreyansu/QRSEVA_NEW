# Phase 8 — Landing Page & Public Website

---

## 1. Overview

The QRSeva landing page is the public-facing marketing website. It introduces the product, showcases pricing, and provides contact/legal information.

**URL**: `qrseva.in`  
**Framework**: Next.js (same project, public routes)  
**Purpose**: Lead generation, pricing transparency, brand trust

---

## 2. Site Map

```
qrseva.in/
├── /                       # Home (Hero, Features, CTA)
├── /features               # Detailed feature list
├── /pricing                # Plan comparison + pricing
├── /contact                # Contact form + info
├── /terms                  # Terms & Conditions
├── /privacy                # Privacy Policy
└── /refund                 # Refund Policy
```

---

## 3. Page Designs

### 3.1 Home Page

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR                                                       │
│  [QRSeva Logo]  Features  Pricing  Contact    [Get Started →]│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  HERO SECTION (Full viewport, gradient bg)                    │
│  ──────────────────────────────────────────                   │
│                                                               │
│  Simplify Your Restaurant.                                    │
│  QR Ordering. Digital Bills.                                  │
│  Zero Commissions.                                            │
│                                                               │
│  India's most affordable restaurant management                │
│  platform — starting at just ₹799/month.                      │
│                                                               │
│  [Start Free Trial]     [See Pricing →]                       │
│                                                               │
│  [Hero illustration / product mockup]                         │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  HOW IT WORKS                                                 │
│  ──────────────                                               │
│                                                               │
│  ① Scan QR  →  ② Browse Menu  →  ③ Place Order  →  ④ Enjoy! │
│                                                               │
│  [Animated step illustration]                                 │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  KEY FEATURES                                                 │
│  ──────────────                                               │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 📱 QR    │ │ 🍳 KDS   │ │ 📊 Reports│ │ 💳 Billing│       │
│  │ Ordering │ │ Display  │ │ Analytics│ │ Digital  │        │
│  │          │ │          │ │          │ │          │        │
│  │ Takeaway,│ │ Live     │ │ Daily &  │ │ Basic to │        │
│  │ Delivery,│ │ kitchen  │ │ monthly  │ │ full     │        │
│  │ Dine-in  │ │ updates  │ │ insights │ │ bills    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 🪑 Table │ │ 🎁 Combos │ │ ⭐ Loyalty│ │ 🔒 Secure│       │
│  │ Mgt      │ │ & Deals  │ │ Program  │ │ & Fast   │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  WHY QRSEVA?                                                  │
│  ──────────────                                               │
│                                                               │
│  ✅ No commissions — flat monthly fee                         │
│  ✅ No app download for customers                             │
│  ✅ Works on any smartphone                                   │
│  ✅ Set up in under 30 minutes                                │
│  ✅ Indian restaurants, Indian pricing                         │
│  ✅ No hardware required                                      │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  PRICING PREVIEW                                              │
│  ──────────────                                               │
│                                                               │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐               │
│  │  LITE    │  │   PRIME ⭐   │  │  SUPER   │               │
│  │ ₹799/mo  │  │  ₹1,399/mo   │  │ ₹1,999/mo│               │
│  │          │  │              │  │          │               │
│  │ QR Menu  │  │ + KDS        │  │ + Dine-in│               │
│  │ Orders   │  │ + Reports    │  │ + Bills  │               │
│  │ Basic    │  │ + Basic Bill │  │ + Combos │               │
│  │          │  │              │  │ + Loyalty│               │
│  │[Choose →]│  │ [Choose → ]  │  │[Choose →]│               │
│  └──────────┘  └──────────────┘  └──────────┘               │
│                                                               │
│                    [View Full Pricing →]                       │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  TRUSTED BY RESTAURANTS ACROSS INDIA                          │
│  (Placeholder for testimonials / restaurant count)            │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  CTA SECTION                                                  │
│  ──────────                                                   │
│  Ready to transform your restaurant?                          │
│  Get started with QRSeva today.                               │
│                                                               │
│  [Contact Sales]        [WhatsApp Us]                         │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                       │
│  ┌─────────────┬─────────────┬─────────────┬────────────────┐│
│  │ QRSeva      │ Product     │ Company     │ Legal          ││
│  │ Restaurant  │ Features    │ About       │ Terms          ││
│  │ Solutions   │ Pricing     │ Contact     │ Privacy        ││
│  │             │             │             │ Refund         ││
│  │ A product of│             │             │                ││
│  │ Socketix    │             │             │                ││
│  │ Labs Pvt Ltd│             │             │                ││
│  └─────────────┴─────────────┴─────────────┴────────────────┘│
│  © 2026 Socketix Labs Pvt. Ltd. All rights reserved.         │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Pricing Page

**Route**: `/pricing`

Full comparison table with all features across plans:

| Feature | LITE ₹799 | PRIME ₹1,399 | SUPER ₹1,999 |
|---------|-----------|-------------|-------------|
| QR Menu | ✅ | ✅ | ✅ |
| Takeaway Orders | ✅ | ✅ | ✅ |
| Delivery Orders | ✅ | ✅ | ✅ |
| Menu Items | Up to 50 | Unlimited | Unlimited |
| Manual Payments | ✅ | ✅ | ✅ |
| KDS | ❌ | ✅ | ✅ |
| Order Tokens | ❌ | ✅ | ✅ |
| Live Order Status | ❌ | ✅ | ✅ |
| Item Availability | ❌ | ✅ | ✅ |
| Delivery Charge | ❌ | ✅ | ✅ |
| Minimum Order | ❌ | ✅ | ✅ |
| Daily Reports | ❌ | ✅ | ✅ |
| Basic Digital Bill | ❌ | ✅ | ✅ |
| Dine-in QR | ❌ | ❌ | ✅ |
| Table Management | ❌ | ❌ | ✅ |
| Full Restaurant Bill | ❌ | ❌ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ |
| Combo Deals | ❌ | ❌ | ✅ |
| Loyalty Program | ❌ | ❌ | ✅ |

**Multi-month discounts**: 10% (3mo), 20% (6mo), 30% (12mo)

**Add-on**: Online Payment Gateway — ₹299/month

### 3.3 Contact Page

**Route**: `/contact`

- Contact form (Name, Email, Phone, Restaurant Name, Message)
- Email: qrsevatechnologiespvtltd@gmail.com
- WhatsApp link
- Social media links (future)

### 3.4 Legal Pages

**Route**: `/terms`, `/privacy`, `/refund`

Each page contains legally compliant content covering:

#### Terms & Conditions
- Service description
- Subscription terms
- Payment terms
- Usage restrictions
- Limitation of liability
- Termination clause
- Governing law (India)

#### Privacy Policy
- Data collected (restaurant info, order data)
- Data usage
- Data sharing (no third-party sharing)
- Data retention
- Customer data handling (guest orders)
- Cookie policy
- DPDP Act 2023 compliance

#### Refund Policy
- Subscription refund window (7 days for first subscription)
- No refund for partial months
- Downgrade policy
- Cancellation process
- Contact for disputes

---

## 4. SEO Strategy

```html
<!-- Home page head -->
<head>
  <title>QRSeva — QR Ordering & Restaurant Management | Starting ₹799/mo</title>
  <meta name="description" content="QRSeva - India's most affordable QR-based restaurant ordering platform. Digital menus, kitchen display, billing & analytics. No commissions, no app download.">
  <meta name="keywords" content="QR ordering, restaurant management, digital menu, KDS, restaurant billing, India">
  <link rel="canonical" href="https://qrseva.in">
  
  <!-- Open Graph -->
  <meta property="og:title" content="QRSeva — Restaurant Solutions">
  <meta property="og:description" content="Simplify your restaurant with QR-based ordering, digital billing, and analytics.">
  <meta property="og:image" content="https://qrseva.in/og-image.png">
  <meta property="og:type" content="website">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "QRSeva",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "799",
      "highPrice": "1999",
      "priceCurrency": "INR"
    }
  }
  </script>
</head>
```

---

## 5. Design Specifications

| Element | Specification |
|---------|--------------|
| Hero gradient | `linear-gradient(135deg, #8B1A1A 0%, #B22222 50%, #F5A623 100%)` |
| CTA buttons | Maroon background `#8B1A1A`, white text, rounded corners |
| Feature cards | White bg, subtle shadow, maroon icon accent |
| Pricing cards | Bordered, active plan highlighted with amber glow |
| Typography | Inter font family (headings bold, body regular) |
| Animations | Fade-in on scroll, hover scale on cards |
| Mobile | Fully responsive, hamburger nav, stacked cards |

---

## 6. Self-Signup & Demo CTAs

### Primary CTA: "Get Started Free"
- Prominent button on hero, pricing, and footer
- Links to self-service registration page (Phase 2, Section 6)
- 14-day free trial on LITE plan

### Secondary CTA: "Try Demo"
- Button on hero section and features page
- Links to `demo.qrseva.in` (Phase 2, Section 7)
- No login required

### Referral CTA: "Refer a Restaurant"
- Section on landing page for existing customers
- Simple form: Restaurant name, owner phone, city
- Referred restaurant gets extended trial (21 days instead of 14)
- Referrer gets 1 month free on next renewal

---

## 7. Implementation Checklist

- [ ] Build landing page layout & navbar
- [ ] Design hero section with gradient + CTA
  - [ ] "Get Started Free" CTA → self-signup
  - [ ] "Try Demo" CTA → demo.qrseva.in
- [ ] Build "How it Works" section with animated steps
- [ ] Build feature showcase grid
- [ ] Build "Why QRSeva" benefits section
- [ ] Build pricing preview with plan cards
- [ ] Build full pricing comparison page
- [ ] Build contact page with form
- [ ] Build referral section ("Refer a Restaurant")
- [ ] Create legal pages (Terms, Privacy, Refund)
- [ ] Build footer with company info & links
- [ ] Implement SEO meta tags & structured data
- [ ] Add Open Graph tags for social sharing
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Performance optimization (Core Web Vitals)
- [ ] Set up Google Analytics (future)

---

> **Previous**: [← Phase 7 — Reports, Analytics & Add-ons](./phase-7-reports-analytics.md)  
> **Next**: [Phase 9 — Security, Testing & Deployment →](./phase-9-security-testing-deployment.md)
