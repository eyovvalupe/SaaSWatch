# SaaS Management Platform

## Overview

This is a **SaaS Management Platform** designed to help organizations track, manage, and optimize their software-as-a-service subscriptions. The platform provides comprehensive visibility into application usage, license utilization, spending trends, and renewal schedules. It aims to eliminate shadow IT, reduce unnecessary costs, and maximize ROI on software investments through data-driven insights and actionable recommendations.

**Core capabilities:**
- Application inventory management with approval status tracking (approved, shadow IT, trial)
- License utilization monitoring and optimization
- Renewal tracking with automatic notifications
- Spending analytics and trend visualization
- AI-driven cost optimization recommendations
- **ROI Measurement (Add-on Feature)** - Track return on investment for each SaaS application
  - Calculate ROI percentage based on value generated vs. cost
  - Document ROI calculation methodology with notes
  - View aggregated ROI metrics across all tracked applications
- Real-time team chat for internal collaboration between license holders
- Vendor CRM for admin-vendor communications and negotiations
- **Multi-tenant architecture** with complete data isolation per organization
- **Replit Auth integration** for secure user authentication
- **PostgreSQL database** with Drizzle ORM for production-ready data persistence

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 17, 2025 - Demo Data Loading & Tenant Management
- **Implemented Demo Data Loading System**
  - Created `/api/seed-demo` endpoint to populate user's organization with sample data
  - Added empty state UI on Dashboard with "Load Demo Data" button
  - Refactored seed logic to work with any organization (not just demo org)
  - Users can now load 6 sample applications, licenses, renewals, recommendations, spending data, and conversations
- **Created Comprehensive Tenant Management Documentation**
  - Added TENANT_MANAGEMENT.md guide covering:
    - Multi-tenant architecture overview
    - Development environment setup (demo data, testing)
    - Production operations (user onboarding, organization management)
    - Security & access control best practices
    - Monitoring & analytics queries
    - Troubleshooting common issues

### October 16, 2025 - ROI Measurement Add-on Feature
- **Implemented ROI Measurement System** as an optional add-on feature for premium clients
  - Added ROI fields to applications table: roiEnabled, monthlyValue, roiNotes
  - Created ROIMeasurement component for tracking value generated vs. cost
  - Built dedicated ROI page showing aggregated metrics across all applications
  - ROI calculation: (Value Generated - Cost) / Cost × 100
  - Users can enable/disable ROI tracking per application
  - Document calculation methodology with custom notes
- **Updated Branding to Appfuze.ai**
  - Changed from "APPFUZE.AI" to "Appfuze.ai" (capital A, lowercase rest)
  - Updated across all UI components, pages, and documentation

### October 16, 2025 - Production-Ready Multi-Tenancy & Authentication
- **Migrated from in-memory to PostgreSQL database**
  - Implemented Drizzle ORM with Neon PostgreSQL
  - Full CRUD operations for all entities
  - Database schema pushed and verified
- **Implemented Multi-Tenancy Architecture**
  - Added Organizations table for tenant isolation
  - Added organizationId to all data tables (applications, licenses, renewals, recommendations, spending, conversations, messages)
  - All API queries filter by organizationId for complete tenant isolation
  - New users automatically get their own organization
- **Integrated Replit Auth**
  - OpenID Connect authentication with Google, GitHub, Apple, email/password
  - Session management with PostgreSQL session store
  - Protected API routes with authentication middleware
  - Landing page for logged-out users
  - User profile display with logout functionality
- **Updated Data Model**
  - Users table with firstName, lastName, profileImageUrl, organizationId
  - Sessions table for secure session storage
  - All entities linked to organizations for tenant isolation
- **Production-Ready Features**
  - Automatic organization creation for new users
  - Secure authentication flow with token refresh
  - Complete tenant data isolation
  - Database seeding with demo organization

### October 16, 2025 - Purple and White Theme
- Updated entire application to white background with purple fonts
  - Background: Pure white (0 0% 100%)
  - Text: Rich purple (270 60% 35%) with lighter purple variants for secondary text
  - Primary accent color: Vibrant purple (270 70% 55%)
  - Buttons, borders, and interactive elements use purple color scheme
  - Default theme changed from dark to light mode
  - Charts updated to use purple-based color palette

### October 16, 2025 - Company Branding
- Added Appfuze.ai company logo to the platform
  - Logo displays in sidebar header and main application header
  - Professional, modern design suitable for both dark and light modes
  - Generated using AI image generation with tech/SaaS aesthetic

