# QRSeva — Design System & Color Theme

---

## 1. Brand Colors

Derived from the QRSeva logo and Socketix Labs branding.

### Primary Palette

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `--color-primary` | Deep Maroon | `#8B1A1A` | Primary buttons, headers, nav, brand identity |
| `--color-primary-dark` | Dark Maroon | `#6B1414` | Hover states, active elements |
| `--color-primary-light` | Light Maroon | `#A52A2A` | Secondary accents, borders |
| `--color-accent` | Amber Orange | `#F5A623` | Highlights, badges, promotions, star ratings |
| `--color-accent-dark` | Dark Amber | `#D4901E` | Accent hover |
| `--color-success` | Green | `#4CAF50` | Success states, veg indicator, active status |
| `--color-success-light` | Light Green | `#E8F5E9` | Success backgrounds |
| `--color-warning` | Warning Yellow | `#FFC107` | Warnings, grace period alerts |
| `--color-error` | Error Red | `#F44336` | Errors, non-veg indicator, destructive actions |
| `--color-error-light` | Light Red | `#FFEBEE` | Error backgrounds |
| `--color-info` | Info Blue | `#2196F3` | Informational, links, preparing status |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#1A1A2E` | Headings, primary text |
| `--color-text-secondary` | `#555555` | Body text, descriptions |
| `--color-text-muted` | `#888888` | Placeholders, hints |
| `--color-bg-primary` | `#FFFFFF` | Page background |
| `--color-bg-secondary` | `#F8F9FA` | Cards, sections, sidebar |
| `--color-bg-tertiary` | `#EEEEEE` | Dividers, disabled backgrounds |
| `--color-border` | `#E0E0E0` | Borders, separators |
| `--color-border-dark` | `#BDBDBD` | Input borders |
| `--color-shadow` | `rgba(0,0,0,0.08)` | Card shadows |

### KDS Status Colors

| Status | Background | Text |
|--------|-----------|------|
| NEW | `#FFF3E0` | `#E65100` |
| CONFIRMED | `#E3F2FD` | `#1565C0` |
| PREPARING | `#E8F5E9` | `#2E7D32` |
| READY | `#F3E5F5` | `#7B1FA2` |
| COMPLETED | `#ECEFF1` | `#546E7A` |
| CANCELLED | `#FFEBEE` | `#C62828` |

---

## 2. CSS Variables

```css
:root {
  /* Brand Colors */
  --color-primary: #8B1A1A;
  --color-primary-dark: #6B1414;
  --color-primary-light: #A52A2A;
  --color-accent: #F5A623;
  --color-accent-dark: #D4901E;
  
  /* Semantic Colors */
  --color-success: #4CAF50;
  --color-success-light: #E8F5E9;
  --color-warning: #FFC107;
  --color-warning-light: #FFF8E1;
  --color-error: #F44336;
  --color-error-light: #FFEBEE;
  --color-info: #2196F3;
  --color-info-light: #E3F2FD;
  
  /* Text */
  --color-text-primary: #1A1A2E;
  --color-text-secondary: #555555;
  --color-text-muted: #888888;
  --color-text-inverse: #FFFFFF;
  
  /* Backgrounds */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F8F9FA;
  --color-bg-tertiary: #EEEEEE;
  
  /* Borders */
  --color-border: #E0E0E0;
  --color-border-dark: #BDBDBD;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 300;
  --z-modal: 400;
  --z-toast: 500;
}
```

---

## 3. Typography

### Font: Inter (Google Fonts)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

| Element | Size | Weight | Line Height |
|---------|------|--------|------------|
| H1 | 2.5rem (40px) | 700 | 1.2 |
| H2 | 2rem (32px) | 700 | 1.3 |
| H3 | 1.5rem (24px) | 600 | 1.3 |
| H4 | 1.25rem (20px) | 600 | 1.4 |
| Body | 1rem (16px) | 400 | 1.5 |
| Small | 0.875rem (14px) | 400 | 1.5 |
| Caption | 0.75rem (12px) | 400 | 1.4 |

---

## 4. Component Styles

### Buttons

```css
.btn {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}
.btn-primary:hover { background: var(--color-primary-dark); }

.btn-accent {
  background: var(--color-accent);
  color: var(--color-text-primary);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}
.btn-outline:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-ghost { background: transparent; color: var(--color-primary); }
.btn-danger { background: var(--color-error); color: white; }
```

### Cards

```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}
.card:hover { box-shadow: var(--shadow-md); }
```

### Veg/Non-veg Indicators

```css
.veg-indicator {
  width: 16px; height: 16px;
  border: 2px solid var(--color-success);
  border-radius: 2px;
  display: flex; align-items: center; justify-content: center;
}
.veg-indicator::after {
  content: ''; width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-success);
}
.nonveg-indicator { border-color: var(--color-error); }
.nonveg-indicator::after { background: var(--color-error); }
```

### Status Badges

```css
.badge { padding: 4px 12px; border-radius: var(--radius-full); font-size: var(--font-size-xs); font-weight: 600; }
.badge-new { background: #FFF3E0; color: #E65100; }
.badge-confirmed { background: #E3F2FD; color: #1565C0; }
.badge-preparing { background: #E8F5E9; color: #2E7D32; }
.badge-ready { background: #F3E5F5; color: #7B1FA2; }
.badge-completed { background: #ECEFF1; color: #546E7A; }
.badge-cancelled { background: #FFEBEE; color: #C62828; }
```

---

## 5. Layout Breakpoints

| Breakpoint | Min Width | Usage |
|-----------|-----------|-------|
| Mobile | 0px | Customer PWA, default |
| Tablet | 768px | KDS, admin sidebar |
| Desktop | 1024px | Admin dashboard, sales |
| Wide | 1280px | Reports, analytics |

```css
@media (min-width: 768px)  { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
@media (min-width: 1280px) { /* wide */ }
```

---

## 6. Accessibility

- **Contrast ratio**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus indicators**: Visible outline on all interactive elements
- **Touch targets**: Minimum 44×44px on mobile
- **Semantic HTML**: `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`
- **ARIA labels**: On all icon-only buttons and interactive states
- **Color not sole indicator**: Text labels alongside color cues

---

## 7. Iconography

Use **Lucide React** icons (lightweight, consistent):

```bash
npm install lucide-react
```

| Context | Icon |
|---------|------|
| Takeaway | `Package` |
| Delivery | `Truck` |
| Dine-in | `UtensilsCrossed` |
| Veg | `Leaf` |
| Orders | `ShoppingBag` |
| Menu | `BookOpen` |
| Reports | `BarChart3` |
| Settings | `Settings` |
| KDS | `Monitor` |
| Cart | `ShoppingCart` |

---

> **Related**: [← Phase 0 — Architecture](./phase-0-overview-architecture.md) | [README →](./README.md)
