# Phase 3 — Restaurant Admin Dashboard

---

## 1. Dashboard Overview

The Restaurant Admin Dashboard is the primary management interface for restaurant owners. It provides a single-admin panel for managing menus, viewing orders, configuring settings, and accessing reports.

### Access Control
- **Auth**: Firebase Auth (Email OTP / Email+Password)
- **Role**: `RESTAURANT_ADMIN` custom claim
- **Tenant**: All data scoped by `restaurantId` from custom claims
- **Features**: Plan-gated (LITE / PRIME / SUPER)

---

## 2. Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│  🍽️ [Restaurant Name]              [Notifications] [Profile]│
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ 📊 Home  │   [Main Content Area]                             │
│ 📋 Orders│                                                   │
│ 🍕 Menu  │                                                   │
│ 📊 KDS   │  ← PRIME+ only                                   │
│ 📈 Reports│ ← PRIME+ only                                   │
│ 🎁 Combos│  ← SUPER only                                    │
│ ⭐ Loyalty│ ← SUPER only                                    │
│ 🪑 Tables│  ← SUPER only                                    │
│ 📢 Announce│                                                 │
│ ⚙️ Settings│                                                 │
│ 💳 Subs  │                                                   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

Navigation items are conditionally rendered based on the restaurant's current plan.

---

## 3. Screens & Features

### 3.1 Dashboard Home

**Route**: `/admin/dashboard`

| Widget | Description | Plan |
|--------|-------------|------|
| **🟢 Kitchen Status** | **Open/Closed toggle (prominent, top of page)** | **All** |
| Today's Orders | Count + trend | All |
| Today's Revenue | Total ₹ amount | All |
| Pending Orders | Orders needing attention | All |
| Subscription Status | Plan, expiry, days remaining | All |
| Quick Actions | New order, menu toggle | All |
| Top Items Today | Visual chart | PRIME+ |
| Order Type Split | Pie chart | PRIME+ |
| Revenue Trend | 7-day line chart | SUPER |

#### Kitchen Status Toggle (Always Visible)

The kitchen status toggle is the **most prominent element** on the admin dashboard home. It appears as a large banner at the top of the page.

```
┌──────────────────────────────────────────────────────────────┐
│  🟢 Kitchen is OPEN                         [Close Kitchen]  │
│  Accepting orders since 9:00 AM                              │
└──────────────────────────────────────────────────────────────┘

— OR (when closed) —

┌──────────────────────────────────────────────────────────────┐
│  🔴 Kitchen is CLOSED                        [Open Kitchen]  │
│  Reason: Staff unavailable                                    │
│  Reopens at: 6:00 PM today (auto)                            │
└──────────────────────────────────────────────────────────────┘
```

**Close Kitchen** triggers a modal:
- Reason (dropdown + custom text): Holiday, Staff unavailable, Maintenance, Emergency, Custom
- Scheduled Reopen (optional): Date + time picker for auto-reopen
- Confirm button: "Close Kitchen"

**Cloud Function — Toggle Kitchen Status**:

