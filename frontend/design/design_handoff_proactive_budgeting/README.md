# Handoff: Proactive Budgeting — MVP v1

## Overview

This is the design handoff for the **Proactive Budgeting** mobile web application — a proactive personal finance app targeting Hungarian young adults (18–35). The app's core differentiator is forward-looking: it warns users *before* they breach a budget, using a spending-pace algorithm, rather than simply showing historical spend like competitors (YNAB, Wallet, Spendee).

The app is built mobile-first (primary viewport: 390×844px) with a Hungarian-language UI.

---

## About the Design Files

The files in this bundle are **HTML/JSX design references** — high-fidelity interactive prototypes showing intended look, layout, and behaviour. They are **not** production code to copy directly.

Your task is to **recreate these designs in the target codebase** using its established patterns:
- **Frontend:** React 19 + TypeScript + Tailwind CSS (per the Execution Plan)
- **Styling:** Translate the CSS variable–based design tokens into Tailwind config values
- **Components:** Recreate each component using the project's existing component library/conventions

The HTML prototypes use React/Babel in the browser and inline CSS — treat them as a pixel-perfect visual spec, not a code template.

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, border radii, shadows, and interaction states are all final. Recreate the UI pixel-precisely using the codebase's patterns. All design token values are specified below.

---

## Design Tokens

### Colors
All colors use OKLCH for perceptual uniformity. Map these to Tailwind custom colors in `tailwind.config.ts`.

```
--c-brand:         oklch(52% 0.22 270)   → Violet primary (#6B4EFF approx)
--c-brand-mid:     oklch(62% 0.20 270)   → Mid violet
--c-brand-light:   oklch(94% 0.06 270)   → Violet tint (bg fills)
--c-brand-dim:     oklch(52% 0.22 270 / 10%)  → Shadow/overlay

--c-safe:          oklch(52% 0.16 155)   → Green (on-track state)
--c-safe-light:    oklch(94% 0.06 155)   → Green tint

--c-warn:          oklch(65% 0.15 72)    → Amber (pace-elevated state)
--c-warn-light:    oklch(95% 0.06 72)    → Amber tint

--c-danger:        oklch(52% 0.18 22)    → Red (breach-predicted state)
--c-danger-light:  oklch(95% 0.06 22)    → Red tint

--c-bg:            oklch(97.5% 0.008 270)   → App background (barely violet white)
--c-surface:       oklch(100% 0 0)           → Card/sheet surface (pure white)
--c-surface-2:     oklch(96.5% 0.01 270)    → Input backgrounds, row fills
--c-border:        oklch(91% 0.012 270)     → Dividers, card borders
--c-text:          oklch(22% 0.025 270)     → Primary text (near-black with cool tint)
--c-muted:         oklch(58% 0.02 270)      → Secondary/label text
--c-muted-2:       oklch(76% 0.015 270)     → Placeholder text
```

### Typography
**Font:** DM Sans (Google Fonts) — weights 300, 400, 500, 600, 700

| Scale | Size | Weight | Use |
|-------|------|--------|-----|
| xs    | 11px | 500    | Badges, captions |
| sm    | 13px | 400–600 | Labels, secondary info |
| base  | 15px | 400–600 | Body text, list items |
| md    | 17px | 600    | Subheadings, nav labels |
| lg    | 20px | 700    | Screen titles |
| xl    | 24px | 700    | Card amounts |
| 2xl   | 32px | 700    | Large numbers |
| hero  | 44px | 700    | Safe-to-spend hero number |

- `letter-spacing: -0.5px` on all headings and large numbers
- `letter-spacing: -1px` or tighter on hero numbers (tabular-nums)
- `font-variant-numeric: tabular-nums` on all currency displays
- `line-height: 1.05` on hero numbers; `1.5–1.6` on body copy

### Spacing
Base unit: 4px. Common values: 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48px

### Border Radius
```
sm:   8px   (small chips, inputs)
md:   12px  (banners, small cards)
lg:   16px  (category cards, main cards)
xl:   24px  (hero section, bottom sheets)
2xl:  32px  (bottom sheet top corners)
full: 999px (badges, progress bars, pills)
```

### Shadows
```
sm: 0 1px 3px oklch(0% 0 0 / 6%), 0 1px 2px oklch(0% 0 0 / 4%)
md: 0 4px 12px oklch(0% 0 0 / 8%), 0 2px 4px oklch(0% 0 0 / 4%)
lg: 0 12px 32px oklch(0% 0 0 / 12%), 0 4px 8px oklch(0% 0 0 / 6%)
```

---

## Screens / Views

### 1. Onboarding Flow (4 steps)

