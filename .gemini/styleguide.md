# QRSeva — Gemini Context & Style Guide

> **Read `AGENTS.md` in the project root for the complete project specification.**

## Project: QRSeva
QR-based restaurant ordering & management SaaS platform for the Indian market.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite (separate app per surface)
- **Backend**: Firebase Cloud Functions (Node.js 20 + TypeScript)
- **Database**: Firestore (persistent data) + Realtime Database (live orders/KDS)
- **Auth**: Firebase Auth with custom claims (RBAC)
- **Hosting**: Netlify (frontend apps), Firebase (Cloud Functions)
- **Validation**: Zod for all Cloud Function inputs
- **Package Manager**: npm

## Domain
`qrseva.in` — All URLs, configs, and references must use `.in`, NOT `.com`.

## Monorepo Structure
Each surface is a separate Vite + React + TypeScript application:
- `sales-dashboard/` → `sales.qrseva.in` (Sales team)
- `admin-dashboard/` → `admin.qrseva.in` (Restaurant owners)
- `customer-app/` → `order.qrseva.in/{slug}` (Customers, no login)
- `landing-page/` → `qrseva.in` (Marketing)
- `packages/` → Shared UI, types, Firebase config, utils
- `functions/` → Firebase Cloud Functions backend

## Code Style
- Strict TypeScript, no `any`
- Functional React components with hooks
- Interface over type for object shapes
- Zod validation on all Cloud Function inputs
- camelCase for files/functions, PascalCase for components
- Firestore collections: snake_case
- Env vars: `VITE_` prefix for client-side

## Key Architecture Rules
1. **Customer ordering is guest-only** — no Firebase Auth for customers
2. **Restaurant signup requires sales approval** — self-signup creates PENDING status
3. **Tenant isolation** — all data queries must filter by `restaurantId`
4. **Plan gating** — wrap premium features in `<PlanGate required="PRIME">` component
5. **Firestore for persistence, RTDB for real-time** — live orders in RTDB, history in Firestore
6. **All business logic in Cloud Functions** — never in client code
7. **Audit logging** — log all sensitive operations (create, update, delete, approve)
8. **Currency is INR (₹)** — Indian market, GST compliance required

## Subscription Plans
- LITE (₹799/mo): QR menu, orders, basic reports
- PRIME (₹1299/mo): + KDS, delivery, combos
- SUPER (₹1999/mo): + payments, loyalty, tables, advanced analytics

## Documentation
All phase documents are in `docs/`. Read the relevant phase doc before implementing:
- Phase 0: Architecture | Phase 1: Data Models | Phase 2: Auth & Sales
- Phase 3: Admin Dashboard | Phase 4: Customer Ordering | Phase 5: KDS
- Phase 6: Billing | Phase 7: Reports | Phase 8: Landing Page | Phase 9: Security
- deployment.md | seo-growth-strategy.md | design-system.md

## Shared Packages
```typescript
import { Button, Modal } from '@qrseva/shared-ui';
import { Order, Restaurant } from '@qrseva/shared-types';
import { firebaseApp } from '@qrseva/firebase-config';
import { formatPrice } from '@qrseva/utils';
```

## Cloud Function Template
```typescript
export const functionName = functions.https.onCall(async (data, context) => {
  // 1. Auth check
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '...');
  // 2. Input validation (Zod)
  const validated = schema.parse(data);
  // 3. Authorization (role + tenant check)
  // 4. Business logic
  // 5. Audit log
  // 6. Return result
});
```