### October 16, 2025 - Real-Time Collaboration & Vendor CRM
- Added Team Chat feature for internal collaboration between license holders
  - Real-time messaging using WebSocket (ws:// protocol on /ws path)
  - Conversation-based chat linked to specific applications
  - Message persistence with in-memory storage
  - Live message updates without page refresh
- Implemented Vendor CRM for admin-vendor communications
  - Dedicated interface for licensing negotiations and cost discussions
  - Role-based messaging (admin/vendor with visual badges)
  - Conversation history with timestamps and sender identification
- Extended schema with Conversations and Messages entities
- Added WebSocket server integration alongside Express API
- Seeded sample conversations for both Team Chat and Vendor CRM
- Comprehensive e2e testing confirms real-time functionality

### October 16, 2025 - Full-Stack Integration Complete
- Implemented complete REST API with all CRUD endpoints protected by authentication
- Connected frontend Dashboard to backend APIs using React Query
- Created automatic data seeding system with demo organization and sample SaaS applications
- All API routes require authentication and filter by user's organizationId
- Added proper data-testid attributes for automated testing throughout UI components
- Implemented useAuth hook for frontend authentication state

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**UI Component System:** shadcn/ui (Radix UI primitives) with a Linear-inspired design system
- Chosen for: Enterprise-grade polish, accessibility, and comprehensive component library
- Design philosophy: Information-dense dashboard with clarity over decoration
- Styling: TailwindCSS with custom design tokens for consistent theming
- Theme support: Dark mode primary, light mode secondary via ThemeProvider context

**State Management:**
- React Query (TanStack Query) for server state and data fetching
- React Hook Form with Zod validation for form handling
- React Context for theme and sidebar state management

**Routing:** Wouter (lightweight client-side routing)
- Chosen over React Router for: Smaller bundle size, simpler API for SPA needs

**Data Visualization:** Recharts library for spending trends and analytics charts

### Backend Architecture

**Server Framework:** Express.js with TypeScript
- RESTful API design pattern
- Middleware-based request processing
- Centralized error handling

**API Structure:**
- Resource-based endpoints (`/api/applications`, `/api/licenses`, `/api/renewals`, etc.)
- CRUD operations with validation using Zod schemas
- JSON request/response format
- Logging middleware for API request tracking

**Current Storage:** In-memory storage (MemStorage class) - ACTIVE
- Implements IStorage interface for easy database migration
- UUID-based entity identifiers
- Support for: Applications, Licenses, Renewals, Recommendations, Spending History, Conversations, Messages
- Auto-seeded with sample data on server startup

**Real-Time Communication:** WebSocket Server
- Protocol: ws:// on /ws path (separate from Vite HMR WebSocket)
- Purpose: Real-time message delivery for Team Chat and Vendor CRM
- Broadcasting: Messages sent to all connected clients for live updates
- Integration: Works alongside Express REST API

**Planned Database:** PostgreSQL with Drizzle ORM
- Configuration exists in `drizzle.config.ts` for future migration
- Schema defined in `shared/schema.ts` using Drizzle's pg-core
- Schema includes: Foreign key relationships, timestamps, decimal precision for financial data

### Data Schema Design

**Core Entities:**

1. **Applications** - Central entity tracking SaaS apps
   - Status types: approved, shadow, trial
   - Financial tracking: monthly cost, logo/branding assets
   - Categories for organization

2. **Licenses** - Per-application license management
   - Active vs. total license tracking for utilization metrics
   - Cost per license for granular spend analysis
   - Cascade delete on application removal

3. **Renewals** - Contract renewal scheduling
   - Renewal date tracking with auto-renew flags
   - Annual cost and contract value separation
   - Notification status tracking

4. **Recommendations** - Action items and optimization suggestions
   - Types: downgrade, renew, track-users, review-renewal, cost-review
   - Priority levels: high, medium, low
   - Potential savings calculations with before/after costs

5. **Spending History** - Time-series financial data
   - Monthly aggregation for trend analysis
   - Supports chart visualization

6. **Conversations** - Communication threads for collaboration and CRM
   - Types: internal (team chat), vendor (CRM)
   - Linked to specific applications
   - Supports both team collaboration and vendor negotiations

7. **Messages** - Individual messages within conversations
   - Sender identification (name and role)
   - Message types: text, system
   - Timestamps for chronological ordering
   - Real-time delivery via WebSocket

**Design Rationale:**
- Normalized schema prevents data duplication
- Decimal types for financial accuracy (avoiding floating-point issues)
- Timestamps for audit trails and historical analysis
- Cascade deletes maintain referential integrity
- Conversation types enable dual-purpose messaging (internal + external)

### External Dependencies

**Database (Planned):**
- **Neon Database** (@neondatabase/serverless) - Serverless PostgreSQL
  - Rationale: Serverless architecture matches deployment model, zero-config scaling
  - Connection via DATABASE_URL environment variable

**UI Component Libraries:**
- **Radix UI** - Unstyled, accessible component primitives
  - Components: Dialog, Dropdown, Popover, Tooltip, Accordion, and 20+ others
  - Chosen for: WCAG compliance, keyboard navigation, screen reader support

**Form & Validation:**
- **React Hook Form** - Form state management
- **Zod** - Runtime type validation and schema parsing
- **@hookform/resolvers** - Integration layer between RHF and Zod
- **drizzle-zod** - Auto-generate Zod schemas from Drizzle tables

**Data Visualization:**
- **Recharts** - Chart library for spending trends
  - Rationale: React-native components, composable API, responsive by default

**Real-Time Communication:**
- **WebSocket (ws)** - Native browser WebSocket API for real-time messaging
  - Server: Node.js `ws` library integrated with Express server
  - Client: Browser WebSocket API for bidirectional communication
  - Use case: Live message delivery in Team Chat and Vendor CRM

**Utilities:**
- **date-fns** - Date manipulation and formatting (chosen over Moment.js for tree-shaking)
- **clsx** + **tailwind-merge** - Conditional className composition
- **class-variance-authority** - Type-safe variant management for components

**Development Tools:**
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety across full stack
- **ESBuild** - Production bundling for server code
- **PostCSS + Autoprefixer** - CSS processing

**Fonts:**
- **Inter** - Primary typeface (via Google Fonts) for UI text
- **JetBrains Mono** - Monospace font for data tables and metrics

**Session Management (Configured):**
- **connect-pg-simple** - PostgreSQL session store for Express
  - Ready for implementation when user authentication is added

### Build & Deployment

**Development:**
- `npm run dev` - Concurrent Vite dev server + Express API with HMR
- Vite middleware mode for seamless frontend/backend integration
- Source maps enabled for debugging

**Production:**
- `npm run build` - Vite builds client assets, ESBuild bundles server
- Static assets served from `dist/public`
- Single Node.js process serves both API and static files

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection (required for Drizzle operations)
- `NODE_ENV` - Environment flag (development/production)