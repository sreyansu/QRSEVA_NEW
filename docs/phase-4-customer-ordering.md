# Phase 4 — Customer Ordering (QR Flow)

---

## 1. Overview

The customer ordering experience is the core user-facing feature of QRSeva. Customers scan a QR code, browse the menu, and place orders — all without creating an account (guest checkout).

### Design Principles
- **Zero friction** — No login, no signup, no app download
- **Mobile-first** — PWA optimized for phones
- **Fast** — Menu loads in < 2s on 4G
- **Accessible** — Clear typography, veg/non-veg indicators, price in ₹

---

## 2. QR Code System

### 2.1 QR Code Types

| Type | URL Pattern | Plan |
|------|-------------|------|
| Restaurant QR | `order.qrseva.in/{slug}` | All |
| Takeaway QR | `order.qrseva.in/{slug}?type=takeaway` | All |
| Delivery QR | `order.qrseva.in/{slug}?type=delivery` | All |
| Table QR | `order.qrseva.in/{slug}/table/{tableId}` | SUPER |

### 2.2 QR Generation

```typescript
// functions/src/qr/generateQR.ts

export const generateRestaurantQR = functions.https.onCall(async (data, context) => {
  requireRestaurantAdmin(context);
  const restaurantId = context.auth.token.restaurantId;
  const restaurant = await getRestaurant(restaurantId);
  
  const baseUrl = `https://order.qrseva.in/${restaurant.slug}`;
  
  const qrCodes = {
    general: await generateQRImage(baseUrl, restaurant.name),
    takeaway: await generateQRImage(`${baseUrl}?type=takeaway`, `${restaurant.name} - Takeaway`),
    delivery: await generateQRImage(`${baseUrl}?type=delivery`, `${restaurant.name} - Delivery`),
  };
  
  // Table QRs (SUPER only)
  if (restaurant.currentPlan === 'SUPER' && restaurant.tables) {
    qrCodes.tables = {};
    for (const table of restaurant.tables.list) {
      qrCodes.tables[table.tableId] = await generateQRImage(
        `${baseUrl}/table/${table.tableId}`,
        `${restaurant.name} - ${table.tableName}`
      );
    }
  }
  
  return qrCodes;
});
```

---

## 3. Customer Flow

```mermaid
flowchart TD
    A[Scan QR Code] --> B{Valid Restaurant?}
    B -->|No| C[Show Error Page]
    B -->|Yes| D{Subscription Active?}
    D -->|No| E[Show "Temporarily Unavailable"]
    D -->|Yes| D2{Kitchen Open?}
    D2 -->|No| E2[Show "Kitchen Closed" banner with reason]
    D2 -->|Yes| D3{Within Operating Hours?}
    D3 -->|No| E3[Show "Outside Operating Hours" message]
    D3 -->|Yes| F[Load Menu]
    F --> G[Browse Categories]
    G --> H[Add Items to Cart]
    H --> I[Review Cart]
    I --> J{Order Type}
    J -->|Takeaway| K[Enter Name + Phone]
    J -->|Delivery| L[Enter Name + Phone + Address]
    J -->|Dine-in| M[Auto-detect Table from QR]
    K --> N[Select Payment Mode]
    L --> N
    M --> O[Enter Name + Phone]
    O --> N
    N --> P[Place Order]
    P --> Q{Validation OK?}
    Q -->|No| R[Show Error]
    Q -->|Yes| S[Order Confirmed - Show Token]
    S --> T[Track Order Status]
    
    style D2 fill:#FF6B6B,stroke:#333
    style E2 fill:#FFD700,stroke:#333
```

---

## 4. UI Screens

### 4.1 Menu Page

```
┌─────────────────────────────────┐
│  🍽️ [Restaurant Logo]           │
│  Restaurant Name                │
│  📍 City | ⏰ 9AM - 10PM        │
│  ─────────────────────────────  │
│  🔍 Search menu...              │
│  ─────────────────────────────  │
│  [All] [Starters] [Main] [...]  │
│  ─────────────────────────────  │
│  🟢 Paneer Tikka          ₹250  │
│     Marinated cottage cheese     │
│     [  - ] 1 [ + ]              │
│  ─────────────────────────────  │
│  🔴 Butter Chicken        ₹350  │
│     Creamy tomato gravy          │
│     Half ₹200 | Full ₹350       │
│     [Add to Cart]                │
│  ─────────────────────────────  │
│  🟢 Garlic Naan            ₹60  │
│     [Add to Cart]                │
│  ─────────────────────────────  │
│                                  │
│  ┌─────────────────────────────┐│
│  │ 🛒 3 items | ₹660  [Cart →]││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

