# QRSeva — Deployment Documentation

**Hosting**: Netlify (Frontend Apps) + Firebase (Backend Services)  
**Domain**: `qrseva.in`

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         NETLIFY                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ landing-page │ │ admin-dash   │ │ customer-app         │ │
│  │ qrseva.in    │ │ admin.       │ │ order.qrseva.in      │ │
│  │              │ │ qrseva.in    │ │                      │ │
│  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘ │
│  ┌──────────────┐ ┌──────────────┐             │            │
│  │ sales-dash   │ │ restaurant-  │             │            │
│  │ sales.       │ │ website      │             │            │
│  │ qrseva.in    │ │ (optional)   │             │            │
│  └──────┬───────┘ └──────┬───────┘             │            │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                        FIREBASE                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Cloud        │ │ Firestore    │ │ Realtime Database    │ │
│  │ Functions    │ │              │ │                      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Auth         │ │ Storage      │ │ Cloud Messaging      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Environments

| Environment | Purpose | Firebase Project | Netlify Branch |
|-------------|---------|-----------------|----------------|
| **Development** | Local dev & testing | `qrseva-dev` | — (localhost) |
| **Staging** | Pre-production testing | `qrseva-staging` | `staging` branch |
| **Production** | Live for customers | `qrseva-prod` | `main` branch |

---

## 3. Netlify Setup (Frontend Apps)

### 3.1 Create Netlify Sites

Create **one Netlify site per app folder**:

| App Folder | Netlify Site Name | Custom Domain |
|------------|-------------------|---------------|
| `landing-page/` | `qrseva-landing` | `qrseva.in` |
| `admin-dashboard/` | `qrseva-admin` | `admin.qrseva.in` |
| `sales-dashboard/` | `qrseva-sales` | `sales.qrseva.in` |
| `customer-app/` | `qrseva-order` | `order.qrseva.in` |
| `restaurant-website/` | `qrseva-restaurant` | `menu.qrseva.in` |
| `admin-dashboard/` (demo) | `qrseva-demo` | `demo.qrseva.in` |

### 3.2 Netlify Configuration per App

Each app folder should have its own `netlify.toml`:

```toml
# landing-page/netlify.toml

[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

# SPA fallback — redirect all routes to index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Cache static assets aggressively
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# API proxy to Firebase Cloud Functions (avoids CORS)
[[redirects]]
  from = "/api/*"
  to = "https://us-central1-qrseva-prod.cloudfunctions.net/:splat"
  status = 200
  force = true
```

```toml
# admin-dashboard/netlify.toml

[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "https://us-central1-qrseva-prod.cloudfunctions.net/:splat"
  status = 200
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

```toml
# customer-app/netlify.toml

[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Service Worker must be served from root
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[redirects]]
  from = "/api/*"
  to = "https://us-central1-qrseva-prod.cloudfunctions.net/:splat"
  status = 200
  force = true
```

### 3.3 Environment Variables on Netlify

Set these in **Netlify > Site Settings > Environment Variables** for each site:

| Variable | Value | Where |
|----------|-------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` | All sites |
| `VITE_FIREBASE_AUTH_DOMAIN` | `qrseva-prod.firebaseapp.com` | All sites |
| `VITE_FIREBASE_PROJECT_ID` | `qrseva-prod` | All sites |
| `VITE_FIREBASE_STORAGE_BUCKET` | `qrseva-prod.appspot.com` | All sites |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | All sites |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:abc...` | All sites |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-XXXXXXX` | All sites |
| `VITE_API_BASE_URL` | `https://us-central1-qrseva-prod.cloudfunctions.net` | All sites |
| `VITE_VAPID_KEY` | `BPL...` (for push notifications) | customer-app |

> **Important**: Use `VITE_` prefix for all env vars so Vite exposes them to the client bundle. Never put secrets (API keys with write access, service account keys) in frontend env vars.

### 3.4 Domain Configuration