```typescript
// functions/src/restaurants/toggleKitchenStatus.ts

export const toggleKitchenStatus = functions.https.onCall(async (data, context) => {
  requireAuth(context, 'RESTAURANT_ADMIN');
  
  const restaurantId = context.auth.token.restaurantId;
  const { isOpen, closedReason, scheduledReopen } = data;
  
  const restaurantRef = admin.firestore().collection('restaurants').doc(restaurantId);
  
  if (isOpen) {
    // Opening kitchen
    await restaurantRef.update({
      'kitchenStatus.isOpen': true,
      'kitchenStatus.closedReason': admin.firestore.FieldValue.delete(),
      'kitchenStatus.closedAt': admin.firestore.FieldValue.delete(),
      'kitchenStatus.closedBy': admin.firestore.FieldValue.delete(),
      'kitchenStatus.scheduledReopen': admin.firestore.FieldValue.delete(),
    });
  } else {
    // Closing kitchen
    await restaurantRef.update({
      'kitchenStatus.isOpen': false,
      'kitchenStatus.closedReason': closedReason || 'Temporarily closed',
      'kitchenStatus.closedAt': admin.firestore.FieldValue.serverTimestamp(),
      'kitchenStatus.closedBy': context.auth.uid,
      ...(scheduledReopen && {
        'kitchenStatus.scheduledReopen': admin.firestore.Timestamp.fromDate(new Date(scheduledReopen)),
      }),
    });
  }
  
  // Audit log
  await logAudit({
    action: isOpen ? 'KITCHEN_OPENED' : 'KITCHEN_CLOSED',
    performedBy: context.auth.uid,
    restaurantId,
    details: { closedReason, scheduledReopen },
  });
  
  return { status: isOpen ? 'OPEN' : 'CLOSED' };
});

// Scheduled function: Auto-reopen kitchens
export const autoReopenKitchens = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    
    const restaurants = await admin.firestore()
      .collection('restaurants')
      .where('kitchenStatus.isOpen', '==', false)
      .where('kitchenStatus.scheduledReopen', '<=', now)
      .get();
    
    const batch = admin.firestore().batch();
    restaurants.docs.forEach(doc => {
      batch.update(doc.ref, {
        'kitchenStatus.isOpen': true,
        'kitchenStatus.closedReason': admin.firestore.FieldValue.delete(),
        'kitchenStatus.scheduledReopen': admin.firestore.FieldValue.delete(),
      });
    });
    
    await batch.commit();
    console.log(`Auto-reopened ${restaurants.size} kitchens`);
  });
```

### 3.2 Orders Management

**Route**: `/admin/orders`

#### Order List View
- Tab-based filtering: All | New | Preparing | Ready | Completed | Cancelled
- Date picker for historical orders
- Search by order number, customer name/phone
- Real-time badge counts on tabs (via RTDB)

#### Order Card Design

```
┌─────────────────────────────────────────────┐
│ #ORD-20260210-001    Token: 15    🟢 NEW    │
│ ─────────────────────────────────────────── │
│ 📦 TAKEAWAY           12:30 PM              │
│ 👤 Rahul Kumar | 📞 9876543210              │
│ ─────────────────────────────────────────── │
│ 2x Butter Chicken (Full)        ₹560.00     │
│ 1x Garlic Naan                  ₹ 60.00     │
│ 1x Raita                        ₹ 40.00     │
│ ─────────────────────────────────────────── │
│ Subtotal: ₹660.00                           │
│ Delivery:   ₹0.00                           │
│ Total:    ₹660.00                           │
│ Payment: Cash (Pending)                      │
│ ─────────────────────────────────────────── │
│ [Accept] [Reject]        [Print Bill]        │
└─────────────────────────────────────────────┘
```

#### Order Actions

| Action | Available Status | Result Status |
|--------|-----------------|---------------|
| Accept | NEW | CONFIRMED |
| Start Preparing | CONFIRMED | PREPARING |
| Mark Ready | PREPARING | READY |
| Mark Complete | READY | COMPLETED |
| Cancel | NEW, CONFIRMED | CANCELLED |
| Collect Payment | Any (pending) | Payment = COLLECTED |

```typescript
// functions/src/orders/updateOrderStatus.ts

export const updateOrderStatus = functions.https.onCall(async (data, context) => {
  requireRestaurantAdmin(context);
  
  const { orderId, newStatus, cancelReason } = data;
  const restaurantId = context.auth.token.restaurantId;
  
  // 1. Fetch order
  const orderRef = admin.firestore().collection('orders').doc(orderId);
  const order = await orderRef.get();
  
  if (!order.exists || order.data()!.restaurantId !== restaurantId) {
    throw error('Order not found');
  }
  
  // 2. Validate status transition
  const validTransitions = {
    NEW: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY'],
    READY: ['COMPLETED'],
  };
  
  const currentStatus = order.data()!.status;
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw error(`Cannot transition from ${currentStatus} to ${newStatus}`);
  }
  
  // 3. Build update
  const update: any = {
    status: newStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  const timestampFields = {
    CONFIRMED: 'confirmedAt',
    PREPARING: 'preparingAt',
    READY: 'readyAt',
    COMPLETED: 'completedAt',
    CANCELLED: 'cancelledAt',
  };
  
  update[timestampFields[newStatus]] = admin.firestore.FieldValue.serverTimestamp();
  
  if (newStatus === 'CANCELLED' && cancelReason) {
    update.cancelReason = cancelReason;
  }
  
  // 4. Update Firestore
  await orderRef.update(update);
  
  // 5. Mirror to RTDB
  await admin.database()
    .ref(`live_orders/${restaurantId}/${orderId}`)
    .update({ status: newStatus });
  
  // 6. If completed, update daily report
  if (newStatus === 'COMPLETED') {
    await updateDailyReport(restaurantId, order.data()!);
  }
  
  return { success: true };
});
```