**Key UI Elements:**
- 🟢 Green dot = Veg, 🔴 Red dot = Non-veg
- Category tabs with horizontal scroll
- Sticky cart bar at bottom
- Item images (lazy loaded)
- "Unavailable" items grayed out with badge (PRIME+)
- Search with fuzzy matching
- **Dietary filter pills**: Jain / Vegan / Gluten-Free (tap to filter)
- **Language toggle**: EN | हि (switch to Hindi/regional language)
- **Announcements banner**: Restaurant banners shown at top of menu
- **Kitchen Closed overlay**: Full-page overlay when kitchen is closed (see below)

#### Kitchen Closed State (Customer View)

When `kitchenStatus.isOpen === false`, the menu page shows the menu **in read-only mode** with an overlay:

```
┌─────────────────────────────────┐
│  🍽️ [Restaurant Logo]           │
│  Restaurant Name                │
│  ─────────────────────────────  │
│  ┌─────────────────────────────┐│
│  │  🔴 Kitchen is Currently     ││
│  │     CLOSED                   ││
│  │                              ││
│  │  Reason: Holiday             ││
│  │  Opens at: 6:00 PM today     ││
│  │                              ││
│  │  You can browse the menu     ││
│  │  but ordering is paused.     ││
│  └─────────────────────────────┘│
│  ─────────────────────────────  │
│  🟢 Paneer Tikka          ₹250  │ ← menu visible but grayed
│  🔴 Butter Chicken        ₹350  │ ← "Add to Cart" disabled
│  ...                            │
│  ─────────────────────────────  │
│  [Cart button hidden]           │
└─────────────────────────────────┘
```

**Behavior when kitchen is closed:**
- Menu items are visible (customers can browse)
- "Add to Cart" buttons are **disabled**
- Cart bar is **hidden**
- A prominent banner explains the closure reason
- If `scheduledReopen` exists, show countdown: "Opens in 2h 30m"

### 4.2 Cart Page

```
┌─────────────────────────────────┐
│  ← Your Cart                    │
│  ─────────────────────────────  │
│  🟢 Paneer Tikka        1  ₹250│
│     [  - ] 1 [ + ]    [Remove] │
│  🔴 Butter Chicken (F)  1  ₹350│
│     [  - ] 1 [ + ]    [Remove] │
│     + Extra Cheese       + ₹30 │
│     📝 Less spicy               │
│  🟢 Garlic Naan         1   ₹60│
│     [  - ] 1 [ + ]    [Remove] │
│  ─────────────────────────────  │
│  Subtotal:               ₹690  │
│  Delivery Charge:         ₹40  │
│  ─────────────────────────────  │
│  Total:                  ₹730  │
│  ─────────────────────────────  │
│                                  │
│  [← Add More Items]             │
│  ─────────────────────────────  │
│  [      Proceed to Checkout   ] │
└─────────────────────────────────┘
```

### 4.3 Checkout Page

```
┌─────────────────────────────────┐
│  ← Checkout                     │
│  ─────────────────────────────  │
│  ORDER TYPE                      │
│  ○ Takeaway  ○ Delivery  ○ Dine│
│  ─────────────────────────────  │
│  YOUR DETAILS                    │
│  Name:  [___________________]   │
│  Phone: [___________________]   │
│                                  │
│  DELIVERY ADDRESS (if delivery)  │
│  Address: [_________________]   │
│  Pincode: [_______]            │
│  Landmark: [________________]   │
│  ─────────────────────────────  │
│  PAYMENT METHOD                  │
│  ○ Cash                          │
│  ○ UPI (Pay at counter)         │
│  ○ Pay on Pickup                 │
│  ○ Pay Online (if enabled)       │
│  ─────────────────────────────  │
│  ORDER SUMMARY                   │
│  3 items | Total: ₹730          │
│  ─────────────────────────────  │
│  [      Place Order ₹730     ]  │
└─────────────────────────────────┘
```