#### DNS Records (on your domain registrar for qrseva.in)

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| `A` | `@` | Netlify load balancer IP | `qrseva.in` |
| `CNAME` | `www` | `qrseva-landing.netlify.app` | `www.qrseva.in` |
| `CNAME` | `admin` | `qrseva-admin.netlify.app` | `admin.qrseva.in` |
| `CNAME` | `sales` | `qrseva-sales.netlify.app` | `sales.qrseva.in` |
| `CNAME` | `order` | `qrseva-order.netlify.app` | `order.qrseva.in` |
| `CNAME` | `demo` | `qrseva-demo.netlify.app` | `demo.qrseva.in` |
| `CNAME` | `menu` | `qrseva-restaurant.netlify.app` | `menu.qrseva.in` |

Netlify provides **free SSL certificates** (Let's Encrypt) automatically after DNS propagation.

---

## 4. Firebase Setup (Backend)

### 4.1 Firebase Project Initialization

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project root
firebase init

# Select:
# ✅ Firestore
# ✅ Realtime Database
# ✅ Cloud Functions (TypeScript)
# ✅ Storage
# ✅ Emulators
```

### 4.2 Firebase Project Configuration

```json
// firebase.json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "database": {
    "rules": "database.rules.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "predeploy": [
      "npm --prefix functions run lint",
      "npm --prefix functions run build"
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "database": { "port": 9000 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

```json
// .firebaserc
{
  "projects": {
    "dev": "qrseva-dev",
    "staging": "qrseva-staging",
    "production": "qrseva-prod"
  }
}
```

### 4.3 Deploy Firebase Services

```bash
# Switch to production project
firebase use production

# Deploy Cloud Functions only
firebase deploy --only functions

# Deploy Firestore rules & indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy RTDB rules
firebase deploy --only database

# Deploy Storage rules
firebase deploy --only storage

# Deploy everything at once
firebase deploy
```

### 4.4 Firebase Environment Config (Cloud Functions)

```bash
# Set environment secrets for Cloud Functions
firebase functions:secrets:set EMAIL_API_KEY
firebase functions:secrets:set CASHFREE_APP_ID
firebase functions:secrets:set CASHFREE_SECRET_KEY
firebase functions:secrets:set FCM_VAPID_KEY
```

---

## 5. CI/CD Pipeline (GitHub Actions)

### 5.1 Repository Structure

```
main branch     → Production deployment
staging branch  → Staging deployment
feature/*       → Preview deployments (Netlify Deploy Previews)
```

### 5.2 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy QRSeva

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # ──────────────────────────────────────
  # Job 1: Deploy Firebase Backend
  # ──────────────────────────────────────
  deploy-firebase:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: functions/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: functions

      - name: Lint
        run: npm run lint
        working-directory: functions

      - name: Build
        run: npm run build
        working-directory: functions

      - name: Deploy to Firebase (Production)
        if: github.ref == 'refs/heads/main'
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions,firestore:rules,database --project production
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_PROD }}

      - name: Deploy to Firebase (Staging)
        if: github.ref == 'refs/heads/staging'
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions,firestore:rules,database --project staging
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_STAGING }}

  # ──────────────────────────────────────
  # Job 2: Build & Deploy Frontend Apps
  # ──────────────────────────────────────
  deploy-landing:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
        working-directory: landing-page
      - run: npm run build
        working-directory: landing-page
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: landing-page/dist
          production-deploy: ${{ github.ref == 'refs/heads/main' }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID_LANDING }}

  deploy-admin:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
        working-directory: admin-dashboard
      - run: npm run build
        working-directory: admin-dashboard
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: admin-dashboard/dist
          production-deploy: ${{ github.ref == 'refs/heads/main' }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID_ADMIN }}

  deploy-sales:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
        working-directory: sales-dashboard
      - run: npm run build
        working-directory: sales-dashboard
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: sales-dashboard/dist
          production-deploy: ${{ github.ref == 'refs/heads/main' }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID_SALES }}

  deploy-customer:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
        working-directory: customer-app
      - run: npm run build
        working-directory: customer-app
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: customer-app/dist
          production-deploy: ${{ github.ref == 'refs/heads/main' }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID_CUSTOMER }}
```

### 5.3 GitHub Secrets Required

| Secret | Purpose |
|--------|---------|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID_LANDING` | Site ID for landing-page |
| `NETLIFY_SITE_ID_ADMIN` | Site ID for admin-dashboard |
| `NETLIFY_SITE_ID_SALES` | Site ID for sales-dashboard |
| `NETLIFY_SITE_ID_CUSTOMER` | Site ID for customer-app |
| `FIREBASE_SERVICE_ACCOUNT_PROD` | Firebase service account JSON (prod) |
| `FIREBASE_SERVICE_ACCOUNT_STAGING` | Firebase service account JSON (staging) |

