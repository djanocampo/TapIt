# TapIt — Master Architecture & Phase-by-Phase Documentation

> **Tagline**: *Tap. Connect. Analyze. Your digital identity, one tap away.*  
> **Repository**: `TapIt`  
> **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Web NFC API (`navigator.ndef`)

---

## 📊 Phase Progress Tracker

| Phase | Title | Scope & Objectives | Status |
|:---:|---|---|:---:|
| **Phase 1** | **Foundation & Design System** | Electric Cyan branding, transparent logo, dark mode tokens, typography | `[COMPLETE]` |
| **Phase 2** | **Role Architecture & RBAC** | Strict 2-User Model (Admin & Djan), ProtectedRoute, Auth lifecycle | `[COMPLETE]` |
| **Phase 3** | **Public Website & 3D Cards** | Marketing pages, 3D rotating smart cards, interactive flip preview | `[COMPLETE]` |
| **Phase 4** | **Hardware NFC & Dynamic Tokens** | Web NFC chip writer, 3-stage flasher, token resolver (`/t/:token`) | `[COMPLETE]` |
| **Phase 5** | **User Provisioning & Invite Wizard** | Step-by-step Add User wizard, single-use invite links (`/invite/:token`) | `[COMPLETE]` |
| **Phase 6** | **User Dashboard & Profile Studio** | Collapsible editor cards, contact checkboxes, 1-column links, 1-click copy | `[COMPLETE]` |
| **Phase 7** | **Admin Suite & Directory** | Account-based profile accordions, standardized card inventory table | `[COMPLETE]` |
| **Phase 8** | **Mobile Bottom Nav & Telemetry** | 5-Tab mobile bottom bar, "More" sheet, client device detection, Wi-Fi testing | `[COMPLETE]` |

---

## 🚀 Phase 1: Foundation & Brand Design System `[COMPLETE]`

### 1.1 Objectives & Deliverables
Establish a cohesive, high-converting visual identity and responsive web architecture built on modern dark mode and the official TapIt logo palette.

### 1.2 Implemented Features & Architecture
* **Color Palette**:
  * **Primary Accent**: Electric Cyan (`#00f0ff` / `#06b6d4` / `#38bdf8`)
  * **Background Foundation**: Oceanic Midnight & Obsidian Dark (`#040c1a` / `#050a17` / `#081224`)
  * **Text & Contrast**: Crisp Pure White (`#ffffff`) with muted slate metadata (`#94a3b8`)