### 4.4 Order Confirmation

```
┌─────────────────────────────────┐
│                                  │
│         ✅ Order Placed!         │
│                                  │
│      Token Number: #15           │
│   Order: ORD-20260210-015        │
│                                  │
│   Your order has been sent       │
│   to the kitchen.                │
│                                  │
│  ─────────────────────────────  │
│                                  │
│  Status: 🟡 NEW                  │
│  Estimated time: ~20 mins        │
│                                  │
│  ─────────────────────────────  │
│         [Track Order]            │
│         [Place New Order]        │
└─────────────────────────────────┘
```

---

## 5. Order Placement — Cloud Function

```typescript
// functions/src/orders/placeOrder.ts

export const placeOrder = functions.https.onCall(async (data, context) => {
  // No auth required — guest checkout
  
  const { restaurantId, orderType, customer, items, paymentMode, tableId } = data;
  
  // 1. Rate limiting check
  await checkRateLimit(restaurantId, data.customerPhone);
  
  // 2. CAPTCHA / abuse protection
  await verifyCaptcha(data.captchaToken);
  
  // 3. Check kitchen status (admin toggle)
  const restaurant = await getRestaurant(restaurantId);
  
  if (!restaurant.kitchenStatus.isOpen) {
    const reason = restaurant.kitchenStatus.closedReason || 'temporarily closed';
    const reopen = restaurant.kitchenStatus.scheduledReopen;
    throw error(
      `Kitchen is ${reason}${reopen ? `. Expected to reopen at ${formatTime(reopen)}` : '. Please try again later.'}`
    );
  }
  
  // 3b. Check operating hours
  const now = getCurrentTime(restaurant.settings.operatingHours.timezone);
  const { open, close, closedDays } = restaurant.settings.operatingHours;
  
  if (closedDays.includes(now.getDay())) {
    throw error('Restaurant is closed today. Please try again on a working day.');
  }
  
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  if (currentTime < open || currentTime > close) {
    throw error(`Restaurant is open from ${open} to ${close}. Please order during operating hours.`);
  }
  
  // 4. Validate subscription
  const { valid, plan, features } = await validateSubscription(restaurantId);
  if (!valid) {
    throw error('Restaurant is currently not accepting orders');
  }
  
  // 4. Validate order type against plan
  if (orderType === 'DINE_IN' && plan !== 'SUPER') {
    throw error('Dine-in ordering not available');
  }
  
  // 5. Validate table (SUPER + dine-in)
  if (orderType === 'DINE_IN') {
    await validateTable(restaurantId, tableId);
  }
  
  // 6. Validate & price items
  const pricedItems = await validateAndPriceItems(restaurantId, items, features);
  
  // 7. Calculate totals
  const subtotal = pricedItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const deliveryCharge = calculateDeliveryCharge(restaurantId, orderType, plan, features);
  const totalAmount = subtotal + deliveryCharge;
  
  // 8. Validate minimum order (PRIME+, delivery only)
  if (orderType === 'DELIVERY' && plan !== 'LITE') {
    const restaurant = await getRestaurant(restaurantId);
    if (subtotal < restaurant.settings.minimumOrderAmount) {
      throw error(`Minimum order for delivery is ₹${restaurant.settings.minimumOrderAmount / 100}`);
    }
  }
  
  // 9. Generate order number & token
  const orderNumber = await generateOrderNumber(restaurantId);
  const tokenNumber = features.orderTokens ? await generateToken(restaurantId) : null;
  
  // 10. Create order in Firestore
  const orderRef = admin.firestore().collection('orders').doc();
  const order = {
    id: orderRef.id,
    restaurantId,
    orderNumber,
    tokenNumber,
    type: orderType,
    status: 'NEW',
    customer: sanitizeCustomer(customer),
    table: orderType === 'DINE_IN' ? { tableId, tableName: `Table ${tableId}` } : null,
    items: pricedItems,
    subtotal,
    deliveryCharge,
    discount: 0,
    totalAmount,
    payment: {
      mode: paymentMode,
      status: 'PENDING',
    },
    placedAt: admin.firestore.FieldValue.serverTimestamp(),
    planAtOrder: plan,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  await orderRef.set(order);
  
  // 11. Mirror to RTDB (lightweight version)
  const rtdbOrder = {
    orderNumber,
    tokenNumber,
    type: orderType,
    status: 'NEW',
    customer: { name: customer.name, phone: customer.phone },
    items: pricedItems.map(i => ({
      name: i.name,
      quantity: i.quantity,
      variant: i.variant || null,
      isVeg: i.isVeg,
    })),
    totalAmount,
    placedAt: Date.now(),
    table: order.table,
  };
  
  await admin.database()
    .ref(`live_orders/${restaurantId}/${orderRef.id}`)
    .set(rtdbOrder);
  
  // 12. Increment daily report counters
  await incrementDailyOrderCount(restaurantId, orderType);
  
  return {
    orderId: orderRef.id,
    orderNumber,
    tokenNumber,
    totalAmount,
    estimatedTime: 20, // minutes
  };
});
```