A multi-step onboarding presented as a full-screen flow. Each step slides in from the right. A "Back" button in the top-left navigates to the previous step.

**Step 1 — Welcome**
- App logo: 72×72px rounded square (radius 20px), brand violet background, SVG clock/alert icon in white
- H1: "Üdvözöl a / Proaktív Büdzsé" — 32px, 700, -1px tracking, line-height 1.1
- Body: 16px, var(--c-muted), line-height 1.6
- Name input: full-width, 52px height, var(--c-surface-2) bg, 1.5px border, radius 12px. Focus border: brand color.
- CTA button: full-width, 16px padding, 700 weight, brand bg, radius 16px. Disabled until name is non-empty.

**Step 2 — Income**
- Step indicator: "2 / 4" in 13px, 600 weight, var(--c-muted)
- H2: 26px, 700, -0.8px tracking
- Income input with "Ft" suffix
- Live preview card (brand-light bg): shows daily budget = income ÷ 30

**Step 3 — Budget Preset**
- Three selectable option cards with 2px border. Selected: brand border + brand-light bg.
- Options: "60 / 20 / 20", "50 / 30 / 20", "Saját felosztás"
- When selected, show a 3-column mini-preview with icon + % + label per category

**Step 4 — Savings Goal (optional)**
- Two text inputs: goal name + target amount
- Two buttons side-by-side: "Kihagyom" (ghost, flex:1) + "Kezdjük →" (primary, flex:2)

---

### 2. Dashboard

Main screen. Scrollable. Bottom nav visible (72px height). Content padding: 16px horizontal, 80px bottom (clears nav).

**Header (non-sticky)**
- Left: greeting "Szia, [Name] 👋" (13px, muted) + current month/year (19px, 700, -0.5px tracking)
- Right: avatar circle 38×38px, brand bg, white initial letter (16px, 700)

**Safe-to-Spend Hero**
- Container: border-radius 24px, padding 24px top/bottom 20px sides
- Background: semantic light color (safe/warn/danger based on pace)
- Label: "MA BIZTONSÁGOSAN ELKÖLTHETŐ" — 13px, 500 weight, 0.3px tracking, semantic color
- Amount: 44px, 700, -2px tracking, line-height 1.05, semantic color, tabular-nums
- Badge below: tone-colored pill

  **Pace calculation:**
  ```
  dailyBudget = income / daysInMonth
  totalSpent = sum of this month's transactions
  upcomingThisMonth = sum of event.estimatedCost where event.date is this month
  remaining = income - totalSpent - upcomingThisMonth
  safeToSpend = remaining / daysRemaining
  
  pct = safeToSpend / dailyBudget
  if pct >= 0.8  → safe (green)
  if pct >= 0.5  → warn (amber)
  else           → danger (red)
  ```

**Alert Banner**
- Shown for unread alerts (BREACH_PREDICTED or PACE_ELEVATED)
- Container: semantic-light bg, radius 12px, 1px semantic border at 20% opacity
- Left: 32×32px icon square (radius 8px), semantic bg, warning SVG icon in white
- Alert title: 13px, 600, semantic color
- Alert message: 12px, var(--c-text) at 75% opacity, line-height 1.4
- Right: dismiss ×  button (14×14px SVG)
- Dismissed alerts: set `isRead: true` via PATCH `/api/v1/alerts/{id}/read`

**Category Cards** (one per budget rule)
- Card: white bg, radius 16px, shadow-sm, 1px border, padding 14px 16px
- Left: 36×36px icon tile (radius 10px), semantic-light bg, emoji icon 18px
- Category name: 15px, 600, -0.2px tracking; subtitle: 12px, var(--c-muted) showing "XX% · XXX Ft"
- Right: spent amount (15px, 700, semantic color) + pace badge
- Progress bar: 6px height, pill shape, semantic color fill, var(--c-surface-2) track
- Footer row: "Elköltve: XX%" left / "Maradék: XXX Ft" right — both 11px, var(--c-muted)
- Entire card is tappable → navigate to Category Detail

  **Pace algorithm per category:**
  ```
  limit = (category.percentage / 100) * income
  rate = spent / daysElapsed
  projected = rate * daysInMonth
  paceRatio = (spent / daysElapsed) / (limit / daysInMonth)
  
  if projected > limit * 1.05 → danger / "Várható túllépés"
  elif paceRatio > 1.15       → warn  / "Gyors ütem"
  else                        → safe  / "Rendben"
  ```

**Savings Goal Card**
- Standard card layout
- Left: 36×36px icon tile, brand-light bg, clock SVG in brand color
- Goal name: 15px, 600; "Megtakarítási cél" subtitle: 12px, muted
- Right: percentage (15px, 700, brand) + "contributed / target" (11px, muted)
- Progress bar: 8px height, brand or safe color if 100%

