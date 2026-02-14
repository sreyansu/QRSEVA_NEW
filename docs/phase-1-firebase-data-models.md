# Phase 1 — Firebase Setup & Data Models

---

## 1. Firebase Project Setup

### 1.1 Project Configuration

```
Project Name: qrseva-prod
Project ID:   qrseva-prod
Region:       asia-south1 (Mumbai)
```

### 1.2 Services to Enable

| Service | Purpose |
|---------|---------|
| Cloud Firestore | Primary database |
| Realtime Database | Live order feeds |
| Firebase Authentication | Admin & sales login |
| Cloud Functions | Backend logic |
| Firebase Hosting | Frontend deployment |
| Cloud Storage | Menu images, logos |

### 1.3 Firebase CLI Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login & initialize
firebase login
firebase init

# Select services:
# ✅ Firestore
# ✅ Realtime Database  
# ✅ Functions (TypeScript)
# ✅ Hosting
# ✅ Storage

# Set region in functions
export FIREBASE_CONFIG='{"projectId":"qrseva-prod","region":"asia-south1"}'
```

### 1.4 Environment Configuration

```typescript
// functions/src/config.ts
export const CONFIG = {
  region: 'asia-south1',
  firestore: {
    ordersCollection: 'orders',
    restaurantsCollection: 'restaurants',
    menusCollection: 'menus',
    subscriptionsCollection: 'subscriptions',
    salesUsersCollection: 'sales_users',
    paymentsCollection: 'payments',
    auditLogsCollection: 'audit_logs',
    reportsCollection: 'reports',
  },
  rtdb: {
    liveOrdersPath: 'live_orders',
  },
  subscription: {
    gracePeriodDays: 3,
  },
  rateLimit: {
    ordersPerMinute: 10,
    ordersPerHour: 100,
  },
};
```

---

## 2. Firestore Data Models

### 2.1 Collection: `restaurants`

```typescript
interface Restaurant {
  id: string;                    // Auto-generated document ID
  name: string;                  // Restaurant name
  slug: string;                  // URL-friendly name (unique)
  phone: string;                 // Contact phone
  email: string;                 // Admin email (linked to Firebase Auth)
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  logo?: string;                 // Cloud Storage URL
  gstin?: string;                // GST number (optional)
  isActive: boolean;             // Master toggle (set by sales team)
  kitchenStatus: {
    isOpen: boolean;              // Kitchen accepting orders? (set by restaurant admin)
    closedReason?: string;        // Optional reason: 'Holiday', 'Staff unavailable', etc.
    closedAt?: Timestamp;         // When kitchen was closed
    closedBy?: string;            // UID of admin who closed
    scheduledReopen?: Timestamp;  // Auto-reopen at this time (optional)
  };
  subscriptionId: string;        // Reference to active subscription
  currentPlan: 'LITE' | 'PRIME' | 'SUPER';
  planFeatures: {                // Denormalized for fast access
    kds: boolean;
    orderTokens: boolean;
    liveStatus: boolean;
    itemAvailability: boolean;
    deliveryCharge: boolean;
    minimumOrder: boolean;
    reports: boolean;
    basicBill: boolean;
    fullBill: boolean;
    dineIn: boolean;
    tableManagement: boolean;
    combos: boolean;
    loyalty: boolean;
    advancedAnalytics: boolean;
    maxMenuItems: number;        // 50 for LITE, unlimited for others
  };
  settings: {
    deliveryCharge: number;      // Flat fee (0 for LITE)
    minimumOrderAmount: number;  // 0 for LITE
    orderTypes: {
      takeaway: boolean;
      delivery: boolean;
      dineIn: boolean;           // Only SUPER
    };
    paymentModes: {
      cash: boolean;
      upi: boolean;
      online: boolean;           // Add-on required
    };
    operatingHours: {
      open: string;              // "09:00"
      close: string;             // "22:00"
      timezone: string;          // "Asia/Kolkata"
      closedDays: number[];      // Days of week restaurant is closed [0=Sun, 6=Sat]
    };
    autoAcceptOrders: boolean;
  };
  tables?: {                     // SUPER plan only
    count: number;
    list: TableConfig[];
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // Sales user ID who onboarded
}

interface TableConfig {
  tableId: string;               // "T1", "T2", etc.
  tableName: string;             // "Table 1"
  qrCodeUrl: string;             // Generated QR code URL
  seats: number;
  isActive: boolean;
}
```

### 2.2 Collection: `menus/{restaurantId}/items`

```typescript
interface MenuItem {
  id: string;                    // Auto-generated
  restaurantId: string;          // Parent restaurant
  name: string;                  // Item name
  description?: string;          // Short description
  price: number;                 // Price in paisa (₹100 = 10000)
  category: string;              // "Starters", "Main Course", etc.
  subcategory?: string;          // Optional subcategory
  imageUrl?: string;             // Cloud Storage URL
  isVeg: boolean;                // Veg indicator
  dietaryTags?: ('JAIN' | 'VEGAN' | 'GLUTEN_FREE' | 'NUT_FREE' | 'DAIRY_FREE')[];
  isAvailable: boolean;          // Availability toggle (PRIME+)
  tags?: string[];               // "Bestseller", "Spicy", "New"
  variants?: ItemVariant[];      // Size/portion variants
  addons?: ItemAddon[];          // Extra cheese, etc.
  prepTime?: number;             // Estimated preparation time in minutes
  displayOrder: number;          // Sort order in menu
  isActive: boolean;             // Soft delete flag
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ItemVariant {
  name: string;                  // "Half", "Full", "Family"
  price: number;                 // Price in paisa
}

interface ItemAddon {
  name: string;                  // "Extra Cheese"
  price: number;                 // Price in paisa
}
```

### 2.3 Collection: `orders`

```typescript
interface Order {
  id: string;                    // Auto-generated
  restaurantId: string;          // Restaurant reference
  orderNumber: string;           // Human-readable: "ORD-20260210-001"
  tokenNumber: number;           // Daily sequential token (PRIME+)
  