---

## 6. Manual Deployment (Quick Deploy)

For quick manual deployments without CI/CD:

### 6.1 Install Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

### 6.2 Deploy Individual Apps

```bash
# Landing Page
cd landing-page && npm run build
netlify deploy --prod --dir=dist --site=qrseva-landing

# Admin Dashboard
cd admin-dashboard && npm run build
netlify deploy --prod --dir=dist --site=qrseva-admin

# Sales Dashboard
cd sales-dashboard && npm run build
netlify deploy --prod --dir=dist --site=qrseva-sales

# Customer App
cd customer-app && npm run build
netlify deploy --prod --dir=dist --site=qrseva-order
```

### 6.3 Deploy Firebase Backend

```bash
cd functions && npm run build
firebase deploy --only functions --project production
firebase deploy --only firestore:rules --project production
firebase deploy --only database --project production
```

---

## 7. Local Development

### 7.1 Start Firebase Emulators

```bash
# From project root
firebase emulators:start
```

This starts local emulators for Auth, Firestore, RTDB, Functions, and Storage at:
- Emulator UI: `http://localhost:4000`
- Auth: `http://localhost:9099`
- Firestore: `http://localhost:8080`
- RTDB: `http://localhost:9000`
- Functions: `http://localhost:5001`

### 7.2 Start Frontend Apps (Dev Mode)

```bash
# Terminal 1: Landing Page
cd landing-page && npm run dev     # → http://localhost:3000

# Terminal 2: Admin Dashboard
cd admin-dashboard && npm run dev  # → http://localhost:3001

# Terminal 3: Sales Dashboard
cd sales-dashboard && npm run dev  # → http://localhost:3002

# Terminal 4: Customer App
cd customer-app && npm run dev     # → http://localhost:3003
```

### 7.3 Local Environment Variables

Each app folder needs a `.env.local` file for local development:

```bash
# .env.local (for all frontend apps during local dev)
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=qrseva-dev
VITE_FIREBASE_STORAGE_BUCKET=qrseva-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000
VITE_FIREBASE_APP_ID=demo-app-id
VITE_API_BASE_URL=http://localhost:5001/qrseva-dev/us-central1
VITE_USE_EMULATORS=true
```

---

## 8. Demo / Sandbox Deployment

The demo sandbox (`demo.qrseva.in`) is a **separate deployment** of the `admin-dashboard` app configured to run in demo mode with pre-seeded data.

### 8.1 Demo Firebase Project

The demo uses a **separate Firebase project** (`qrseva-demo`) to isolate demo data from production:

```json
// .firebaserc
{
  "projects": {
    "dev": "qrseva-dev",
    "staging": "qrseva-staging",
    "production": "qrseva-prod",
    "demo": "qrseva-demo"
  }
}
```

### 8.2 Demo Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_FIREBASE_PROJECT_ID` | `qrseva-demo` | Separate project |
| `VITE_DEMO_MODE` | `true` | Enables demo watermark & time limit |
| `VITE_DEMO_DURATION_MINUTES` | `30` | Session expires after 30 min |
| `VITE_DEMO_RESTAURANT_ID` | `demo_restaurant_001` | Pre-seeded restaurant |

### 8.3 Demo Data Seeding

```bash
# Seed demo Firebase project with sample data
firebase use demo
node scripts/seed-demo-data.js
```

The seed script creates:
- 1 demo restaurant ("QRSeva Demo Restaurant")
- 50+ menu items across 8 categories
- Sample orders (various statuses)
- Combo deals & loyalty config
- Announcements & coupons

### 8.4 Demo Reset (Scheduled)

A Cloud Scheduler job resets demo data every 6 hours:

```bash
# Deploy demo reset scheduler
firebase use demo
firebase deploy --only functions:resetDemoData
```

### 8.5 Deploy Demo to Netlify