**Income Summary Card**
- Three-column: "Havi bevétel" | "Elköltve" | "Maradék" — each with 13px muted label + 20px 700 number
- Progress bar below: 6px, colored by spend ratio (>85% danger, >65% warn, else brand)
- Footer: "XX% elköltve · DD/MM. nap" — 11px, muted, right-aligned

---

### 3. Category Detail

Push screen (slides in from right). Back button top-left.

**Header Card**
- 48×48px icon tile (radius 14px), semantic-light bg, emoji 24px
- Category name: 20px, 700, -0.5px; subtitle: 13px, muted
- Two-column: "Elköltve" (actual spent) | "Várható havi" (projected) — both 24px, 700, -1px
- Progress bar: 8px, semantic color
- Footer: pace badge + "Maradék: XXX Ft"

**Transaction List**
- Section header: "Tranzakciók (N)" in 13px, 600, muted uppercase
- List: 1px gap rows on border-color background, rounded container (overflow hidden), white row bg
- Each row: description (15px, 500) + date (12px, muted) / amount in danger color "−XXX Ft" (15px, 700, -0.5px)
- Sorted by date descending
- Empty state: centered message + helpful copy

---

### 4. Events Screen

**Summary Card**
- "Tervezett kiadások összesen" label (13px, muted) + total amount (28px, 700, -1px, brand)
- "N közelgő esemény" count (12px, muted)

**Event Cards**
- 44×44px date tile: month abbrev (11px, 700, uppercase) + day number (17px, 700). Urgent (<14 days): warn colors; else: brand colors.
- Event name: 15px, 600, -0.2px; subtitle: "N nap múlva · XXX Ft" 12px, muted
- Right: days badge (tone: warn if urgent, brand if not)

**Add Event Bottom Sheet**
- Three fields: name, cost (with Ft suffix), date (native date input)
- Submit button: full-width primary

---

### 5. Budget Settings Screen

**Income input** — full-width, number type, Ft suffix

**Category percentage editor**
- One card per category: emoji + name/monthly-amount label + number input (52px wide, centered text, 700 weight) + "%" label
- Validation: sum must equal exactly 100
- Status bar below list: green "✓ Összeg: 100%" or red error if not equal
- Save button disabled when invalid

---

### 6. Add Transaction Bottom Sheet

**Amount Display**
- Large number display: 40px, 700, -2px tracking, tabular-nums
- "Ft" suffix: 20px, 500, muted
- Bottom border separating from numpad

**Numpad Grid**
- 3×4 grid with 1px gaps (border-color background acts as gap)
- Keys: 1–9, "000", 0, ⌫
- Each key: 56px height, white bg, 20px number, centered
- ⌫ key: surface-2 background
- Touch: background flash to surface-2 on press

**Category Picker**
- Horizontal scroll of pill buttons: emoji + label
- Selected: 2px brand border, brand-light bg, brand text
- Unselected: 2px border-color border, surface-2 bg, muted text

**Description Input** — optional, standard input

**Submit Button** — full-width, shows amount: "Rögzítés — XXX Ft". Disabled if amount = 0.

---

## Interactions & Behaviour

### Navigation
- Bottom tab bar: Főoldal (Dashboard), Események (Events), Büdzsé (Settings), Profil
- Center FAB (+): opens Add Transaction sheet
- Category card tap → push Category Detail (slide from right)
- "Részletek" link on dashboard → Budget Settings
- Back button on detail screens → pop back

### Bottom Sheet
- Opens from bottom with slide-up animation (0.3s, cubic-bezier(0.34, 1.2, 0.64, 1))
- Backdrop: 40% black with 2px blur
- Tapping backdrop dismisses

### Animations
- Screen push: `translateX(0 → 100% → 0)`, 0.28s, `cubic-bezier(0.4, 0, 0.2, 1)`
- Fade-in: 0.2s ease
- Progress bars: width transition 0.6s `cubic-bezier(0.34, 1.2, 0.64, 1)` on mount
- Button press: `scale(0.97)` on `touchstart`/`mousedown`, back to `scale(1)` on release

### Alert Dismissal
- Tapping × marks alert as read → `PATCH /api/v1/alerts/{id}/read`
- Alert disappears from banner list immediately (optimistic update)

### Spending-pace APScheduler job
- Runs every 6 hours server-side
- Generates `BREACH_PREDICTED` if projected > limit
- Generates `PACE_ELEVATED` if pace ratio > 1.15 but not yet breaching
- Max 1 alert per category per day