  type: 'TAKEAWAY' | 'DELIVERY' | 'DINE_IN';
  status: 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  
  // Customer info (guest — no auth)
  customer: {
    name: string;
    phone: string;
    address?: {                  // For delivery orders
      line1: string;
      line2?: string;
      city: string;
      pincode: string;
      landmark?: string;
    };
  };
  
  // Table info (SUPER plan, dine-in only)
  table?: {
    tableId: string;
    tableName: string;
  };
  
  // Order items (snapshot at order time — immutable)
  items: OrderItem[];
  
  // Pricing
  subtotal: number;              // Sum of items (paisa)
  deliveryCharge: number;        // 0 if not delivery or LITE
  discount: number;              // Combo/loyalty discounts
  totalAmount: number;           // Final amount (paisa)
  
  // Payment
  payment: {
    mode: 'CASH' | 'UPI' | 'ONLINE' | 'PAY_ON_PICKUP';
    status: 'PENDING' | 'COLLECTED' | 'FAILED';
    collectedAt?: Timestamp;
    collectedBy?: string;        // 'COUNTER' | 'WAITER_LINK'
    transactionId?: string;      // For online payments
  };
  
  // Metadata
  placedAt: Timestamp;
  confirmedAt?: Timestamp;
  preparedAt?: Timestamp;
  readyAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancelReason?: string;
  
  // Plan at time of order (for audit)
  planAtOrder: 'LITE' | 'PRIME' | 'SUPER';
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface OrderItem {
  menuItemId: string;
  name: string;                  // Snapshot
  price: number;                 // Snapshot (paisa)
  quantity: number;
  variant?: string;              // Selected variant name
  variantPrice?: number;         // Variant price (paisa)
  addons?: {
    name: string;
    price: number;               // paisa
  }[];
  itemTotal: number;             // (price + variantPrice + addons) * qty
  isVeg: boolean;                // Snapshot
  specialInstructions?: string;
}
```

### 2.4 Collection: `subscriptions`

```typescript
interface Subscription {
  id: string;                    // Auto-generated
  restaurantId: string;          // Restaurant reference
  plan: 'LITE' | 'PRIME' | 'SUPER';
  