```bash
# Build admin-dashboard with demo env
cd admin-dashboard
NODE_ENV=production VITE_DEMO_MODE=true npm run build

# Deploy to demo Netlify site
netlify deploy --prod --dir=dist --site=qrseva-demo
```

### 8.6 Demo `netlify.toml`

Create a separate config at `admin-dashboard/netlify-demo.toml`:

```toml
[build]
  publish = "dist"
  command = "VITE_DEMO_MODE=true npm run build"

[build.environment]
  NODE_VERSION = "20"
  VITE_DEMO_MODE = "true"
  VITE_DEMO_DURATION_MINUTES = "30"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "https://us-central1-qrseva-demo.cloudfunctions.net/:splat"
  status = 200
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Robots-Tag = "noindex, nofollow"
```

> **Note**: `X-Robots-Tag: noindex` prevents search engines from indexing the demo site.

---

## 9. Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Lint checks passing
- [ ] Environment variables set on Netlify for all sites
- [ ] Firebase project selected (`firebase use production`)
- [ ] DNS records configured for qrseva.in subdomains
- [ ] SSL certificates provisioned on Netlify

### Firebase Deployment
- [ ] Cloud Functions compiled without errors
- [ ] Firestore security rules reviewed and tested
- [ ] RTDB security rules reviewed and tested
- [ ] Storage security rules set
- [ ] Firebase secrets configured (`firebase functions:secrets:set`)

### Netlify Deployment
- [ ] Each app builds successfully (`npm run build`)
- [ ] `netlify.toml` present in each app folder
- [ ] SPA redirect rules configured
- [ ] Security headers configured
- [ ] API proxy redirects to correct Firebase Functions URL
- [ ] Custom domains connected and SSL active

### Post-Deployment Verification
- [ ] Landing page loads at `qrseva.in`
- [ ] Admin dashboard loads at `admin.qrseva.in`
- [ ] Sales dashboard loads at `sales.qrseva.in`
- [ ] Customer app loads at `order.qrseva.in`
- [ ] Firebase Auth login works from all apps
- [ ] Cloud Functions respond correctly
- [ ] Firestore reads/writes working
- [ ] RTDB real-time updates working (KDS)
- [ ] Push notifications working (customer-app)
- [ ] QR code URLs resolve correctly

---

## 9. Rollback Strategy

### Frontend Rollback (Netlify)
Netlify keeps **every deploy** as an immutable snapshot. To rollback:

1. Go to **Netlify > Site > Deploys**
2. Click on the previous working deploy
3. Click **"Publish Deploy"**

This instantly rolls back with zero downtime.

### Backend Rollback (Firebase)
```bash
# List recent Cloud Function deployments
firebase functions:log --only ERROR

# Rollback to previous function version (redeploy from git)
git checkout <previous-commit> -- functions/
cd functions && npm run build
firebase deploy --only functions --project production
```

### Database Rollback
Firebase doesn't have built-in rollback. Use:
- **Firestore**: Scheduled backups via `gcloud firestore export`
- **Point-in-time recovery**: Available on Blaze plan

```bash
# Export Firestore backup (schedule daily via Cloud Scheduler)
gcloud firestore export gs://qrseva-backups/$(date +%Y-%m-%d)
```

---

## 10. Monitoring & Alerts

| Service | Tool | URL |
|---------|------|-----|
| Frontend performance | Netlify Analytics | Netlify Dashboard |
| Function errors | Firebase Console | console.firebase.google.com |
| Function logs | Google Cloud Logging | console.cloud.google.com/logs |
| Uptime monitoring | UptimeRobot (free) | uptimerobot.com |
| Cost tracking | GCP Billing | console.cloud.google.com/billing |

### Recommended Alerts

| Alert | Threshold | Channel |
|-------|-----------|---------|
| Firebase monthly cost | ₹500, ₹1000, ₹2500 | Email |
| Function error rate | > 5% | Email + Slack |
| Function latency (p95) | > 5 seconds | Email |
| Netlify build failure | Any failure | Email (auto) |
| SSL certificate expiry | 7 days before | Email |
| Domain expiry | 30 days before | Email |

---

> **Related Docs**:
> - [Phase 0 — Architecture & Project Structure](./phase-0-overview-architecture.md)
> - [Phase 9 — Security & Pre-Launch Checklist](./phase-9-security-testing-deployment.md)