* **Typography**: Plus Jakarta Sans (`font-sans`), Outfit (`font-display`), JetBrains Mono (`font-mono`).
* **Visual FX**: Glassmorphism (`backdrop-blur-2xl`), animated cyan radar scanning rings, and celebration confetti (`canvas-confetti`).
* **Core Layouts**: [RootLayout.tsx](file:///d:/TapIt/src/layouts/RootLayout.tsx), [DashboardLayout.tsx](file:///d:/TapIt/src/layouts/DashboardLayout.tsx), [AdminLayout.tsx](file:///d:/TapIt/src/layouts/AdminLayout.tsx).

---

## 🔐 Phase 2: Role Architecture & Access Control (RBAC) `[COMPLETE]`

### 2.1 Objectives & Deliverables
Enforce a clean, unambiguous **2-User Security Model** for demonstration, tracking, and operational boundaries.

### 2.2 Account Specifications
| User Account | Email | Password | Role | Permissions & Access Scope |
|---|---|---|:---:|---|
| **Admin** | `admin@tapit.app` | `••••••••••••` | `admin` | Full root access to **Admin Suite (`/admin`)** and **User Dashboard (`/dashboard`)**. Provisions cards, creates invites, and monitors global telemetry. |
| **Djan** | `djan.ocampo@tapit.app` | `••••••••••••` | `user` | Full access to **User Dashboard (`/dashboard`)**. Manages personal personas, links, and assigned smart cards. *Blocked from `/admin` (auto-redirects to `/dashboard`).* |

### 2.3 Universal Authentication & Session Lifecycle
* **State Store**: [store/index.tsx](file:///d:/TapIt/src/store/index.tsx) with persistent LocalStorage key `tapit_app_state_v9`.
* **Session Methods**: `login(user, role)` and `logout()`.
* **Guard Component**: [ProtectedRoute.tsx](file:///d:/TapIt/src/components/auth/ProtectedRoute.tsx) blocks unauthenticated users and unauthorized roles.
* **Universal Sign Out**: Accessible via Mobile Bottom Nav, Desktop Sidebars, Marketing Navbar, and Account Settings.

---

## 🌐 Phase 3: Public Website & Interactive 3D Showcase `[COMPLETE]`

### 3.1 Objectives & Deliverables
Present an engaging marketing landing page that highlights physical-to-digital contactless networking and realistic smart card finishes.

### 3.2 Implemented Components
* **Landing Page ([LandingPage.tsx](file:///d:/TapIt/src/pages/public/LandingPage.tsx))**:
  * Hero section with dynamic headline, animated gradient background, and primary CTAs.
  * 3-Step *How It Works* guide and live telemetry counter metrics.
* **3D Rotating Smart Card Hero ([Rotating3DCardHero.tsx](file:///d:/TapIt/src/components/nfc/Rotating3DCardHero.tsx))**:
  * **Matte Black (Obsidian)** & **Pure White (Ceramic)** finishes.
  * Continuous 360° rotation with pause/resume controls and holographic reflections.
  * Features the centered transparent **`TapIt Logo`** front and back.
* **Public Profile Renderer ([PublicProfileRenderer.tsx](file:///d:/TapIt/src/components/profile/PublicProfileRenderer.tsx))**:
  * Clean layout without distracting badges ("TapIt Live" removed).
  * Direct contact badges (Email/Phone) respect user privacy toggles.
  * Native OS Web Share API trigger (`navigator.share`).

---

## ⚡ Phase 4: Hardware NFC Layer & Dynamic Token Engine `[COMPLETE]`

### 4.1 Objectives & Deliverables
Connect physical NFC microchips to dynamic cloud URLs so users never need to reprogram hardware when changing profiles or updating links.

### 4.2 Core Architectural Superpower: Dynamic Token Routing
Physical TapIt NFC cards store **only a lightweight URL record**:
```
https://tapit.app/t/TAP-8xK29mQ
```
When tapped by an iPhone or Android phone:
1. Opens `/t/:token` handled by [NFCTapHandler.tsx](file:///d:/TapIt/src/pages/nfc/NFCTapHandler.tsx).
2. Resolves which user and profile is currently active or assigned to that hardware card.
3. Redirects seamlessly to the live public profile (`/@slug?src=nfc`).
4. Logs tap telemetry (Timestamp, Form Factor, OS, Browser).

### 4.3 Web NFC Chip Writer ([WebNFCWriterModal.tsx](file:///d:/TapIt/src/components/nfc/WebNFCWriterModal.tsx))
Native Chromium `NDEFReader` writer with 3-stage live feedback:
1. `Listening`: *"Tap and hold the NFC card near your device..."* (radar ring pulse)
2. `Writing`: *"Writing NFC URL Record... Loading..."* (spinner)
3. `Success`: *"Success! You may now remove the card."* (green checkmark, audio chime, haptic vibration)

---

## 👥 Phase 5: User Provisioning & Step-by-Step Invite Wizard `[COMPLETE]`

### 5.1 Objectives & Deliverables
Enable the Admin to onboard new users, program physical smart cards, and generate temporary activation links.

### 5.2 Add User Wizard Workflow ([UserManagementPage.tsx](file:///d:/TapIt/src/pages/admin/UserManagementPage.tsx))
* **Step 1: Hardware Token & NFC Flashing**:
  * Input member name/nickname.
  * Select card finish (`Matte Black` / `White Ceramic`).
  * Web NFC In-App Flasher writes `https://tapit.app/t/TAP-XXXXXX` directly to the chip.
* **Step 2: Temporary Activation Link Generation**:
  * Generates single-use invite URL (`/invite/INV-XXXXXX`) and vector QR code.
* **Step 3: User Activation & Card Binding ([InviteRegistrationPage.tsx](file:///d:/TapIt/src/pages/auth/InviteRegistrationPage.tsx))**:
  * User opens link on mobile or desktop.
  * Inputs Full Name, Username, Email, and Password.
  * Creates account, binds physical card, creates initial profile, and auto-authenticates into `/dashboard`.
  * User can subsequently log in anytime at `/login`.

---

## 🎨 Phase 6: User Dashboard Suite & Profile Studio `[COMPLETE]`

### 6.1 Objectives & Deliverables
Provide a powerful self-service portal for managing multiple personas, links, cards, and analytics.

### 6.2 Module Breakdown
* **Dashboard Overview ([DashboardOverview.tsx](file:///d:/TapIt/src/pages/dashboard/DashboardOverview.tsx))**:
  * Personalized greeting and active persona status banner.
  * 1-Click **`[Copy Profile Link]`** with visual copied confirmation.
  * 4 KPI telemetry cards, weekly traffic chart, and linked card widget.
* **My Profiles ([MyProfilesPage.tsx](file:///d:/TapIt/src/pages/dashboard/MyProfilesPage.tsx))**:
  * Multi-profile management (Professional, Personal, Creator).
  * 1-Click **`[Copy Link]`** button right next to each profile slug (`tapit.app/@slug`).
  * 1-Click **"Set as Active"** to change which persona your physical card opens.
* **Profile Editor ([ProfileEditorPage.tsx](file:///d:/TapIt/src/pages/dashboard/ProfileEditorPage.tsx))**:
  * **Collapsible / Expandable Cards**: Dedicated expand/collapse button on each card section.
  * **Contact Privacy**: Checkboxes for `[✓] Display email publicly` and `[✓] Display phone publicly`.
  * **Unified "Links" Card**: Single-column list with `[+ Add Link]` button, preset icon picker, move up/down reordering, visibility toggle, and delete.
  * **Real-Time Live Phone Preview**: Sticky mobile preview updates live with every keystroke.
* **My TapIt Cards ([MyCardsPage.tsx](file:///d:/TapIt/src/pages/dashboard/MyCardsPage.tsx) / [NFCCardPreview.tsx](file:///d:/TapIt/src/components/nfc/NFCCardPreview.tsx))**:
  * Realistic 3D Matte Black and Pure White cards matching the landing page.
  * Click to flip 180° and inspect the back face.
  * Profile reassignment dropdown and tap simulator.
* **Links Monitoring ([MyLinksPage.tsx](file:///d:/TapIt/src/pages/dashboard/MyLinksPage.tsx))**:
  * Clean telemetry monitoring view with right-aligned profile switcher.
* **Dynamic QR Studio ([QRStudioPage.tsx](file:///d:/TapIt/src/pages/dashboard/QRStudioPage.tsx))**:
  * Vector QR generator with center logo embed and PNG/SVG export.
* **Account Settings ([SettingsPage.tsx](file:///d:/TapIt/src/pages/dashboard/SettingsPage.tsx))**:
  * Profile settings, data export, demo data reset, and Sign Out action.

---

## 🛡️ Phase 7: Administrator Suite & Directory Management `[COMPLETE]`

### 7.1 Objectives & Deliverables
Equip administrators with oversight tools for user accounts, profile moderation, card inventory, and platform health.

### 7.2 Module Breakdown
* **Admin Overview ([AdminOverview.tsx](file:///d:/TapIt/src/pages/admin/AdminOverview.tsx))**:
  * Platform metrics, active user distribution, live tap feed, and telemetry charts.
* **User Management ([UserManagementPage.tsx](file:///d:/TapIt/src/pages/admin/UserManagementPage.tsx))**:
  * Directory of registered users (Admin, Djan, invited members).
  * 1-Click Add User Wizard button and account status toggles.
* **Profile Directory ([ProfileDirectoryPage.tsx](file:///d:/TapIt/src/pages/admin/ProfileDirectoryPage.tsx))**:
  * **Organized Per User Account**: Hierarchical accordion drawers grouping profiles by account.
  * Live search, role filter, expand all, and collapse all controls.
* **NFC Card Inventory ([CardInventoryPage.tsx](file:///d:/TapIt/src/pages/admin/CardInventoryPage.tsx))**:
  * **Standardized Table Structure**:
    1. `Hardware Token`: Token, card model, and finish (`Matte Black` / `Pure White`).
    2. `User`: Resolved user account (displays `Unassigned` if null).
    3. `Assigned Profile`: Persona name and public slug.
    4. `Status`: Active, Unclaimed, or Disabled.
    5. `Taps Recorded`: Total tap volume.
    6. `Admin Actions`: `[Flash Chip]` Web NFC writer + `[Disable / Reactivate]`.

---

## 📱 Phase 8: Mobile-First Bottom Nav & Client Telemetry `[COMPLETE]`

### 8.1 Objectives & Deliverables
Deliver an optimal mobile UX with a native-feeling bottom navigation bar and real-time client device detection.

### 8.2 Glassmorphic Mobile Bottom Navigation ([MobileBottomNav.tsx](file:///d:/TapIt/src/components/layout/MobileBottomNav.tsx))
Fixed at the bottom on mobile devices (`< md`):
* **User View Tabs**: 🏠 `Overview` | 👤 `Profiles` | 🔗 `Links` | 💳 `Cards` | ⋯ `More`
* **Admin View Tabs**: 🛡️ `Overview` | 👥 `Users` | 🗂️ `Profiles` | 💳 `Cards` | ⋯ `More`
* **"More" Slide-Up Bottom Sheet**:
  * Secondary routes (QR Studio, Analytics, Appearance, Settings).
  * View Live Public Profile link (`/@slug`).
  * Cross-portal switcher (between Admin Suite and User View).
  * **Sign Out of TapIt** action.

### 8.3 Device & Form Factor Telemetry Engine
User-Agent parsing automatically detects and logs:
* **Form Factor**: `Mobile`, `Tablet`, or `Desktop`
* **Operating System**: `iOS` (iPhone/iPad), `Android`, `macOS`, `Windows`, `Linux`
* **Browser Engine**: `Safari`, `Chrome`, `Firefox`, `Edge`, `Other`

### 8.4 Local Wi-Fi Testing Guide
* Dev server configuration in [vite.config.ts](file:///d:/TapIt/vite.config.ts): `server: { host: true, port: 5173 }`.
* Connect any phone on the same Wi-Fi: `http://192.168.254.138:5173`.

---

## 📁 Repository Directory Map

```
TapIt/
├── .planning/                     # Project management specifications & state
│   ├── PROJECT.md                 # Vision, taglines, and core roles
│   ├── REQUIREMENTS.md            # System requirements matrix
│   ├── ROADMAP.md                 # Multi-phase development roadmap
│   └── STATE.md                   # Current execution checkpoint
├── public/                        # Public static assets
├── src/
│   ├── assets/                    # Transparent TapIt Logo and images
│   ├── components/
│   │   ├── auth/                  # ProtectedRoute RBAC guard
│   │   ├── layout/                # Navbar, DashboardSidebar, AdminSidebar, MobileBottomNav
│   │   ├── nfc/                   # WebNFCWriterModal, NFCTapSimulatorModal, 3D Hero Card, NFCCardPreview
│   │   ├── profile/               # PublicProfileRenderer, MobileFramePreview, ShareModal
│   │   └── ui/                    # Button, Input, Modal, Toggle, Badge
│   ├── data/
│   │   ├── mockData.ts            # Seed accounts (Admin, Djan), cards, and profiles
│   │   └── themes.ts              # Preset visual theme configs
│   ├── layouts/
│   │   ├── AdminLayout.tsx        # Administrator suite layout with mobile bottom nav
│   │   ├── DashboardLayout.tsx    # User portal dashboard layout with mobile bottom nav
│   │   └── RootLayout.tsx         # Public marketing landing layout
│   ├── pages/
│   │   ├── admin/                 # Overview, UserManagement, ProfileDirectory, CardInventory
│   │   ├── auth/                  # LoginPage, RegisterPage, InviteRegistrationPage
│   │   ├── dashboard/             # Overview, MyProfiles, ProfileEditor, MyLinks, MyCards, QRStudio, SettingsPage
│   │   ├── nfc/                   # NFCTapHandler, UnclaimedCardPage, DisabledCardPage
│   │   ├── profile/               # PublicProfilePage
│   │   └── public/                # LandingPage, FeaturesPage, HowItWorksPage
│   ├── store/
│   │   └── index.tsx              # Central state store with localStorage persistence & Web NFC
│   ├── types/
│   │   └── index.ts               # TypeScript data models & interfaces
│   ├── App.tsx                    # React Router DOM v6 route definitions
│   ├── main.tsx                   # React root entry point
│   └── index.css                  # Global Tailwind CSS and custom animations
├── DOCUMENTATION.md               # Master phase-by-phase system documentation
├── package.json                   # Dependencies and npm scripts
├── tailwind.config.js             # Tailwind theme configuration
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler configuration (with network host broadcast)
```

---

## 🛠️ Build & Verification Commands

```bash
# Install dependencies
npm install

# Start local development server (broadcasted on 0.0.0.0 for Wi-Fi mobile testing)
npm run dev

# Run TypeScript type check and compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

*Documentation Version: 3.5.0 | Last Updated: September 2026 | Built for TapIt Smart Identity Platform.*
