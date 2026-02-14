# QRSeva — AI Agent Context & Memory Document

> **Purpose**: This document is the single source of truth for any AI coding agent (Cursor, Copilot, Gemini, Claude, etc.) working on the QRSeva project. Read this FIRST before writing any code. Follow every convention described here. Do NOT deviate from the established architecture.

---

## 🔴 CRITICAL RULES — READ FIRST

1. **Domain is `qrseva.in`** — NOT qrseva.com. All URLs, configs, and docs use `.in`.
2. **Modular monorepo** — Each app surface is a separate folder with its own `package.json` and Vite config. Do NOT merge apps into a single frontend.
3. **Firebase backend ONLY** — No PostgreSQL, no Supabase, no other databases. Firestore + Realtime Database + Cloud Functions.
4. **No commissions model** — QRSeva is a flat monthly subscription SaaS (₹799/₹1299/₹1999). Never implement any commission or per-order fee logic.
5. **Restaurant onboarding requires sales approval** — Self-signup creates a PENDING restaurant. Sales team must approve before the restaurant can log in.
6. **Customer ordering has NO login** — Customers scan QR, browse menu, order with just name + phone. No customer auth.
7. **Deploy frontend to Netlify, backend to Firebase** — NOT Firebase Hosting for frontend.
8. **Kitchen open/closed toggle** — Admin can close kitchen anytime. Customer menu shows "Kitchen Closed" banner. `placeOrder` validates `kitchenStatus.isOpen` before accepting orders.
9. **Indian market only** — Currency is INR (₹), phone format is Indian (+91, 10 digits starting with 6-9), GST compliance required.

---

## 📋 Project Overview

| Attribute | Value |
|-----------|-------|
| **Product** | QRSeva — QR-based restaurant ordering & management SaaS |
| **Company** | Socketix Labs |
| **Domain** | `qrseva.in` |
| **Target Market** | Indian restaurants, cafés, cloud kitchens, bakeries |
| **Revenue Model** | Monthly subscription (LITE / PRIME / SUPER) |
| **Frontend** | React + TypeScript + Vite (per app) |
| **Backend** | Firebase Cloud Functions (Node.js + TypeScript) |
| **Database** | Firestore (primary) + Realtime Database (live orders/KDS) |
| **Auth** | Firebase Auth (Email + Password, custom claims for RBAC) |
| **Hosting** | Netlify (frontend), Firebase (functions, rules) |
| **Current Phase** | Documentation complete, implementation starting |

---

## 🏗 Project Structure

```
QRSEVA_NEW/
├── docs/                              # All documentation (READ THESE)
├── Logo/                              # Brand assets
│
├── sales-dashboard/                   # Sales Admin Panel
│   └── src/ → pages, components, hooks, context, services, styles
│
├── admin-dashboard/                   # Restaurant Admin Panel
│   └── src/ → pages, components, hooks, context, services, styles
│
├── customer-app/                      # Customer Ordering PWA
│   └── src/ → pages, components, hooks, context, services, styles, sw.ts
│
├── restaurant-website/                # Restaurant Public Page (optional)
│   └── src/ → pages, components, styles
│
├── landing-page/                      # Marketing Website
│   └── src/ → pages, components, styles
│
├── packages/                          # Shared code
│   ├── shared-ui/                     # Reusable UI components
│   ├── shared-types/                  # TypeScript interfaces & enums
│   ├── firebase-config/               # Firebase init & auth helpers
│   └── utils/                         # Formatters, validators, constants
│
├── functions/                         # Firebase Cloud Functions
│   └── src/ → orders, auth, subscriptions, menus, reports, sales,
│              payments, billing, coupons, feedback, notifications,
│              admin, middleware, utils
│
├── firestore.rules
├── database.rules.json
├── firebase.json
└── .firebaserc
```