### Safe-to-spend widget
- Fetched from `GET /api/v1/dashboard/safe-to-spend` on every load
- Green if ≥ 80% of daily budget remaining, amber if 50–80%, red if < 50%

---

## State Management

### Client state (React)
```typescript
interface AppState {
  user: { name: string; income: number; currency: 'HUF' | 'EUR' }
  budgetRules: BudgetRule[]
  transactions: Transaction[]
  events: BudgetEvent[]
  alerts: Alert[]
  savingsGoals: SavingsGoal[]
}

interface BudgetRule {
  id: string
  label: string
  percentage: number   // must sum to 100 across all rules
  icon: string         // emoji
  isSavings: boolean
}

interface Transaction {
  id: number
  categoryId: string
  amount: number       // integer HUF (fillér-level precision not needed for MVP)
  description: string
  date: string         // ISO 8601 YYYY-MM-DD
}

interface BudgetEvent {
  id: number
  name: string
  estimatedCost: number
  date: string         // ISO 8601 YYYY-MM-DD
  categoryId?: string
}

interface Alert {
  id: number
  type: 'BREACH_PREDICTED' | 'PACE_ELEVATED' | 'EVENT_REMINDER'
  categoryId: string
  message: string
  isRead: boolean
  createdAt: string
}

interface SavingsGoal {
  id: number
  label: string
  current: number
  target: number
}
```

### API endpoints (already spec'd in Execution Plan)
```
GET  /api/v1/dashboard/safe-to-spend
GET  /api/v1/alerts                    → fetch unread alerts on dashboard load
PATCH /api/v1/alerts/{id}/read

POST /api/v1/transactions
GET  /api/v1/transactions?category=&month=

GET  /api/v1/rules
PUT  /api/v1/rules

POST /api/v1/events
GET  /api/v1/events
DELETE /api/v1/events/{id}
```

---

## Currency Formatting

Use `Intl.NumberFormat` with Hungarian locale:
```typescript
new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0
}).format(amount)
// → "450 000 Ft"
```

---

## Responsive / Mobile Notes

- Primary viewport: 390px width (iPhone 14 / Pixel 7)
- Minimum supported: 375px
- Bottom nav: 72px fixed height. All scroll content needs `padding-bottom: 80px`.
- Touch targets: minimum 44×44px (iOS HIG compliant)
- Safe area insets: `padding-bottom: env(safe-area-inset-bottom)` on bottom nav
- No horizontal scroll on any screen

---

## Assets

- **Icons:** All inline SVG (no external icon library needed for MVP). See `pb_app.jsx` for nav icons.
- **Fonts:** DM Sans via Google Fonts CDN — add to `index.html` or `@import` in global CSS
- **Images:** None in MVP

---

## Files in This Bundle

| File | Purpose |
|------|---------|
| `Proactive Budgeting.html` | Main entry point — open this in browser to see the full prototype |
| `pb_design.jsx` | CSS design tokens, global styles, atomic components (Btn, Badge, ProgressBar, etc.) |
| `pb_components.jsx` | Complex components: cards, hero widget, alert banner, numpad, etc. |
| `pb_screens.jsx` | All screen components: Onboarding, Dashboard, CategoryDetail, Events, BudgetSettings |
| `pb_app.jsx` | App shell, navigation state, seed data, bottom nav |

---

## Implementation Notes

1. **Start with Tailwind tokens** — map all OKLCH values to `tailwind.config.ts` under `colors.brand`, `colors.safe`, `colors.warn`, `colors.danger`. Use CSS variables for runtime theming.

2. **Component priority order:**
   - `SafeToSpendHero` (dashboard hero — core value prop)
   - `CategoryCard` with pace algorithm
   - `AlertBanner` (BREACH_PREDICTED / PACE_ELEVATED)
   - `AddTransactionSheet` with numpad
   - Onboarding flow
   - Events, Budget Settings

3. **The spending-pace algorithm** lives in `pb_components.jsx` under `paceInfo()` — this is the core business logic, recreate it server-side in `spending_pace.py` as per the Execution Plan task T-12, and also client-side for optimistic UI.

4. **Bottom sheet pattern** — consider using a library like `vaul` (Radix-based) or `react-spring` for the iOS-style bottom sheet rather than custom CSS animation.

5. **Numpad** — the calculator-style numpad in `pb_components.jsx` (`AmountNumpad`) is the spec. The key insight: input is `value * 10 + digit`, backspace is `Math.floor(value / 10)`, "000" is `value * 1000`.

6. **Hungarian locale** throughout — all UI copy is in Hungarian. See `pb_screens.jsx` for all string content.