  status: 'ACTIVE' | 'EXPIRED' | 'GRACE' | 'CANCELLED';
  
  startDate: Timestamp;
  endDate: Timestamp;
  gracePeriodEnd: Timestamp;     // endDate + 3 days
  
  duration: 1 | 3 | 6 | 12;     // Months
  amount: number;                // Paid amount (paisa)
  
  addons: {
    onlinePayment: boolean;      // ₹299/mo add-on
  };
  
  // Payment record
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'ONLINE';
  paymentReference?: string;
  
  activatedBy: string;           // Sales user ID
  activatedAt: Timestamp;
  
  // History
  previousSubscriptionId?: string;
  renewalCount: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.5 Collection: `payments`

```typescript
interface Payment {
  id: string;
  restaurantId: string;
  subscriptionId: string;
  
  type: 'SUBSCRIPTION' | 'ADDON' | 'RENEWAL';
  amount: number;                // paisa
  
  method: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'ONLINE';
  reference?: string;            // Transaction ref
  
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';
  
  recordedBy: string;            // Sales user ID
  confirmedBy?: string;          // Sales admin ID
  
  notes?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.6 Collection: `sales_users`

```typescript
interface SalesUser {
  id: string;                    // Matches Firebase Auth UID
  email: string;
  name: string;
  phone: string;
  role: 'SALES_ADMIN' | 'SALES_USER';
  
  isActive: boolean;
  mustChangePassword: boolean;   // True on first login
  
  // Stats
  restaurantsOnboarded: number;
  subscriptionsActivated: number;
  
  createdBy: string;             // Sales admin ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

### 2.7 Collection: `audit_logs`

```typescript
interface AuditLog {
  id: string;
  action: string;                // 'RESTAURANT_CREATED', 'SUBSCRIPTION_ACTIVATED', etc.
  performedBy: string;           // User ID
  performedByRole: 'SALES_ADMIN' | 'SALES_USER' | 'RESTAURANT_ADMIN';
  
  targetType: 'RESTAURANT' | 'SUBSCRIPTION' | 'MENU' | 'ORDER' | 'SALES_USER';
  targetId: string;
  
  details: Record<string, any>;  // Action-specific data
  
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: Timestamp;
}
```

### 2.8 Collection: `reports/{restaurantId}/daily`

```typescript
interface DailyReport {
  id: string;                    // Format: "2026-02-10"
  restaurantId: string;
  date: string;                  // "2026-02-10"
  
  orders: {
    total: number;
    byType: {
      takeaway: number;
      delivery: number;
      dineIn: number;
    };
    byStatus: {
      completed: number;
      cancelled: number;
    };
  };
  
  revenue: {
    total: number;               // paisa
    byType: {
      takeaway: number;
      delivery: number;
      dineIn: number;
    };
    deliveryCharges: number;
    discounts: number;
  };
  
  payments: {
    cash: number;
    upi: number;
    online: number;
    payOnPickup: number;
  };
  
  items: {
    topSelling: {
      menuItemId: string;
      name: string;
      quantity: number;
      revenue: number;
    }[];
    totalItemsSold: number;
  };
  
  // SUPER plan analytics
  peakHours?: {
    hour: number;                // 0-23
    orders: number;
  }[];
  
  averageOrderValue: number;     // paisa
  
  generatedAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.9 Collection: `reports/{restaurantId}/monthly`

```typescript
interface MonthlyReport {
  id: string;                    // Format: "2026-02"
  restaurantId: string;
  month: string;                 // "2026-02"
  
  // Aggregated from daily reports
  orders: {
    total: number;
    averagePerDay: number;
    byType: { takeaway: number; delivery: number; dineIn: number; };
    byStatus: { completed: number; cancelled: number; };
  };
  
  revenue: {
    total: number;
    averagePerDay: number;
    byType: { takeaway: number; delivery: number; dineIn: number; };
    growth: number;              // % change from previous month
  };
  
  items: {
    topSelling: { menuItemId: string; name: string; quantity: number; revenue: number; }[];
    totalItemsSold: number;
  };
  
