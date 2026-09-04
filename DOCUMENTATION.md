# TapIt — Master Architecture & System Documentation

> **Tagline**: *Tap. Connect. Analyze. Your digital identity, one tap away.*  
> **Repository**: `TapIt`  
> **Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS, PostgreSQL / Supabase, Web NFC API (`navigator.ndef`), Recharts, Lucide Icons  
> **Architecture Reference**: [DATABASE_INDEXING.md](file:///d:/TapIt/DATABASE_INDEXING.md) & [Dual-Layer Sync Pattern.md](file:///d:/TapIt/Dual-Layer%20Sync%20Pattern.md)

---

## 📊 Phase Progress Tracker

| Phase | Title | Scope & Objectives | Status |
|:---:|---|---|:---:|
| **Phase 1** | **Foundation & Design System** | Electric Cyan branding, transparent logo, dark mode tokens, typography | `[COMPLETE]` |
| **Phase 2** | **Role Architecture & RBAC** | System Admin & End-User RBAC, ProtectedRoute, universal session lifecycle | `[COMPLETE]` |
| **Phase 3** | **Public Website & 3D Cards** | Marketing pages, 3D rotating smart cards, interactive flip preview | `[COMPLETE]` |
| **Phase 4** | **Hardware NFC & Dynamic Tokens** | Web NFC chip writer, 3-stage flasher, dynamic token routing (`/t/:token`) | `[COMPLETE]` |
| **Phase 5** | **User Provisioning & Invite Wizard** | Step-by-step Add User wizard, single-use invite links (`/invite/:token`) | `[COMPLETE]` |
| **Phase 6** | **User Dashboard & Profile Studio** | Collapsible editor cards, contact checkboxes, 1-column links, 1-click copy | `[COMPLETE]` |
| **Phase 7** | **Admin Suite & Directory** | Account-based profile accordions, standardized card inventory table | `[COMPLETE]` |
| **Phase 8** | **Mobile Bottom Nav & Telemetry** | 5-Tab mobile bottom bar, "More" sheet, client device detection, Wi-Fi testing | `[COMPLETE]` |
| **Phase 9** | **Normalized PostgreSQL Database** | 9 Relational 3NF tables, foreign key cascades, RLS policies, Realtime publication | `[COMPLETE]` |
| **Phase 10** | **Database Indexing Architecture** | Foreign key indexes, token lookups, and composite B-Tree indexes (DATABASE_INDEXING.md) | `[COMPLETE]` |
| **Phase 11** | **Dual-Layer Sync Engine** | Instant LocalStorage Layer 1 + non-blocking Supabase Layer 2 + O(1) deduplication | `[COMPLETE]` |
| **Phase 12** | **Clean Auth & 1st User Flow** | Purged demo logins, clean Admin credentials, 1st user registration & binding | `[COMPLETE]` |

---

## 🔐 System Administrator & Authentication Credentials

TapIt operates with a **Clean Slate Onboarding Architecture**. All pre-seeded dummy accounts and 1-click demo logins have been purged. Only the root System Administrator exists by default:

* **Admin Portal URL**: [`/login`](http://localhost:5173/login) ➔ Redirects to [`/admin`](http://localhost:5173/admin)
* **Email / Username**: `admin@tapit.app` or `admin`
* **Password**: `admin123` (or `admin`)
* **Role**: `admin`
* **Admin Capabilities**:
  * Root access to System Admin Suite (`/admin`) and User Dashboard (`/dashboard`).
  * Hardware NFC Smart Card batch generation & token provisioning.
  * User provisioning wizard & temporary invitation link generation (`/invite/:token`).
  * User account moderation (active/suspended).
  * Global telemetry, analytics, and platform system settings.

### 👤 Testing Your 1st Personal User Account
1. Open [`/register`](http://localhost:5173/register).
2. Enter your Name, Email, Password, and unique **Username** (e.g., `djan`).
3. Submit the registration. TapIt automatically:
   * Creates your user entity in LocalStorage and PostgreSQL.
   * Auto-provisions your **Primary Profile** mapped to `tapit.app/@username` and `tapit.app/username`.
   * Generates your custom dynamic **QR Code** asset.
   * Auto-authenticates and navigates to your **User Dashboard** (`/dashboard`).

---

## 🗄️ Normalized Database Architecture (`supabase/schema.sql`)

TapIt follows a **Third Normal Form (3NF) Relational Architecture** in PostgreSQL / Supabase, defined in [`supabase/schema.sql`](file:///d:/TapIt/supabase/schema.sql).

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐       1:N       ┌─────────────────────┐
│  public.users   │────────────────▶│   public.profiles   │
└────────┬────────┘                 └──────────┬──────────┘
         │                                     │
     1:N │                                 1:N │
         ▼                                     ▼
┌─────────────────┐                 ┌─────────────────────┐
│public.nfc_cards │                 │    public.links     │
└────────┬────────┘                 └──────────┬──────────┘
         │                                     │
     1:N │                                 1:N │
         ▼                                     ▼
┌─────────────────────────────────────────────────────────┐
│                public.analytics_events                  │
└─────────────────────────────────────────────────────────┘
```

### Table Definitions

| Table Name | Primary Key | Foreign Keys & Cascades | Key Columns & Responsibilities |
|---|---|---|---|
| **`public.users`** | `id` (TEXT) | — | `username` (UNIQUE), `email` (UNIQUE), `password_hash`, `role` (`admin`/`user`), `avatar`, `headline`, `bio`, `status`, `created_at`, `last_login_at`. |
| **`public.profiles`** | `id` (TEXT) | `user_id` ➔ `users(id)` `ON DELETE CASCADE` | `slug` (UNIQUE), `name`, `display_name`, `headline`, `bio`, `avatar`, `cover_image`, `email`, `phone`, `theme` (JSONB), `is_active`, `is_archived`, `socials` (JSONB). |
| **`public.links`** | `id` (TEXT) | `profile_id` ➔ `profiles(id)` `ON DELETE CASCADE` | `title`, `url`, `icon`, `category`, `position`, `is_active`, `is_featured`, `clicks`, `last_clicked_at`. |
| **`public.nfc_cards`** | `id` (TEXT) | `user_id` ➔ `users(id)`, `profile_id` ➔ `profiles(id)` | `card_token` (UNIQUE), `name`, `material` (`matte-black`, `white-ceramic`, etc.), `status` (`active`, `unclaimed`, `disabled`), `taps`, `unique_tappers`, `last_tapped_at`. |
| **`public.qr_codes`** | `id` (TEXT) | `profile_id` ➔ `profiles(id)` `ON DELETE CASCADE` | `token` (UNIQUE), `fg_color`, `bg_color`, `include_logo`, `scans`, `last_scanned_at`. |
| **`public.analytics_events`** | `id` (TEXT) | `profile_id` ➔ `profiles(id)` `ON DELETE CASCADE`, `card_id` ➔ `nfc_cards(id)`, `link_id` ➔ `links(id)` | `event_type` (`profile_view`, `nfc_tap`, `qr_scan`, `link_click`), `traffic_source`, `device_type`, `browser`, `os`, `country`, `city`, `timestamp`. |
| **`public.user_invites`** | `id` (TEXT) | `used_by_user_id` ➔ `users(id)` | `invite_token` (UNIQUE), `initial_name`, `card_token`, `material`, `is_used`, `created_at`. |
| **`public.notifications`** | `id` (TEXT) | `recipient_user_id` ➔ `users(id)` `ON DELETE CASCADE` | `title`, `message`, `type` (`info`, `success`, `warning`, `tap`), `read`, `link`, `timestamp`. |
| **`public.system_settings`** | `id` (TEXT) | — | `platform_name`, `maintenance_mode`, `allow_public_registrations`, `enforce_nfc_verification`, `max_profiles_per_user`, `default_theme`, `supported_platforms` (JSONB). |

---

## ⚡ Database Indexing Architecture ([DATABASE_INDEXING.md](file:///d:/TapIt/DATABASE_INDEXING.md) Compliance)

To ensure sub-millisecond query performance and eliminate sequential table scans ($O(N)$), high-throughput B-Tree indexes are applied:

### Indexing Specification Matrix

```sql
-- 1. Foreign Key B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_links_profile_id ON public.links(profile_id);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_id ON public.nfc_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_profile_id ON public.nfc_cards(profile_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_profile_id ON public.qr_codes(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON public.analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_card_id ON public.analytics_events(card_id);
CREATE INDEX IF NOT EXISTS idx_analytics_link_id ON public.analytics_events(link_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_user_invites_used_by ON public.user_invites(used_by_user_id);

-- 2. Unique & High-Cardinality Lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_token ON public.nfc_cards(card_token);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON public.qr_codes(token);
CREATE INDEX IF NOT EXISTS idx_user_invites_token ON public.user_invites(invite_token);

-- 3. Composite B-Tree Indexes (Equality First, Range/Sort Second)
CREATE INDEX IF NOT EXISTS idx_links_profile_pos ON public.links(profile_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_analytics_profile_time ON public.analytics_events(profile_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_card_time ON public.analytics_events(card_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type_time ON public.analytics_events(event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_time ON public.notifications(recipient_user_id, read, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_active ON public.profiles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_status ON public.nfc_cards(user_id, status);
```

---

## 🔄 Dual-Layer Synchronization Engine ([Dual-Layer Sync Pattern.md](file:///d:/TapIt/Dual-Layer%20Sync%20Pattern.md))

TapIt employs a **Local-First, Dual-Layer Synchronization Engine**:

```
┌──────────────────────────────────────────────────────────────┐
│                        USER ACTION                           │
│     (Edit bio, add link, tap NFC, change theme, scan QR)     │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              LAYER 1: LocalStorage (Instant UI)              │
│                                                              │
│  • React Context state updates immediately (<1ms)            │
│  • localStorage.setItem() persists state to client cache     │
│  • window.dispatchEvent('tapit_*_updated') fires             │
│  • Zero spinners or network lag for the user                 │
└──────────────────┬───────────────────────────────────────────┘
                   │  fire-and-forget (async, non-blocking)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           LAYER 2: Supabase Remote (Persistent Cloud)        │
│                                                              │
│  • void syncToSupabase() non-blocking background push        │
│  • upsert() with onConflict: 'id' for idempotent writes      │
│  • Errors caught gracefully — UI is never interrupted        │
│  • Supabase Realtime postgres_changes broadcasts to devices  │
└──────────────────────────────────────────────────────────────┘
```

### Core Engine Files:
1. **[`src/lib/supabase.ts`](file:///d:/TapIt/src/lib/supabase.ts)**: Safe Supabase client initializer with automatic inert fallback for local offline mode.
2. **[`src/services/dualLayerSync.ts`](file:///d:/TapIt/src/services/dualLayerSync.ts)**: CamelCase ↔ snake_case transformers, push upsert handlers, O(1) Map deduplication merge algorithms, and Realtime websocket listeners.
3. **[`src/components/sync/BackendSyncInit.tsx`](file:///d:/TapIt/src/components/sync/BackendSyncInit.tsx)**: Headless React orchestrator mounted in [`src/App.tsx`](file:///d:/TapIt/src/App.tsx) handling boot hydration, `online`, `focus`, `visibilitychange`, and realtime channel updates.
4. **[`src/store/index.tsx`](file:///d:/TapIt/src/store/index.tsx)**: Central React Context store with integrated background sync dispatchers (`void syncProfilesToSupabase(...)`).

---

## ⚡ Dynamic Token NFC Hardware Engine

Physical TapIt NFC smart cards store a **lightweight, unchangeable dynamic token URL**:
```
https://tapit.app/t/TAP-8xK29mQ
```

### Resolution Flow:
1. Smartphone taps physical NFC chip ➔ Opens `/t/:token`.
2. Handled by [`NFCTapHandler.tsx`](file:///d:/TapIt/src/pages/nfc/NFCTapHandler.tsx).
3. Resolves assigned user and active persona profile in `<10ms`.
4. Redirects to public bio link (`/@username` or `/djan`).
5. Logs tap telemetry (Timestamp, Device Type, OS, Browser).

### Web NFC Writer Modal ([`WebNFCWriterModal.tsx`](file:///d:/TapIt/src/components/nfc/WebNFCWriterModal.tsx))
Native Chromium `NDEFReader` hardware flasher:
1. `Card Selector`: Select token and format (Dynamic `/t/:token` vs Direct `/@slug`).
2. `Sensor Active`: Radar ring pulse (*"📡 Sensor Active • Hold Card to Device"*).
3. `Writing`: Real-time transfer (*"Keep touching back of phone. Do not move!"*).
4. `Success`: Dual-tone rising chime, haptic feedback, and confetti (*"✓ Writing Complete! You may now remove card."*).

> [!TIP]
> For chip pinouts (NTAG213/215/216), antenna locations for Samsung/Pixel/iPhone, local Wi-Fi Chrome flag setup, and Android OS handling, read **[NFC_TAG_WRITING_GUIDE.md](file:///d:/TapIt/NFC_TAG_WRITING_GUIDE.md)**.

---

## 📁 Repository Structure

```
TapIt/
├── .planning/                     # System requirements, roadmap, and state
│   ├── PROJECT.md                 # Product vision and core taglines
│   ├── REQUIREMENTS.md            # Technical requirements matrix
│   ├── ROADMAP.md                 # Multi-phase development roadmap
│   └── STATE.md                   # Current execution checkpoint
├── public/                        # Static assets
├── supabase/                      # Database migrations & schemas
│   └── schema.sql                 # 3NF PostgreSQL schema, indexes, RLS, & Realtime
├── src/
│   ├── assets/                    # Transparent TapIt Logo & visual assets
│   ├── components/
│   │   ├── auth/                  # ProtectedRoute RBAC guard
│   │   ├── common/                # LocalStorageCacheModal
│   │   ├── layout/                # Navbar, DashboardSidebar, AdminSidebar, MobileBottomNav
│   │   ├── nfc/                   # WebNFCWriterModal, NFCTapSimulatorModal, 3D Hero Card
│   │   ├── profile/               # PublicProfileRenderer, MobileFramePreview, ShareModal
│   │   ├── sync/                  # BackendSyncInit (Headless Dual-Layer Orchestrator)
│   │   └── ui/                    # Button, Input, Modal, Toggle, Badge
│   ├── data/
│   │   ├── mockData.ts            # Clean initial state (Admin only)
│   │   └── themes.ts              # Preset theme styles
│   ├── lib/
│   │   ├── supabase.ts            # Safe Supabase client with offline fallback
│   │   └── utils.ts               # Utility functions & confetti triggers
│   ├── layouts/
│   │   ├── AdminLayout.tsx        # Admin suite layout with bottom navigation
│   │   ├── DashboardLayout.tsx    # User portal layout with bottom navigation
│   │   └── RootLayout.tsx         # Public marketing layout
│   ├── pages/
│   │   ├── admin/                 # Overview, Users, Profiles, Cards, Analytics, Settings
│   │   ├── auth/                  # LoginPage, RegisterPage, InviteRegistrationPage
│   │   ├── dashboard/             # Overview, Profiles, Editor, Links, Cards, QRStudio, Analytics, Settings
│   │   ├── nfc/                   # NFCTapHandler, UnclaimedCardPage, DisabledCardPage
│   │   ├── profile/               # PublicProfilePage
│   │   └── public/                # LandingPage, FeaturesPage, HowItWorksPage
│   ├── services/
│   │   └── dualLayerSync.ts       # Dual-Layer push, pull, O(1) merge & Realtime engine
│   ├── store/
│   │   └── index.tsx              # Central state store with localStorage & dual-layer sync
│   ├── types/
│   │   └── index.ts               # TypeScript data models
│   ├── App.tsx                    # Routes & sync orchestrator mount
│   ├── main.tsx                   # React root entry point
│   └── index.css                  # Tailwind styles and keyframe animations
├── .env.example                   # Environment configuration template
├── DATABASE_INDEXING.md           # Database indexing specification blueprint
├── DOCUMENTATION.md               # Master phase-by-phase system documentation
├── Dual-Layer Sync Pattern.md     # Dual-layer data synchronization guide
├── NFC_TAG_WRITING_GUIDE.md       # Hardware NFC writing & chip flashing guide
├── package.json                   # Dependencies and npm scripts
├── tailwind.config.js             # Tailwind theme configuration
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler configuration (with network host broadcast)
```

---

## 🛠️ Build & Verification Commands

```bash
# 1. Install dependencies (including @supabase/supabase-js)
npm install

# 2. Start local dev server (broadcasts on 0.0.0.0 for Wi-Fi mobile testing)
npm run dev

# 3. Verify TypeScript type safety and compile production bundle
npm run build

# 4. Preview production build locally
npm run preview
```

---

*Documentation Version: 4.0.0 | Last Updated: September 2026 | Built for TapIt Smart Identity Platform.*