### 3.3 Menu Management

**Route**: `/admin/menu`

#### Features

| Feature | Description | Plan |
|---------|-------------|------|
| Add Item | Name, price, category, image, veg/non-veg | All |
| Edit Item | Modify any field | All |
| Delete Item | Soft delete (isActive = false) | All |
| Categories | Create/edit/reorder categories | All |
| Variants | Add size/portion variants (Half/Full) | All |
| Add-ons | Extra toppings, sides etc. | All |
| Reorder Items | Drag & drop display order | All |
| Toggle Availability | Mark item available/unavailable | PRIME+ |
| Item Count Limit | Max 50 items on LITE plan | LITE |
| Bulk CSV Import | Upload menu items via CSV file | All |
| Dietary Tags | Jain, Vegan, Gluten-free, Nut-free, Dairy-free | All |
| Multi-Language | Menu item names/descriptions in Hindi + regional languages | All |
| Sample Templates | Pre-built menus for common restaurant types | All |

#### Menu Item Form

```
┌──────────────────────────────────────────┐
│ Add New Menu Item                        │
├──────────────────────────────────────────┤
│ Category:    [Dropdown ▼]                │
│ Item Name:   [___________________]       │
│ Description: [___________________]       │
│ Price (₹):   [___________]               │
│ Type:        ○ Veg  ○ Non-Veg           │
│ Image:       [Upload 📷]                 │
│ Prep Time:   [__ mins]                   │
│                                          │
│ ── Dietary Tags ──                       │
│ □ Jain  □ Vegan  □ Gluten-Free          │
│ □ Nut-Free  □ Dairy-Free                │
│                                          │
│ ── Variants (optional) ──                │
│ [+ Add Variant]                          │
│  Half: ₹[___]  Full: ₹[___]             │
│                                          │
│ ── Add-ons (optional) ──                 │
│ [+ Add Add-on]                           │
│  Extra Cheese: ₹[___]                    │
│                                          │
│ Tags: □ Bestseller □ Spicy □ New         │
│                                          │
│         [Cancel]  [Save Item]            │
└──────────────────────────────────────────┘
```

#### Cloud Function: Menu Operations

```typescript
// functions/src/menus/menuOperations.ts

export const addMenuItem = functions.https.onCall(async (data, context) => {
  requireRestaurantAdmin(context);
  const restaurantId = context.auth.token.restaurantId;
  
  // 1. Check plan-based item limit
  const restaurant = await getRestaurant(restaurantId);
  if (restaurant.currentPlan === 'LITE') {
    const itemCount = await getMenuItemCount(restaurantId);
    if (itemCount >= 50) {
      throw error('LITE plan limited to 50 menu items. Upgrade to add more.');
    }
  }
  
  // 2. Validate & sanitize input
  const item = validateMenuItem(data);
  
  // 3. Upload image if provided
  if (data.image) {
    item.imageUrl = await uploadMenuImage(restaurantId, data.image);
  }
  
  // 4. Save to Firestore
  const itemRef = admin.firestore()
    .collection('menus')
    .doc(restaurantId)
    .collection('items')
    .doc();
  
  await itemRef.set({
    ...item,
    id: itemRef.id,
    restaurantId,
    isAvailable: true,
    isActive: true,
    displayOrder: await getNextDisplayOrder(restaurantId, item.category),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return { itemId: itemRef.id };
});

export const toggleItemAvailability = functions.https.onCall(async (data, context) => {
  requireRestaurantAdmin(context);
  const restaurantId = context.auth.token.restaurantId;
  
  // Check PRIME+ plan
  const restaurant = await getRestaurant(restaurantId);
  if (restaurant.currentPlan === 'LITE') {
    throw error('Item availability control requires PRIME or SUPER plan');
  }
  
  const { itemId, isAvailable } = data;
  
  await admin.firestore()
    .collection('menus')
    .doc(restaurantId)
    .collection('items')
    .doc(itemId)
    .update({ 
      isAvailable, 
      updatedAt: admin.firestore.FieldValue.serverTimestamp() 
    });
  
  return { success: true };
});
```