  // SUPER plan
  trends?: {
    peakDays: string[];          // Days of week with most orders
    peakHours: number[];         // Hours with most orders
    revenueByWeek: number[];     // Weekly breakdown
  };
  
  generatedAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.10 Collection: `coupons/{restaurantId}/codes`

```typescript
interface Coupon {
  id: string;                    // Auto-generated
  restaurantId: string;
  code: string;                  // "WELCOME50", "FLAT100" (unique per restaurant)
  type: 'PERCENTAGE' | 'FLAT';   // Discount type
  value: number;                 // Percentage (0-100) or flat amount (paisa)
  minOrderAmount: number;        // Minimum order to apply (paisa), 0 = no minimum
  maxDiscount?: number;          // Max discount cap for percentage coupons (paisa)
  usageLimit: number;            // Total usage limit (0 = unlimited)
  perCustomerLimit: number;      // Usage limit per phone number (0 = unlimited)
  usedCount: number;             // Current total usage count
  validFrom: Timestamp;
  validUntil: Timestamp;
  applicableOrderTypes: ('TAKEAWAY' | 'DELIVERY' | 'DINE_IN')[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CouponUsage {
  id: string;
  couponId: string;
  restaurantId: string;
  orderId: string;
  customerPhone: string;
  discountApplied: number;       // paisa
  usedAt: Timestamp;
}
```

### 2.11 Collection: `feedback/{restaurantId}/reviews`

```typescript
interface CustomerFeedback {
  id: string;                    // Auto-generated
  restaurantId: string;
  orderId: string;
  customerPhone: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;   // Star rating
  comment?: string;              // Optional text feedback (max 500 chars)
  tags?: ('GOOD_FOOD' | 'FAST_SERVICE' | 'GOOD_PACKAGING' | 'VALUE_FOR_MONEY' |
          'LATE_DELIVERY' | 'WRONG_ORDER' | 'COLD_FOOD' | 'BAD_PACKAGING')[];
  isPublic: boolean;             // Whether to show on menu page
  adminReply?: string;           // Admin response (future)
  createdAt: Timestamp;
}
```

### 2.12 Collection: `announcements/{restaurantId}/banners`

```typescript
interface Announcement {
  id: string;
  restaurantId: string;
  type: 'BANNER' | 'POPUP' | 'NOTICE';
  title: string;                 // "Today's Special", "Closed Tomorrow"
  message: string;               // Banner text content
  bgColor?: string;              // Custom background color (hex)
  textColor?: string;            // Custom text color (hex)
  linkUrl?: string;              // Optional CTA link
  position: 'TOP' | 'BOTTOM';   // Display position on customer menu
  isActive: boolean;
  validFrom?: Timestamp;
  validUntil?: Timestamp;
  displayOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.13 Collection: `delivery_zones/{restaurantId}/zones`

```typescript
interface DeliveryZone {
  id: string;
  restaurantId: string;
  name: string;                  // "Zone 1 - Nearby", "Zone 2 - Extended"
  pincodes: string[];            // Serviceable pincodes
  deliveryCharge: number;        // Charge for this zone (paisa)
  estimatedTime: number;         // Estimated delivery time in minutes
  minimumOrder: number;          // Zone-specific minimum order (paisa)
  isActive: boolean;
  displayOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.14 Collection: `subscription_invoices`

```typescript
interface SubscriptionInvoice {
  id: string;                    // Auto-generated
  invoiceNumber: string;         // "INV-2026-00001"
  restaurantId: string;
  subscriptionId: string;
  paymentId: string;

  // Restaurant details (snapshot)
  restaurantName: string;
  restaurantAddress: string;
  restaurantGstin?: string;

  // Invoice details
  plan: 'LITE' | 'PRIME' | 'SUPER';
  duration: 1 | 3 | 6 | 12;
  periodStart: Timestamp;
  periodEnd: Timestamp;

  // Amounts
  baseAmount: number;            // paisa (before discount)
  discount: number;              // Multi-month discount (paisa)
  addonAmount: number;           // Add-on charges (paisa)
  subtotal: number;              // paisa
  gst: number;                   // 18% GST (paisa)
  totalAmount: number;           // Final amount (paisa)

  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'ONLINE';
  paymentReference?: string;

  generatedBy: string;           // Sales user ID
  generatedAt: Timestamp;
}
```

---

## 3. Realtime Database Structure

```json
{
  "live_orders": {
    "{restaurantId}": {
      "{orderId}": {
        "orderNumber": "ORD-20260210-001",
        "tokenNumber": 1,
        "type": "TAKEAWAY",
        "status": "NEW",
        "customer": {
          "name": "Rahul",
          "phone": "9876543210"
        },
        "items": [
          {
            "name": "Butter Chicken",
            "quantity": 2,
            "variant": "Full",
            "isVeg": false
          }
        ],
        "totalAmount": 56000,
        "placedAt": 1707550000000,
        "table": null
      }
    }
  }
}
```

> **Note**: RTDB stores a **lightweight mirror** of the order — just enough for KDS display and live tracking. The full order object lives in Firestore.

---

## 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // No direct client writes — all through Cloud Functions
    // These rules are for reads only
    