> **IMPORTANT**: Each app folder (`sales-dashboard/`, `admin-dashboard/`, `customer-app/`, `landing-page/`) is an independent Vite + React + TypeScript project with its own `package.json`, `vite.config.ts`, and `netlify.toml`.

---

## 🌐 Application Surfaces & Domains

| App | Domain | Auth Required | User Role |
|-----|--------|:------------:|-----------|
| Landing Page | `qrseva.in` | ❌ | Public |
| Admin Dashboard | `admin.qrseva.in` | ✅ | `RESTAURANT_ADMIN` |
| Sales Dashboard | `sales.qrseva.in` | ✅ | `SALES_ADMIN`, `SALES_USER` |
| Customer App | `order.qrseva.in/{slug}` | ❌ | Public (guest checkout) |
| KDS | `admin.qrseva.in/kds` | ✅ | `RESTAURANT_ADMIN` |
| Demo | `demo.qrseva.in` | ❌ | Public (time-limited sandbox) |

---

## 🔐 Authentication & Roles

### User Roles (Firebase Custom Claims)

```typescript
// Custom claims set on Firebase Auth users
interface CustomClaims {
  role: 'SALES_ADMIN' | 'SALES_USER' | 'RESTAURANT_ADMIN';
  restaurantId?: string;  // Only for RESTAURANT_ADMIN
}
```

| Role | Access | Set By |
|------|--------|--------|
| `SALES_ADMIN` | Full sales dashboard, approve restaurants, manage team | Bootstrap script |
| `SALES_USER` | Sales dashboard (limited), onboard restaurants | SALES_ADMIN |
| `RESTAURANT_ADMIN` | Their own restaurant's admin dashboard | Sales approval flow |

### Auth Flow Rules
- Restaurant admins are created during onboarding but **disabled until sales approves**
- Custom claims are set by Cloud Functions, NEVER by the client
- Password change is enforced on first login for sales-created accounts
- Customer ordering does NOT use Firebase Auth at all

---

## 💰 Subscription Plans

| Feature | LITE (₹799/mo) | PRIME (₹1299/mo) | SUPER (₹1999/mo) |
|---------|:--------------:|:----------------:|:----------------:|
| Digital QR Menu | ✅ | ✅ | ✅ |
| Order Management | ✅ | ✅ | ✅ |
| Basic Reports | ✅ | ✅ | ✅ |
| Kitchen Display (KDS) | ❌ | ✅ | ✅ |
| Delivery Support | ❌ | ✅ | ✅ |
| Combo Deals | ❌ | ✅ | ✅ |
| Online Payments | ❌ | ❌ | ✅ |
| Loyalty Program | ❌ | ❌ | ✅ |
| Table Management | ❌ | ❌ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ |
| "Powered by QRSeva" | Shown | Shown | Removable |

> **Plan Gating**: Use the `PlanGate` component to conditionally render features based on the restaurant's `currentPlan`. Check `planFeatures` object from the restaurant document.

---

## 🗄 Database Architecture

### Firestore Collections

| Collection | Purpose | Tenant Isolated |
|------------|---------|:--------------:|
| `restaurants/{restaurantId}` | Restaurant profile, settings, plan | ✅ |
| `restaurants/{rId}/menus/{menuId}` | Menu categories | ✅ |
| `restaurants/{rId}/menus/{mId}/items/{itemId}` | Menu items | ✅ |
| `orders/{orderId}` | All orders (has `restaurantId` field) | ✅ via rules |
| `subscriptions/{restaurantId}` | Subscription state & history | ✅ |
| `payments/{paymentId}` | Payment records | ✅ |
| `coupons/{couponId}` | Promo codes (has `restaurantId`) | ✅ |
| `feedback/{feedbackId}` | Customer feedback | ✅ |
| `announcements/{announcementId}` | Restaurant announcements | ✅ |
| `sales_users/{userId}` | Sales team members | ❌ (internal) |
| `audit_logs/{logId}` | Audit trail | ❌ (internal) |
| `reports/{restaurantId}/daily/{date}` | Precomputed daily reports | ✅ |
| `reports/{restaurantId}/monthly/{month}` | Precomputed monthly reports | ✅ |

