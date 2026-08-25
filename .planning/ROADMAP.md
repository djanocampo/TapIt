# Development Roadmap — TapIt Platform

## Phase 1: Project Setup & Design System Foundation
- Initialize React + Vite + TypeScript project.
- Configure Tailwind CSS, custom color palettes, modern typography (Inter / Outfit / Plus Jakarta Sans), animations, glassmorphism tokens, and UI components.
- Establish comprehensive TypeScript data models (Users, Profiles, Links, NFCCards, QRCodes, AnalyticsEvents, SystemSettings).
- Build persistent mock data store (Zustand + LocalStorage) pre-seeded with realistic data for demo user **Djan Ocampo** and platform admin.

## Phase 2: Core Components & Layouts
- Design Navigation headers, Footers, and responsive Dashboard Sidebar.
- Build UI components (Button, Input, Select, Modal, Card, Badge, Toggle, Tooltip, Toast notifications, Tabs, DropdownMenu).
- Build Global Demo Bar with Role Switcher (Guest / User / Admin) and NFC Simulator trigger.

## Phase 3: Public Website & Authentication Flow
- Landing Page with animated NFC Tap illustration, dynamic stats, 3-step How It Works, interactive profile preview carousel, and feature grid.
- Features Page & How It Works Page.
- Authentication pages: Login, Register with live username availability validation, Forgot Password, Reset Password, Verification.

## Phase 4: Public Profile & NFC / QR Flow
- Mobile-First Public Profile Renderer (`/@username` and `/p/:profileSlug`).
- NFC Token Interceptor Route (`/t/:cardToken`): handles active card redirect with analytics logging, unclaimed card claim flow, and disabled card page.
- vCard (.vcf) generator & downloader for saving contacts to phone.
- Share Modal with Web Share API and Dynamic QR popup.

## Phase 5: User Dashboard
- **Overview**: personalized greeting, 4 KPI stats cards with % change, traffic trend chart, recent activity feed, quick-copy profile URLs.
- **My Profiles**: profile grid, add new profile wizard, duplicate, archive, set active, live status.
- **Profile Editor**: live two-column layout with real-time smartphone preview, contact info fields, social profiles, theme customization.
- **My Links**: add link, category picker, custom icon, toggle on/off, drag & drop reorder, live click stats.
- **My TapIt Cards**: physical card inventory, NFC card visual representation, claim card modal, profile reassignment, instant disable toggle, individual card analytics.
- **QR Code Studio**: customizable QR code maker (color, frame, label), high-res PNG/SVG export, print sheet preview.
- **Analytics Studio**: deep telemetry dashboard (Views, Taps, Scans, CTR, Traffic over time, Traffic sources breakdown, Top performing links, NFC Card comparison).
- **Appearance Studio**: Theme presets, custom background gradients, button styles, typography choices.
- **Account Settings**: Profile avatar, security, notifications, theme preference, data export.

## Phase 6: Admin Dashboard
- Admin Overview with platform metrics & global traffic charts.
- User Management table with search, role/status filtering, and user suspension/reactivation.
- Profile Directory with search, status filtering, and moderation controls.
- NFC Card Inventory & Batch Token Generator.
- Platform Analytics & Suspicious Tap Detection telemetry.
- System Settings & Supported Link Platforms manager.

## Phase 7: Polish, NFC Simulator & Verification
- Interactive NFC Tap Simulator modal (allows tapping simulated NFC cards with instant visual feedback and live event tracking).
- Responsive mobile testing across all views.
- Build verification and final walkthrough documentation.