### 3.4 Settings

**Route**: `/admin/settings`

#### Restaurant Profile Settings
- Restaurant name, address, phone
- Logo upload
- GSTIN (optional)
- Operating hours

#### Order Settings
- Order types toggle (Takeaway, Delivery, Dine-in)
- Delivery charge (PRIME+)
- Minimum order amount for delivery (PRIME+)
- Auto-accept orders toggle
- Payment modes (Cash, UPI, Online)

#### Notification Settings
- Order notification sound
- Browser notifications toggle

#### Account Settings
- Change admin email address
- Change admin phone number
- Change password (via Firebase Auth)
- Password reset via email link

### 3.5 Subscription Info

**Route**: `/admin/subscription`

| Info | Description |
|------|-------------|
| Current Plan | LITE / PRIME / SUPER |
| Status | Active / Grace / Expired |
| Validity | Start → End date |
| Days Remaining | Countdown |
| Add-ons | Online Payment (active/inactive) |
| Contact Sales | Button to request upgrade/renewal |

### 3.6 Order Export (CSV/Excel)

**Route**: `/admin/orders` (Export button)

Admin can export order history to CSV/Excel for bookkeeping:

**Export Options:**
- Date range picker (Today, This Week, This Month, Custom)
- Filter by status, order type, payment mode
- Format: CSV or Excel
- Columns: Order Number, Date, Time, Type, Customer, Phone, Items, Subtotal, Delivery, Discount, Total, Payment Mode, Payment Status, Order Status

### 3.7 Menu Bulk Import (CSV)

**Route**: `/admin/menu/import`

| Column | Required | Example |
|--------|----------|--------|
| Name | ✅ | Butter Chicken |
| Category | ✅ | Main Course |
| Price | ✅ | 350 (in ₹) |
| Veg/Non-Veg | ✅ | Veg / Non-Veg |
| Description | ❌ | Rich creamy gravy |
| Variant Names | ❌ | Half, Full |
| Variant Prices | ❌ | 200, 350 |
| Dietary Tags | ❌ | Jain, Vegan |
| Tags | ❌ | Bestseller, Spicy |

**Flow:** Download sample CSV → Fill menu → Upload → Preview & validate → Confirm import

### 3.8 Multi-Language Menu Support

Languages: Hindi, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, Gujarati, Punjabi  
Default: English (always required) | Fallback: English if translation missing  
Customer selects language via toggle on menu page header.

### 3.9 Announcements & Banners

**Route**: `/admin/announcements`

Admin creates banners/notices shown on the customer menu page:
- Type: Banner, Popup, or Notice
- Custom colors (background + text)
- Scheduling (valid from / until)
- Position: Top or Bottom of menu

### 3.10 Guided Setup Wizard

For new admins (especially self-signup), a 6-step onboarding wizard:

① Restaurant Profile → ② Upload Logo → ③ Set Hours → ④ Add Menu (manual / CSV / template) → ⑤ Payment Settings → ⑥ Generate & Print QR → ✅ Ready!

### 3.11 Sample Menu Templates

Pre-built menus for common restaurant types:

| Template | Items | Categories |
|----------|-------|------------|
| North Indian | 40 | Starters, Main Course, Breads, Rice, Desserts, Beverages |
| South Indian | 35 | Dosas, Idlis, Vadas, Rice Items, Thalis, Beverages |
| Chinese | 30 | Starters, Soups, Noodles, Rice, Main Course, Desserts |
| Cafe & Bakery | 30 | Hot/Cold Beverages, Snacks, Sandwiches, Cakes, Pastries |
| Pizza & Fast Food | 25 | Pizzas, Burgers, Sides, Beverages, Combos |
| Biryani House | 20 | Biryanis, Kebabs, Raitas, Breads, Beverages |

---

## 4. Admin Frontend Architecture

### 4.1 Route Structure