    // Restaurants — admin can read their own
    match /restaurants/{restaurantId} {
      allow read: if request.auth != null && 
                     request.auth.token.restaurantId == restaurantId;
      allow write: if false; // Cloud Functions only
    }
    
    // Menus — public read (for customer ordering), admin write via CF
    match /menus/{restaurantId}/items/{itemId} {
      allow read: if true; // Public for customer menu browsing
      allow write: if false; // Cloud Functions only
    }
    
    // Orders — admin reads their restaurant's orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     resource.data.restaurantId == request.auth.token.restaurantId;
      allow write: if false; // Cloud Functions only
    }
    
    // Subscriptions — admin reads own, sales reads all
    match /subscriptions/{subId} {
      allow read: if request.auth != null && (
        resource.data.restaurantId == request.auth.token.restaurantId ||
        request.auth.token.role in ['SALES_ADMIN', 'SALES_USER']
      );
      allow write: if false;
    }
    
    // Sales users — sales team only
    match /sales_users/{userId} {
      allow read: if request.auth != null && 
                     request.auth.token.role in ['SALES_ADMIN', 'SALES_USER'];
      allow write: if false;
    }
    
    // Audit logs — sales admin only
    match /audit_logs/{logId} {
      allow read: if request.auth != null && 
                     request.auth.token.role == 'SALES_ADMIN';
      allow write: if false;
    }
    
    // Reports — admin reads own restaurant
    match /reports/{restaurantId}/{reportType}/{reportId} {
      allow read: if request.auth != null && 
                     request.auth.token.restaurantId == restaurantId;
      allow write: if false;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 5. RTDB Security Rules

```json
{
  "rules": {
    "live_orders": {
      "$restaurantId": {
        ".read": "auth != null && (auth.token.restaurantId === $restaurantId || auth.token.role === 'SALES_ADMIN')",
        ".write": false
      }
    }
  }
}
```

---

## 6. Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "restaurantId", "order": "ASCENDING" },
        { "fieldPath": "placedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "restaurantId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "placedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "displayOrder", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "restaurantId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 7. Implementation Checklist

- [ ] Create Firebase project (qrseva-prod)
- [ ] Enable Firestore in asia-south1
- [ ] Enable Realtime Database
- [ ] Enable Firebase Auth (Email/Password + Email Link)
- [ ] Enable Cloud Storage
- [ ] Initialize Firebase CLI project locally
- [ ] Deploy Firestore security rules
- [ ] Deploy RTDB security rules
- [ ] Deploy Firestore indexes
- [ ] Configure GCP billing alerts
- [ ] Set up environment variables / secrets
- [ ] Create seed data script for development
- [ ] Create Firestore indexes for new collections (coupons, feedback, announcements, delivery_zones, subscription_invoices)
- [ ] Add security rules for new collections

---

> **Previous**: [← Phase 0 — Overview & Architecture](./phase-0-overview-architecture.md)  
> **Next**: [Phase 2 — Auth & Sales Dashboard →](./phase-2-auth-sales-dashboard.md)