---

## 6. Delivery Logic (Plan-Based)

```typescript
// functions/src/orders/deliveryRules.ts

function calculateDeliveryCharge(
  restaurantId: string,
  orderType: string,
  plan: string,
  features: PlanFeatures
): number {
  if (orderType !== 'DELIVERY') return 0;
  
  switch (plan) {
    case 'LITE':
      return 0; // No delivery charge on LITE
    case 'PRIME':
    case 'SUPER':
      return features.deliveryCharge ? 
        restaurant.settings.deliveryCharge : 0;
    default:
      return 0;
  }
}

function validateMinimumOrder(
  subtotal: number,
  orderType: string,
  plan: string,
  restaurant: Restaurant
): void {
  if (orderType !== 'DELIVERY') return;
  if (plan === 'LITE') return; // No minimum on LITE
  
  const minimumAmount = restaurant.settings.minimumOrderAmount;
  if (minimumAmount > 0 && subtotal < minimumAmount) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `Minimum order for delivery is ₹${(minimumAmount / 100).toFixed(2)}`
    );
  }
}
```

---

## 7. PWA Configuration

```json
// public/manifest.json
{
  "name": "QRSeva - Order Food",
  "short_name": "QRSeva",
  "description": "Scan, Order, Enjoy — No app download needed",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#8B1A1A",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 8. Implementation Checklist

- [ ] Build customer menu browsing page
  - [ ] Restaurant header with logo & info
  - [ ] Category-based menu display
  - [ ] Search functionality
  - [ ] Veg/Non-veg indicators
  - [ ] Variant & add-on selection
  - [ ] Item images (lazy loaded)
  - [ ] Unavailable item display (PRIME+)
- [ ] Build cart functionality
  - [ ] Add/remove items
  - [ ] Quantity controls
  - [ ] Special instructions
  - [ ] Cart summary with totals
- [ ] Build checkout flow
  - [ ] Order type selection
  - [ ] Customer details form
  - [ ] Delivery address (conditional)
  - [ ] Payment mode selection
  - [ ] Order summary
- [ ] Kitchen closed banner (read-only menu + closure reason + reopen countdown)
- [ ] Operating hours & closed days check on menu page load
- [ ] Implement placeOrder Cloud Function
  - [ ] Kitchen status validation (isOpen check)
  - [ ] Operating hours validation (open/close times + closedDays)
  - [ ] Subscription validation
  - [ ] Plan feature validation
  - [ ] Item pricing validation
  - [ ] Delivery rule enforcement
  - [ ] Order number & token generation
  - [ ] Firestore write
  - [ ] RTDB mirror
  - [ ] Daily report increment
- [ ] Build order confirmation page
- [ ] Build order tracking page (PRIME+)
- [ ] Implement QR code generation
- [ ] Configure PWA manifest
- [ ] Implement rate limiting
- [ ] Add CAPTCHA protection
- [ ] Mobile responsiveness testing
- [ ] Performance optimization (<2s load)

---

## 9. Additional Customer Features

### 9.1 Order Modification / Cancellation

Customers can cancel orders only while status is **NEW** (before restaurant confirms):

| Action | Allowed Status | Rules |
|--------|---------------|-------|
| Cancel order | NEW only | Full refund if paid online |
| Modify items | Not allowed | Must cancel and re-order |

### 9.2 Dynamic Estimated Preparation Time

Instead of hardcoded 20-min estimate, calculate based on:
- Item-level `prepTime` values (max across items in order)
- Current pending order count for the restaurant
- Time of day (lunch/dinner rush adjustment)

### 9.3 Repeat Order (Reorder Last Order)

For returning customers (matched by phone number):
- Show "Reorder Last Order" option on menu page
- Pre-fills cart with previous items
- Validates current availability and pricing

### 9.4 Dietary Filters

Filter pills on menu page header:
- 🌱 Jain | 🥦 Vegan | 🌾 Gluten-Free | 🥜 Nut-Free | 🧀 Dairy-Free
- Filters based on `dietaryTags` field in MenuItem
- Multiple filters combine with AND logic

### 9.5 Push Notifications (PWA)

Opt-in browser push notifications for order status updates:
- Request permission on order confirmation page
- Send notification on: CONFIRMED, PREPARING, READY, COMPLETED
- Uses Firebase Cloud Messaging (FCM) + Service Worker

### 9.6 Customer Feedback / Rating

After order is COMPLETED, customer can:
- Rate 1-5 stars
- Select quick tags (Good Food, Fast Service, etc.)
- Leave optional text comment (max 500 chars)
- Feedback appears in admin reports (PRIME+)

### 9.7 Order Scheduling (Future Pickup/Delivery)

Allow customers to place orders for a future time:
- Time picker: Today (next available slot) or specific time
- Minimum 30 minutes ahead
- Maximum 24 hours ahead
- Restaurant receives order in scheduled queue, moves to active at appropriate time

---

## 10. Updated Implementation Checklist

- [ ] Build customer menu browsing page
  - [ ] Restaurant header with logo & info
  - [ ] Category-based menu display
  - [ ] Search functionality
  - [ ] Veg/Non-veg indicators
  - [ ] Dietary filter pills
  - [ ] Language toggle (multi-language)
  - [ ] Announcements banner
  - [ ] Variant & add-on selection
  - [ ] Item images (lazy loaded)
  - [ ] Unavailable item display (PRIME+)
- [ ] Build cart functionality
  - [ ] Add/remove items
  - [ ] Quantity controls
  - [ ] Special instructions
  - [ ] Cart summary with totals
  - [ ] Coupon code application
- [ ] Build checkout flow
  - [ ] Order type selection
  - [ ] Customer details form
  - [ ] Delivery address (conditional)
  - [ ] Payment mode selection
  - [ ] Order scheduling (date/time picker)
  - [ ] Order summary
- [ ] Implement placeOrder Cloud Function
  - [ ] Subscription validation
  - [ ] Plan feature validation
  - [ ] Item pricing validation
  - [ ] Delivery rule enforcement
  - [ ] Coupon validation & discount calculation
  - [ ] Order number & token generation
  - [ ] Dynamic prep time calculation
  - [ ] Firestore write
  - [ ] RTDB mirror
  - [ ] Daily report increment
- [ ] Build order confirmation page
  - [ ] Push notification permission request
  - [ ] Dynamic estimated time display
- [ ] Build order tracking page (PRIME+)
- [ ] Implement customer order cancellation (NEW status only)
- [ ] Build repeat order / reorder feature
- [ ] Build customer feedback form (post-completion)
- [ ] Implement push notifications via FCM
- [ ] Implement QR code generation
- [ ] Configure PWA manifest + Service Worker
- [ ] Implement rate limiting
- [ ] Add CAPTCHA protection
- [ ] Mobile responsiveness testing
- [ ] Performance optimization (<2s load)

---

> **Previous**: [← Phase 3 — Admin Dashboard](./phase-3-admin-dashboard.md)  
> **Next**: [Phase 5 — KDS, Orders & Real-time →](./phase-5-kds-orders-realtime.md)