### Realtime Database Structure

```
/restaurants/{restaurantId}/
  /liveOrders/{orderId}          → Active orders for KDS
  /tokenCounter/{date}           → Daily token number counter
  /staffCalls/{callId}           → Staff call button (SUPER only)
```

> **Rule**: Use Firestore for persistent data, RTDB for real-time operational data (KDS, live orders). Move completed orders from RTDB to Firestore.

---

## 📱 QR Code & Customer Flow

```
QR URL format: https://order.qrseva.in/{restaurant-slug}?type=dine-in&table=T5

Customer scans QR → Browser opens customer-app → Reads URL params →
Fetches restaurant menu from Firestore → Customer orders →
Order saved to Firestore + RTDB → KDS shows order
```

### QR URL Patterns

| Context | URL |
|---------|-----|
| General | `order.qrseva.in/{slug}` |
| Dine-in Table 5 | `order.qrseva.in/{slug}?type=dine-in&table=T5` |
| Takeaway | `order.qrseva.in/{slug}?type=takeaway` |
| Delivery | `order.qrseva.in/{slug}?type=delivery` |

---

## 🎨 UI/UX Conventions

### Design System
- See `docs/design-system.md` for full specification
- **Primary color**: Maroon (`#8B1A1A`)
- **Accent color**: Amber/Gold (`#F5A623`)
- **Font**: Inter (body), Outfit (headings)
- **Border radius**: 8px (cards), 6px (buttons), 12px (modals)
- **Dark mode**: Support in admin & sales dashboards

### Component Patterns
```typescript
// Use functional components with TypeScript
const OrderCard: React.FC<OrderCardProps> = ({ order }) => { ... };

// Use context for global state
const { restaurant } = useRestaurant();
const { currentPlan } = restaurant;

// Plan-gated features
<PlanGate required="PRIME">
  <KDSView />
</PlanGate>
```

---

## 📐 Code Conventions

### TypeScript
- **Strict mode**: Always enabled
- **Interfaces over types**: Use `interface` for object shapes, `type` for unions
- **No `any`**: Use `unknown` if type is truly unknown
- **Zod validation**: All Cloud Function inputs validated with Zod schemas

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files (components) | PascalCase | `OrderCard.tsx` |
| Files (utils) | camelCase | `formatPrice.ts` |
| Files (types) | camelCase | `order.ts` |
| Components | PascalCase | `<MenuItemForm />` |
| Hooks | camelCase with `use` prefix | `useRestaurant()` |
| Context | PascalCase with `Context` suffix | `RestaurantContext` |
| Cloud Functions | camelCase | `placeOrder`, `approveRestaurantSignup` |
| Firestore collections | snake_case | `sales_users`, `audit_logs` |
| RTDB paths | camelCase | `liveOrders`, `tokenCounter` |
| Env variables | SCREAMING_SNAKE with `VITE_` prefix | `VITE_FIREBASE_API_KEY` |
| CSS classes | kebab-case or CSS modules | `.order-card`, `styles.orderCard` |

### Import Order
```typescript
// 1. React & external libraries
import React, { useState, useEffect } from 'react';
import { collection, query, where } from 'firebase/firestore';

// 2. Shared packages
import { Button, Modal } from '@qrseva/shared-ui';
import { Order, Restaurant } from '@qrseva/shared-types';

// 3. Local imports
import { useRestaurant } from '../context/RestaurantContext';
import { formatPrice } from '../utils/formatters';
import styles from './OrderCard.module.css';
```

