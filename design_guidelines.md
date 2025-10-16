# SaaS Management Platform - Design Guidelines

## Design Approach: Modern Dashboard System

**Selected Framework:** Linear-inspired design system with Material Design data visualization principles  
**Rationale:** This SaaS management platform is utility-focused, information-dense, and requires efficient data presentation. Linear's clean dashboard aesthetics combined with robust data visualization creates the optimal foundation for a professional business intelligence tool.

**Core Principles:**
- Clarity over decoration: Information hierarchy drives all design decisions
- Data-first presentation: Metrics and insights take visual priority
- Efficient workflows: Minimize clicks and cognitive load
- Professional credibility: Enterprise-grade visual polish

---

## Color Palette

**Primary Theme (Light Mode with Purple Accents):**
- Background Base: 0 0% 100% (Pure White)
- Surface Elevated: 0 0% 100% (Pure White)
- Surface Hover: 270 30% 95% (Very Light Purple)
- Border Subtle: 270 15% 92%
- Border Default: 270 20% 90%
- Text Primary: 270 60% 35% (Rich Purple)
- Text Secondary: 270 40% 50% (Medium Purple)
- Text Tertiary: 270 30% 60% (Light Purple)

**Accent Colors:**
- Primary (Brand): 270 70% 55% - Purple for CTAs, active states, primary actions
- Success (Positive metrics): 142 76% 45% - ROI gains, cost savings, optimizations
- Warning (Moderate risk): 38 92% 50% - Underutilized licenses, pending renewals
- Danger (High risk): 0 84% 60% - Shadow IT, over-spending, critical alerts
- Info (Chart accents): 260 80% 60%, 280 75% 60% - Purple-toned chart colors

**Design Philosophy:**
- Clean white backgrounds throughout for clarity
- Purple text and accents for brand consistency
- Subtle purple borders and hover states
- High contrast purple-on-white for accessibility

---

## Typography

**Font System:**
- Primary: 'Inter' via Google Fonts - Clean, readable, professional
- Monospace: 'JetBrains Mono' - For data tables, metrics, code snippets

**Type Scale:**
- Dashboard Headers: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-sm (14px)
- Captions/Labels: text-xs text-secondary (12px)
- Metrics/Numbers: text-2xl to text-4xl font-bold in monospace

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16  
- Component padding: p-4 to p-6
- Card spacing: gap-4 to gap-6
- Section margins: mb-8 to mb-12
- Dashboard grid gaps: gap-6

**Grid Structure:**
- Main dashboard: 12-column grid (grid-cols-12)
- Metric cards: 3-column on desktop (lg:grid-cols-3), stack on mobile
- Data tables: Full-width with horizontal scroll on mobile
- Sidebar navigation: Fixed 240px width, collapsible to 64px icon-only

---

## Component Library

**Navigation:**
- Left sidebar with collapsible sections: Dashboard, Applications, Licenses, Analytics, Settings
- Top header bar: Global search, notifications, user profile dropdown
- Breadcrumb navigation for deep sections

**Dashboard Cards:**
- Elevated surface (bg-surface-elevated) with subtle border
- Rounded corners: rounded-lg
- Consistent padding: p-6
- Header with title + action button/dropdown
- Metric displays with large numbers, trend indicators (↑/↓), percentage changes
- Micro-charts (sparklines) for trend visualization

**Data Visualization:**
- Bar charts: Spending comparisons, license utilization
- Line charts: Cost trends over time, usage patterns
- Pie/Donut charts: Category breakdowns, app distribution
- Use Chart.js or Recharts with color palette consistency
- Tooltips on hover with detailed breakdowns

**Tables:**
- Striped rows (alternating bg-surface-elevated)
- Sticky headers on scroll
- Sortable columns with arrow indicators
- Row actions (edit, delete) on hover
- Status badges (Active/Inactive, Approved/Shadow IT)
- Pagination with page size selector

**Forms & Inputs:**
- Input fields: Dark bg-surface-elevated, border-default, focus:border-primary
- Consistent height: h-10
- Labels: text-sm font-medium mb-2
- Dropdowns: Custom styled to match dark theme
- Buttons: Primary (bg-primary), Secondary (border-primary bg-transparent), Destructive (bg-danger)

**Status Indicators:**
- Badges: Pill-shaped, text-xs, color-coded (success/warning/danger/info)
- Risk indicators: Color-coded dots with labels
- Utilization bars: Progress bars showing license usage (green/yellow/red thresholds)

**Overlays:**
- Modals: Centered, max-w-2xl, backdrop blur
- Slide-overs: Right-side panel for detailed views (384px width)
- Toasts: Top-right positioned, auto-dismiss, icon + message

---

## Key Dashboard Sections

**Overview Dashboard:**
- 4 metric cards (Total Apps, Active Licenses, Monthly Spend, Potential Savings)
- Spending trend chart (last 12 months)
- Top 5 applications by cost (horizontal bar chart)
- Recent activity feed
- Quick actions panel

**Applications Grid:**
- Card-based view with app logo, name, category, monthly cost
- Filters: Category, Status, Cost range
- Search bar with instant filtering
- Detail modal on click showing full app information

**License Management:**
- Table view: App name, Total licenses, Active users, Unused seats, Monthly cost/license
- Utilization percentage bars
- Bulk actions for license adjustments
- Export functionality

**Analytics Dashboard:**
- Multi-chart layout (2-column grid)
- Cost breakdown by category (pie chart)
- Spending trends (line chart)
- ROI metrics cards
- Optimization recommendations list with estimated savings

---

## Images

**Hero Section:** No large hero image - this is a dashboard application. Focus on data and functionality immediately.

**Application Logos:** Display actual SaaS app logos (64x64px) in application cards and tables for quick recognition.

**Empty States:** Use simple illustrations or icons when no data is available, with clear CTAs to add first application.

**Onboarding:** Optional walkthrough screens with subtle dashboard preview screenshots showing value.

---

## Accessibility & Interactions

- Maintain consistent dark mode across all inputs and text fields
- Focus states: 2px border-primary ring on all interactive elements
- Keyboard navigation: Full support with visible focus indicators
- Animations: Minimal - only subtle transitions (150ms) on hover/active states
- Loading states: Skeleton screens for data-heavy components
- Responsive breakpoints: Mobile-first, stack columns on screens < 768px