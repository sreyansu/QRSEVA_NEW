# Phase 9 — Security, Testing & Deployment

---

## 1. Security Layers

```
Layer 1: Network (Firebase Hosting + CDN + HTTPS)
Layer 2: Rate Limiting (Cloud Function middleware)
Layer 3: Auth & RBAC (Firebase Auth + Custom Claims)
Layer 4: Subscription Guard (Plan enforcement)
Layer 5: Input Validation (Zod schemas)
Layer 6: Tenant Isolation (restaurantId scoping)
Layer 7: Firestore Rules (read-only, no client writes)
Layer 8: Audit Logging (all admin/sales actions)
```

### 1.1 Rate Limiting

```typescript
// functions/src/middleware/rateLimiter.ts
const orderRateLimiter = new RateLimiterFirestore({
  storeClient: admin.firestore(),
  keyPrefix: 'rate_limit_order',
  points: 10,      // 10 orders per minute per restaurant
  duration: 60,
});

export async function checkRateLimit(restaurantId: string, phone: string) {
  await orderRateLimiter.consume(restaurantId);
  await orderRateLimiter.consume(`phone_${phone}`);
}
```

### 1.2 CAPTCHA (reCAPTCHA v3 on order placement)

### 1.3 Input Validation (Zod)

```typescript
export const PlaceOrderSchema = z.object({
  restaurantId: z.string().min(1).max(100),
  orderType: z.enum(['TAKEAWAY', 'DELIVERY', 'DINE_IN']),
  customer: z.object({
    name: z.string().min(1).max(100).trim(),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    address: z.object({ line1: z.string(), city: z.string(), pincode: z.string().regex(/^\d{6}$/) }).optional(),
  }),
  items: z.array(z.object({
    menuItemId: z.string(), quantity: z.number().int().min(1).max(50),
  })).min(1).max(50),
  paymentMode: z.enum(['CASH', 'UPI', 'ONLINE', 'PAY_ON_PICKUP']),
  captchaToken: z.string(),
});
```

### 1.4 Tenant Isolation — All queries scoped by `restaurantId`

### 1.5 Audited Actions
`RESTAURANT_CREATED`, `SUBSCRIPTION_ACTIVATED`, `SALES_USER_CREATED`, `PAYMENT_RECORDED`, `MENU_ITEM_ADDED`, `ORDER_STATUS_CHANGED`, `PASSWORD_CHANGED`, `LOGIN_ATTEMPT`

---

## 2. Testing Strategy

### Unit Tests — Business logic (subscription validation, pricing, tokens, report math)

### Integration Tests — Cloud Functions + Firestore emulators

### E2E Tests — Critical browser flows (customer order, admin login, menu CRUD, order lifecycle)

```bash
cd functions && npm test                          # Unit
firebase emulators:exec "npm run test:integration" # Integration
npm run test:e2e                                   # E2E
```

---

## 3. Deployment

### Environments
- **Production**: `qrseva-prod` (asia-south1)
- **Staging**: `qrseva-staging` (asia-south1)

### CI/CD — GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd functions && npm ci && npm test
      - run: cd frontend && npm ci && npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: cd frontend && npm ci && npm run build
      - run: npx firebase-tools deploy --only functions,firestore,database,hosting
```

### Security Headers (Firebase Hosting)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Static assets: `Cache-Control: public, max-age=31536000, immutable`

---

## 4. Monitoring & Alerts

| GCP Billing Alert | Action |
|-------------------|--------|
| ₹500 | Email notification |
| ₹1,000 | Email + Slack |
| ₹2,500 | Review usage |
| ₹5,000 | Emergency optimization |

| Firebase Metric | Threshold |
|-----------------|-----------|
| Function errors | > 5% error rate |
| Function latency | > 5s p95 |
| Firestore reads/day | > 100K |
| Auth failures | > 50/hour |

---

## 5. Accessibility (WCAG 2.1)

| Requirement | Target Level | Actions |
|-------------|-------------|--------|
| Color contrast | AA | Minimum 4.5:1 ratio for text, 3:1 for large text |
| Keyboard navigation | A | All interactive elements focusable and operable via keyboard |
| Screen reader | A | Proper ARIA labels, roles, and landmarks |
| Focus indicators | AA | Visible focus rings on all interactive elements |
| Alt text | A | All images have descriptive alt text |
| Form labels | A | All form inputs have associated labels |
| Error identification | A | Clear error messages linked to form fields |
| Responsive text | AA | Text scalable to 200% without loss of content |

### Priority Pages for Accessibility
1. **Customer menu page** (most users)
2. **Cart & checkout flow** (conversion-critical)
3. **KDS screen** (used in kitchen environments)
4. **Admin dashboard** (daily use by restaurant owners)

---

## 6. Push Notification Security

| Measure | Description |
|---------|-------------|
| FCM token scoping | Tokens stored per order, not per user |
| Token rotation | Tokens invalidated after order completion |
| Payload security | No sensitive data in push payloads |
| Opt-in only | Notification permission requested, never forced |
| Unsubscribe | Customers can disable at any time via browser settings |

---

## 7. Pre-Launch Checklist

### Security
- [ ] Auth middleware on all Cloud Functions
- [ ] Firestore & RTDB rules deployed
- [ ] Rate limiting configured
- [ ] CAPTCHA on order placement
- [ ] Input validation on all endpoints
- [ ] Tenant isolation verified
- [ ] HTTPS enforced, security headers set

### Performance
- [ ] Frontend bundle < 200KB gzipped
- [ ] Menu page < 2s on 4G
- [ ] Order placement < 3s
- [ ] KDS latency < 500ms

### Compliance
- [ ] Terms, Privacy, Refund policies published
- [ ] DPDP Act 2023 reviewed
- [ ] WCAG 2.1 AA audit on customer-facing pages
- [ ] Accessibility testing with screen reader (VoiceOver / NVDA)

### Operations
- [ ] GCP billing alerts set
- [ ] Monitoring configured
- [ ] Domain (qrseva.in) configured
- [ ] SSL active
- [ ] Push notification service worker registered
- [ ] FCM configured for order status updates

---

> **Previous**: [← Phase 8 — Landing Page](./phase-8-landing-page.md)  
> **Related**: [Design System →](./design-system.md)