### Cloud Functions Pattern
```typescript
// Every Cloud Function follows this pattern:
export const functionName = functions.https.onCall(async (data, context) => {
  // 1. Auth check
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '...');
  
  // 2. Input validation (Zod)
  const validated = inputSchema.parse(data);
  
  // 3. Authorization check (role, tenant)
  const claims = context.auth.token;
  if (claims.role !== 'RESTAURANT_ADMIN') throw ...;
  
  // 4. Business logic
  // ...
  
  // 5. Audit log (for sensitive operations)
  await logAudit({ action: '...', performedBy: context.auth.uid, ... });
  
  // 6. Return result
  return { success: true, data: ... };
});
```

---

## 🔒 Security Rules

### Firestore Rules Principles
1. **Tenant isolation**: Restaurants can ONLY access their own data
2. **Role-based access**: Custom claims checked in rules
3. **Read-only for customers**: Public read for menus, no write access
4. **Sales team**: Can read all restaurants, write only via Cloud Functions

### Never Do
- ❌ Never expose Firebase Admin SDK credentials to the client
- ❌ Never set Firestore rules to `allow read, write: if true`
- ❌ Never store passwords in Firestore (Firebase Auth handles this)
- ❌ Never trust client-side plan checks for security (always verify server-side)
- ❌ Never allow cross-tenant data access

---

## 📊 Restaurant Status Lifecycle

```
PENDING_APPROVAL → ACTIVE → GRACE_PERIOD → EXPIRED
                 → REJECTED
```

| Status | Login | Dashboard | Accept Orders |
|--------|:-----:|:---------:|:------------:|
| `PENDING_APPROVAL` | ❌ | ❌ | ❌ |
| `ACTIVE` | ✅ | ✅ | ✅ |
| `GRACE_PERIOD` | ✅ | ✅ (banner) | ✅ |
| `EXPIRED` | ✅ | ✅ (read-only) | ❌ |
| `REJECTED` | ❌ | ❌ | ❌ |

---

## 📦 Shared Packages

All apps import from `packages/` — NEVER duplicate shared code across apps.

```typescript
import { Button, Modal, Loader, Toast } from '@qrseva/shared-ui';
import { Order, Restaurant, MenuItem, Subscription } from '@qrseva/shared-types';
import { firebaseApp, auth, db, rtdb } from '@qrseva/firebase-config';
import { formatPrice, formatDate, formatPhone, validateGSTIN } from '@qrseva/utils';
```

---

## 🚀 Development & Deployment

### Local Development
```bash
# Start Firebase emulators
firebase emulators:start

# Start any frontend app
cd admin-dashboard && npm run dev     # → localhost:3001
cd sales-dashboard && npm run dev     # → localhost:3002
cd customer-app && npm run dev        # → localhost:3003
cd landing-page && npm run dev        # → localhost:3000
```

### Deployment
- **Frontend**: Netlify (each app is a separate Netlify site)
- **Backend**: Firebase CLI (`firebase deploy --only functions`)
- **CI/CD**: GitHub Actions (auto-deploy on push to `main`)
- See `docs/deployment.md` for full deployment guide

---

## 📚 Documentation Map

Read these documents in order before writing any code:

