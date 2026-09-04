-- ==============================================================================
-- TAPIT SMART IDENTITY PLATFORM - DATABASE SCHEMA SPECIFICATION
-- Target Engine: PostgreSQL 14+ / Supabase
-- Architecture: 3NF Normalized Relational Architecture with B-Tree Indexing
-- Reference Standards: DATABASE_INDEXING.md & Dual-Layer Sync Pattern.md
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION TABLE
-- Core platform identity records for System Administrators and End Users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  headline TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. PROFILES (PERSONAS & DIGITAL BUSINESS CARDS)
-- Multi-profile digital personas belonging to a specific user
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  email TEXT DEFAULT '',
  show_email BOOLEAN NOT NULL DEFAULT TRUE,
  phone TEXT DEFAULT '',
  show_phone BOOLEAN NOT NULL DEFAULT TRUE,
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  company TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  theme JSONB NOT NULL DEFAULT '{
    "id": "minimal-dark",
    "name": "Minimal Dark",
    "bgType": "color",
    "bgColor": "#0b0f17",
    "textColor": "#ffffff",
    "subtextColor": "#94a3b8",
    "cardBg": "#111827",
    "cardBorder": "#1e293b",
    "cardHover": "#1f293d",
    "buttonStyle": "rounded",
    "fontStyle": "inter",
    "accentColor": "#06b6d4",
    "badgeBg": "#06b6d420"
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. LINKS & ACTIONS
-- Customizable links, buttons, and embeds attached to a profile
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.links (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Globe',
  category TEXT NOT NULL DEFAULT 'work' CHECK (category IN ('work', 'social', 'portfolio', 'contact', 'media', 'commerce', 'other')),
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  clicks INTEGER NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. NFC HARDWARE SMART CARDS
-- Physical NFC tags, cards, badges, and tokens linked to users and profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nfc_cards (
  id TEXT PRIMARY KEY,
  card_token TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  material TEXT NOT NULL DEFAULT 'matte-black' CHECK (material IN ('matte-black', 'cyber-cyan', 'gold-metal', 'aurora-violet', 'white-ceramic')),
  status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('active', 'unclaimed', 'disabled', 'suspended')),
  taps INTEGER NOT NULL DEFAULT 0,
  unique_tappers INTEGER NOT NULL DEFAULT 0,
  last_tapped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 5. QR CODES
-- Dynamic QR code presets with custom styling per profile
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  fg_color TEXT NOT NULL DEFAULT '#06b6d4',
  bg_color TEXT NOT NULL DEFAULT '#090d16',
  include_logo BOOLEAN NOT NULL DEFAULT TRUE,
  scans INTEGER NOT NULL DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. ANALYTICS & TELEMETRY EVENTS
-- Real-time audit events for taps, scans, views, and link clicks
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_id TEXT REFERENCES public.nfc_cards(id) ON DELETE SET NULL,
  link_id TEXT REFERENCES public.links(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('profile_view', 'nfc_tap', 'qr_scan', 'link_click', 'contact_save', 'profile_share')),
  traffic_source TEXT NOT NULL DEFAULT 'direct' CHECK (traffic_source IN ('nfc', 'qr', 'direct', 'social', 'referral')),
  device_type TEXT NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  browser TEXT NOT NULL DEFAULT 'Chrome',
  os TEXT NOT NULL DEFAULT 'Windows',
  country TEXT NOT NULL DEFAULT 'Philippines',
  city TEXT NOT NULL DEFAULT 'Manila',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. USER ONBOARDING & HARDWARE PROVISIONING INVITES
-- Pre-provisioned invitation tokens mapped to physical smart cards
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_invites (
  id TEXT PRIMARY KEY,
  invite_token TEXT UNIQUE NOT NULL,
  initial_name TEXT NOT NULL,
  card_token TEXT NOT NULL,
  material TEXT NOT NULL DEFAULT 'matte-black',
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. NOTIFICATIONS & SYSTEM ALERTS
-- Real-time alerts for NFC taps, new connections, and administrative messages
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  recipient_user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'tap')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. SYSTEM SETTINGS & PLATFORM CONFIGURATION
-- Global administrative controls, feature flags, and supported social platforms
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  platform_name TEXT NOT NULL DEFAULT 'TapIt Smart Identity Platform',
  maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
  allow_public_registrations BOOLEAN NOT NULL DEFAULT TRUE,
  enforce_nfc_verification BOOLEAN NOT NULL DEFAULT TRUE,
  max_profiles_per_user INTEGER NOT NULL DEFAULT 10,
  max_cards_per_user INTEGER NOT NULL DEFAULT 25,
  default_theme TEXT NOT NULL DEFAULT 'minimal-dark',
  supported_platforms JSONB NOT NULL DEFAULT '[
    {"name": "LinkedIn", "key": "linkedin", "enabled": true, "baseUrl": "https://linkedin.com/in/", "icon": "Linkedin"},
    {"name": "GitHub", "key": "github", "enabled": true, "baseUrl": "https://github.com/", "icon": "Github"},
    {"name": "Instagram", "key": "instagram", "enabled": true, "baseUrl": "https://instagram.com/", "icon": "Instagram"},
    {"name": "X / Twitter", "key": "twitter", "enabled": true, "baseUrl": "https://x.com/", "icon": "Twitter"},
    {"name": "YouTube", "key": "youtube", "enabled": true, "baseUrl": "https://youtube.com/@", "icon": "Youtube"},
    {"name": "TikTok", "key": "tiktok", "enabled": true, "baseUrl": "https://tiktok.com/@", "icon": "Video"},
    {"name": "Spotify", "key": "spotify", "enabled": true, "baseUrl": "https://open.spotify.com/", "icon": "Music"},
    {"name": "Discord", "key": "discord", "enabled": true, "baseUrl": "https://discord.gg/", "icon": "MessageSquare"},
    {"name": "Portfolio", "key": "portfolio", "enabled": true, "baseUrl": "https://", "icon": "Globe"},
    {"name": "Resume", "key": "resume", "enabled": true, "baseUrl": "https://", "icon": "FileText"},
    {"name": "Email", "key": "email", "enabled": true, "baseUrl": "mailto:", "icon": "Mail"},
    {"name": "Phone", "key": "phone", "enabled": true, "baseUrl": "tel:", "icon": "Phone"},
    {"name": "WhatsApp", "key": "whatsapp", "enabled": true, "baseUrl": "https://wa.me/", "icon": "PhoneCall"},
    {"name": "Telegram", "key": "telegram", "enabled": true, "baseUrl": "https://t.me/", "icon": "Send"}
  ]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- DATABASE INDEXING SPECIFICATION (DATABASE_INDEXING.md COMPLIANCE)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. FOREIGN KEY INDEXES (Prevents table locks & accelerates JOINs)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- B. UNIQUE & HIGH-CARDINALITY ROUTING LOOKUPS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_token ON public.nfc_cards(card_token);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON public.qr_codes(token);