```
/admin
├── /login                    # Login page
├── /forgot-password          # Password reset flow
├── /setup-wizard             # Guided onboarding (new admins)
├── /dashboard                # Home dashboard
├── /orders                   # Order management
│   ├── /:orderId             # Order detail
│   └── /export               # Order export (CSV/Excel)
├── /menu                     # Menu management
│   ├── /new                  # Add item
│   ├── /:itemId/edit         # Edit item
│   ├── /import               # Bulk CSV import
│   └── /translations         # Multi-language management
├── /kds                      # KDS screen (PRIME+)
├── /reports                  # Reports (PRIME+)
│   ├── /daily                # Daily reports
│   └── /monthly              # Monthly reports
├── /combos                   # Combo deals (SUPER)
├── /loyalty                  # Loyalty program (SUPER)
├── /tables                   # Table management (SUPER)
├── /announcements            # Banners & announcements
├── /settings                 # Restaurant settings
│   ├── /profile              # Profile & branding
│   ├── /orders               # Order configuration
│   ├── /payments             # Payment settings
│   └── /account              # Admin account (email, password)
└── /subscription             # Subscription info
```

### 4.2 Context Providers

```typescript
// context/AuthContext.tsx — User auth state + custom claims
// context/RestaurantContext.tsx — Restaurant data + plan features
// context/OrderContext.tsx — Real-time order counts + notifications
// context/OnboardingContext.tsx — Setup wizard progress tracking
```

### 4.3 Plan-Gated Component

```typescript
// components/PlanGate.tsx

interface PlanGateProps {
  requiredPlan: 'LITE' | 'PRIME' | 'SUPER';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PLAN_HIERARCHY = { LITE: 0, PRIME: 1, SUPER: 2 };

export function PlanGate({ requiredPlan, children, fallback }: PlanGateProps) {
  const { restaurant } = useRestaurant();
  const currentLevel = PLAN_HIERARCHY[restaurant.currentPlan];
  const requiredLevel = PLAN_HIERARCHY[requiredPlan];
  
  if (currentLevel >= requiredLevel) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : (
    <UpgradePrompt 
      feature={requiredPlan} 
      currentPlan={restaurant.currentPlan} 
    />
  );
}
```

---

## 5. Implementation Checklist

- [ ] Build admin authentication flow
  - [ ] Login page
  - [ ] Password reset via email link
  - [ ] Admin account settings (change email/phone/password)
- [ ] Create admin layout with responsive sidebar
- [ ] Implement plan-gated navigation
- [ ] Build Dashboard Home with widgets
  - [ ] Kitchen Open/Close toggle banner (prominent, top of page)
  - [ ] Close Kitchen modal (reason dropdown + scheduled reopen picker)
  - [ ] toggleKitchenStatus Cloud Function
  - [ ] autoReopenKitchens scheduled function (every 5 min)
- [ ] Build Orders management page
  - [ ] Order list with filters/tabs
  - [ ] Order detail view
  - [ ] Status update actions
  - [ ] Payment collection
  - [ ] Order export to CSV/Excel
- [ ] Build Menu management
  - [ ] Category management
  - [ ] Menu item CRUD
  - [ ] Image upload
  - [ ] Variant & add-on management
  - [ ] Dietary tags (Jain, Vegan, Gluten-free)
  - [ ] Availability toggle (PRIME+)
  - [ ] Display order (drag & drop)
  - [ ] Bulk CSV import & validation
  - [ ] Multi-language translations
  - [ ] Sample menu templates (6 cuisine types)
- [ ] Build Announcements management
  - [ ] Create/edit/delete banners
  - [ ] Color picker & scheduling
  - [ ] Preview on customer menu
- [ ] Build Settings pages
  - [ ] Restaurant profile
  - [ ] Order configuration
  - [ ] Payment settings
  - [ ] Account settings (email, password)
- [ ] Build Subscription info page
- [ ] Build guided setup wizard (6 steps)
- [ ] Create Cloud Functions for all admin operations
  - [ ] Order export Cloud Function
  - [ ] Menu import (CSV) Cloud Function
  - [ ] Announcement CRUD Cloud Functions
- [ ] Add real-time order notification
- [ ] Test LITE item limit enforcement
- [ ] Test plan-gated feature access
- [ ] Test CSV import with edge cases
- [ ] Test order export accuracy

---

> **Previous**: [← Phase 2 — Auth & Sales Dashboard](./phase-2-auth-sales-dashboard.md)  
> **Next**: [Phase 4 — Customer Ordering →](./phase-4-customer-ordering.md)