| # | Document | Purpose | Read When |
|---|----------|---------|-----------|
| 1 | [Phase 0 — Architecture](docs/phase-0-overview-architecture.md) | System architecture, project structure, tech stack | Always read first |
| 2 | [Phase 1 — Data Models](docs/phase-1-firebase-data-models.md) | All Firestore/RTDB schemas, security rules | Working on any data |
| 3 | [Phase 2 — Auth & Sales](docs/phase-2-auth-sales-dashboard.md) | Auth system, sales dashboard, restaurant onboarding | Auth, sales, or onboarding |
| 4 | [Phase 3 — Admin Dashboard](docs/phase-3-admin-dashboard.md) | Restaurant admin panel, plan-gated features | Admin dashboard |
| 5 | [Phase 4 — Customer Ordering](docs/phase-4-customer-ordering.md) | QR codes, menu UI, order placement, PWA | Customer-facing features |
| 6 | [Phase 5 — KDS & Real-time](docs/phase-5-kds-orders-realtime.md) | Kitchen display, RTDB structure, order flow | KDS or real-time features |
| 7 | [Phase 6 — Billing & Payments](docs/phase-6-billing-payments.md) | Digital bills, payment gateway, GST | Billing or payments |
| 8 | [Phase 7 — Reports & Analytics](docs/phase-7-reports-analytics.md) | Precomputed reports, combos, loyalty | Reports or analytics |
| 9 | [Phase 8 — Landing Page](docs/phase-8-landing-page.md) | Marketing site, SEO, pricing page | Landing page |
| 10 | [Phase 9 — Security & Testing](docs/phase-9-security-testing-deployment.md) | Security layers, testing, pre-launch checklist | Security or testing |
| 11 | [Deployment](docs/deployment.md) | Netlify + Firebase deployment, CI/CD, DNS | Deployment |
| 12 | [SEO & Growth](docs/seo-growth-strategy.md) | SEO, content strategy, virality | Marketing features |
| 13 | [Design System](docs/design-system.md) | Colors, typography, spacing, component styles | Any UI work |

---

## ⚠️ Common Pitfalls — Do NOT Do These

| ❌ Don't | ✅ Do Instead |
|----------|--------------|
| Use `qrseva.com` | Use `qrseva.in` |
| Create a single Next.js app | Each surface is a separate Vite app |
| Use Firebase Hosting for frontend | Use Netlify for all frontend apps |
| Let restaurants self-activate | Self-signup → PENDING → Sales approves |
| Require customer login for ordering | Guest checkout with name + phone only |
| Use PostgreSQL or SQL databases | Firestore + RTDB only |
| Store order history in RTDB | RTDB for live/active orders only, Firestore for history |
| Hardcode plan features | Read from `restaurant.planFeatures` object |
| Skip input validation in Cloud Functions | Always validate with Zod |
| Use `any` type | Use proper TypeScript types from `@qrseva/shared-types` |
| Put business logic in client | All critical logic in Cloud Functions |
| Skip audit logging | Log all sensitive operations (create, update, delete, approve) |
| Forget tenant isolation | Always filter by `restaurantId` in queries and rules |
| Use USD or $ | Currency is INR (₹), format: `₹1,299` |
| Ignore plan gating | Wrap premium features in `<PlanGate>` component |

---

## 🔄 Order Flow (End to End)

```
1. Customer scans QR         → order.qrseva.in/{slug}?type=dine-in&table=T3
2. Customer browses menu     → Reads from Firestore: restaurants/{rId}/menus/
3. Customer adds to cart     → Client-side state (React context)
4. Customer places order     → Calls Cloud Function: placeOrder()
5. Cloud Function validates  → Checks restaurant active, menu items exist, prices match
6. Order saved to Firestore  → orders/{orderId} with status=PLACED
7. Order mirrored to RTDB    → restaurants/{rId}/liveOrders/{orderId}
8. KDS receives real-time    → RTDB listener fires, shows new order
9. Kitchen updates status    → PREPARING → READY (via RTDB)
10. Order completed          → RTDB entry deleted, Firestore updated to COMPLETED
11. Daily report updated     → Cloud Function updates precomputed reports
```

---

## 🏷 Git Branch Strategy

| Branch | Purpose | Deploys To |
|--------|---------|-----------|
| `main` | Production-ready code | Production (auto-deploy) |
| `staging` | Pre-production testing | Staging environment |
| `feature/*` | Feature development | Netlify preview deploys |
| `hotfix/*` | Urgent production fixes | Fast-track to main |

### Commit Message Format
```
type(scope): description

feat(admin): add order export to CSV
fix(customer): fix cart total calculation
docs(phase-3): update admin dashboard routes
refactor(functions): extract order validation to shared util
```

---

*Last updated: 2026-02-14*
*Maintained by: Socketix Labs*