CREATE INDEX IF NOT EXISTS idx_user_invites_token ON public.user_invites(invite_token);

-- ------------------------------------------------------------------------------
-- C. COMPOSITE B-TREE INDEXES (Equality first, Range / Sort second)
-- ------------------------------------------------------------------------------
-- 1. Profile links ordered by position (Ultra-fast profile page load)
CREATE INDEX IF NOT EXISTS idx_links_profile_pos ON public.links(profile_id, position ASC);

-- 2. Chronological analytics feed per profile (Dashboard charts & reports)
CREATE INDEX IF NOT EXISTS idx_analytics_profile_time ON public.analytics_events(profile_id, timestamp DESC);

-- 3. Chronological tap audit logs per physical NFC card
CREATE INDEX IF NOT EXISTS idx_analytics_card_time ON public.analytics_events(card_id, timestamp DESC);

-- 4. Global analytics filtering by event type and time
CREATE INDEX IF NOT EXISTS idx_analytics_type_time ON public.analytics_events(event_type, timestamp DESC);

-- 5. User notifications unread filter ordered by newest first
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_time ON public.notifications(recipient_user_id, read, timestamp DESC);

-- 6. Fast active profile resolution per user
CREATE INDEX IF NOT EXISTS idx_profiles_user_active ON public.profiles(user_id, is_active);

-- 7. Card inventory filter by user and allocation status
CREATE INDEX IF NOT EXISTS idx_nfc_cards_user_status ON public.nfc_cards(user_id, status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Development / Application Full Access Policies (Permissive for client-side dual-layer sync)
CREATE POLICY "Allow public read-write for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for links" ON public.links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for nfc_cards" ON public.nfc_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for qr_codes" ON public.qr_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for analytics_events" ON public.analytics_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for user_invites" ON public.user_invites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SUPABASE REALTIME REPLICATION PUBLICATION
-- Enables live multi-device syncing via websocket postgres_changes listeners
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nfc_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;

-- ==============================================================================
-- INITIAL SEED: SYSTEM ADMIN IDENTITY & GLOBAL CONFIG
-- ==============================================================================
INSERT INTO public.users (id, name, username, email, password_hash, role, avatar, headline, bio, status, created_at, last_login_at)
VALUES (
  'usr_admin_001',
  'System Admin',
  'admin',
  'admin@tapit.app',
  'admin123',
  'admin',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  'TapIt System Administrator',
  'Platform administration, hardware NFC batch token provisioning, and security controls.',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

INSERT INTO public.system_settings (id, platform_name, maintenance_mode, allow_public_registrations, enforce_nfc_verification, max_profiles_per_user, max_cards_per_user, default_theme)
VALUES (
  'global',
  'TapIt Smart Identity Platform',
  FALSE,
  TRUE,
  TRUE,
  10,
  25,
  'minimal-dark'
)
ON CONFLICT (id) DO NOTHING;
