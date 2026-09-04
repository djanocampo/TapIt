import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  User, 
  Profile, 
  LinkItem, 
  NFCCard, 
  QRCodeItem, 
  AnalyticsEvent, 
  UserInvite, 
  NotificationItem, 
  SystemSettings 
} from '../types';

// ==============================================================================
// DUAL-LAYER SYNC ENGINE
// Layer 1: Instant LocalStorage & React State (<1ms)
// Layer 2: Fire-and-Forget Non-Blocking Supabase Upserts & Live Realtime
// Reference: Dual-Layer Sync Pattern.md
// ==============================================================================

// ------------------------------------------------------------------------------
// TRANSFORMERS: Frontend (CamelCase) ↔ Database (snake_case)
// ------------------------------------------------------------------------------
export const mapUserToDB = (u: User) => ({
  id: u.id,
  name: u.name,
  username: u.username,
  email: u.email,
  password_hash: u.password || null,
  role: u.role,
  avatar: u.avatar || '',
  bio: u.bio || '',
  headline: u.headline || '',
  status: u.status || 'active',
  created_at: u.createdAt,
  last_login_at: u.lastLoginAt,
});

export const mapDBToUser = (r: any): User => ({
  id: r.id,
  name: r.name,
  username: r.username,
  email: r.email,
  password: r.password_hash || undefined,
  role: r.role,
  avatar: r.avatar || '',
  bio: r.bio || '',
  headline: r.headline || '',
  status: r.status,
  createdAt: r.created_at,
  lastLoginAt: r.last_login_at,
});

export const mapProfileToDB = (p: Profile) => ({
  id: p.id,
  user_id: p.userId,
  name: p.name,
  slug: p.slug,
  display_name: p.displayName || '',
  headline: p.headline || '',
  bio: p.bio || '',
  avatar: p.avatar || '',
  cover_image: p.coverImage || '',
  email: p.email || '',
  show_email: p.showEmail ?? true,
  phone: p.phone || '',
  show_phone: p.showPhone ?? true,
  location: p.location || '',
  website: p.website || '',
  company: p.company || '',
  job_title: p.jobTitle || '',
  theme: p.theme,
  is_active: p.isActive,
  is_archived: p.isArchived,
  socials: p.socials || {},
  created_at: p.createdAt,
  updated_at: p.updatedAt || new Date().toISOString(),
});

export const mapDBToProfile = (r: any): Profile => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  slug: r.slug,
  displayName: r.display_name || '',
  headline: r.headline || '',
  bio: r.bio || '',
  avatar: r.avatar || '',
  coverImage: r.cover_image || undefined,
  email: r.email || undefined,
  showEmail: r.show_email ?? true,
  phone: r.phone || undefined,
  showPhone: r.show_phone ?? true,
  location: r.location || undefined,
  website: r.website || undefined,
  company: r.company || undefined,
  jobTitle: r.job_title || undefined,
  theme: r.theme,
  isActive: r.is_active,
  isArchived: r.is_archived,
  socials: r.socials || {},
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const mapLinkToDB = (l: LinkItem) => ({
  id: l.id,
  profile_id: l.profileId,
  title: l.title,
  url: l.url,
  icon: l.icon || 'Globe',
  category: l.category || 'work',
  position: l.position || 0,
  is_active: l.isActive,
  is_featured: l.isFeatured ?? false,
  clicks: l.clicks || 0,
  last_clicked_at: l.lastClickedAt || null,
  created_at: l.createdAt,
  updated_at: new Date().toISOString(),
});

export const mapDBToLink = (r: any): LinkItem => ({
  id: r.id,
  profileId: r.profile_id,
  title: r.title,
  url: r.url,
  icon: r.icon,
  category: r.category,
  position: r.position,
  isActive: r.is_active,
  isFeatured: r.is_featured,
  clicks: r.clicks,
  lastClickedAt: r.last_clicked_at || undefined,
  createdAt: r.created_at,
});

export const mapCardToDB = (c: NFCCard) => ({
  id: c.id,
  card_token: c.cardToken,
  user_id: c.userId || null,
  profile_id: c.profileId || null,
  name: c.name,
  material: c.material || 'matte-black',
  status: c.status || 'unclaimed',
  taps: c.taps || 0,
  unique_tappers: c.uniqueTappers || 0,
  last_tapped_at: c.lastTappedAt || null,
  created_at: c.createdAt,
  activated_at: c.activatedAt || null,
});

export const mapDBToCard = (r: any): NFCCard => ({
  id: r.id,
  cardToken: r.card_token,
  userId: r.user_id || undefined,
  profileId: r.profile_id || undefined,
  name: r.name,
  material: r.material,
  status: r.status,
  taps: r.taps,
  uniqueTappers: r.unique_tappers,
  lastTappedAt: r.last_tapped_at || undefined,
  createdAt: r.created_at,
  activatedAt: r.activated_at || undefined,
});

export const mapQRToDB = (q: QRCodeItem) => ({
  id: q.id,
  profile_id: q.profileId,
  token: q.token,
  fg_color: q.fgColor || '#06b6d4',
  bg_color: q.bgColor || '#090d16',
  include_logo: q.includeLogo ?? true,
  scans: q.scans || 0,
  last_scanned_at: q.lastScannedAt || null,
  created_at: q.createdAt,
});

export const mapDBToQR = (r: any): QRCodeItem => ({
  id: r.id,
  profileId: r.profile_id,
  token: r.token,
  fgColor: r.fg_color,
  bgColor: r.bg_color,
  includeLogo: r.include_logo,
  scans: r.scans,
  lastScannedAt: r.last_scanned_at || undefined,
  createdAt: r.created_at,
});

export const mapAnalyticsToDB = (a: AnalyticsEvent) => ({
  id: a.id,
  profile_id: a.profileId,
  card_id: a.cardId || null,
  link_id: a.linkId || null,
  event_type: a.eventType,
  traffic_source: a.trafficSource || 'direct',
  device_type: a.deviceType || 'desktop',
  browser: a.browser || 'Chrome',
  os: a.os || 'Windows',
  country: a.country || 'Philippines',
  city: a.city || 'Manila',
  timestamp: a.timestamp,
});

export const mapDBToAnalytics = (r: any): AnalyticsEvent => ({
  id: r.id,
  profileId: r.profile_id,
  cardId: r.card_id || undefined,
  linkId: r.link_id || undefined,
  eventType: r.event_type,
  trafficSource: r.traffic_source,
  deviceType: r.device_type,
  browser: r.browser,
  os: r.os,
  country: r.country,
  city: r.city,
  timestamp: r.timestamp,
});

export const mapInviteToDB = (i: UserInvite) => ({
  id: i.id,
  invite_token: i.inviteToken,
  initial_name: i.initialName,
  card_token: i.cardToken,
  material: i.material || 'matte-black',
  is_used: i.isUsed,
  used_by_user_id: i.usedByUserId || null,
  created_at: i.createdAt,
});

export const mapDBToInvite = (r: any): UserInvite => ({
  id: r.id,
  inviteToken: r.invite_token,
  initialName: r.initial_name,
  cardToken: r.card_token,
  material: r.material,
  isUsed: r.is_used,
  usedByUserId: r.used_by_user_id || undefined,
  createdAt: r.created_at,
});

export const mapNotificationToDB = (n: NotificationItem) => ({
  id: n.id,
  title: n.title,
  message: n.message || '',
  type: n.type || 'info',
  read: n.read,
  link: n.link || null,
  timestamp: n.timestamp,
});

export const mapDBToNotification = (r: any): NotificationItem => ({
  id: r.id,
  title: r.title,
  message: r.message,
  type: r.type,
  read: r.read,
  link: r.link || undefined,
  timestamp: r.timestamp,
});

export const mapSettingsToDB = (s: SystemSettings) => ({
  id: 'global',
  platform_name: s.platformName,
  maintenance_mode: s.maintenanceMode,
  allow_public_registrations: s.allowPublicRegistrations,
  enforce_nfc_verification: s.enforceNfcVerification,
  max_profiles_per_user: s.maxProfilesPerUser,
  max_cards_per_user: s.maxCardsPerUser,
  default_theme: s.defaultTheme,
  supported_platforms: s.supportedPlatforms,
  updated_at: new Date().toISOString(),
});

export const mapDBToSettings = (r: any): SystemSettings => ({
  platformName: r.platform_name,
  maintenanceMode: r.maintenance_mode,
  allowPublicRegistrations: r.allow_public_registrations,
  enforceNfcVerification: r.enforce_nfc_verification,
  maxProfilesPerUser: r.max_profiles_per_user,
  maxCardsPerUser: r.max_cards_per_user,
  defaultTheme: r.default_theme,
  supportedPlatforms: r.supported_platforms || [],
});

// ==============================================================================
// LAYER 2: NON-BLOCKING REMOTE PUSH (Fire-and-Forget)
// ==============================================================================

export async function saveSupabaseRecord(table: string, payload: any): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn(`[Supabase Push] ${table} upsert warning:`, error.message);
    }
  } catch (err) {
    console.warn(`[Supabase Push] ${table} network error:`, err);
  }
}

export async function deleteSupabaseRecord(table: string, id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`[Supabase Delete] ${table} delete warning:`, error.message);
    }
  } catch (err) {
    console.warn(`[Supabase Delete] ${table} network error:`, err);
  }
}

export async function syncProfilesToSupabase(profiles: Profile[]): Promise<void> {
  if (!isSupabaseConfigured() || profiles.length === 0) return;
  try {
    const rows = profiles.map(mapProfileToDB);
    await supabase.from('profiles').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Batch Push] Profiles sync error:', e);
  }
}

export async function syncLinksToSupabase(links: LinkItem[]): Promise<void> {
  if (!isSupabaseConfigured() || links.length === 0) return;
  try {
    const rows = links.map(mapLinkToDB);
    await supabase.from('links').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Batch Push] Links sync error:', e);
  }
}

export async function syncCardsToSupabase(cards: NFCCard[]): Promise<void> {
  if (!isSupabaseConfigured() || cards.length === 0) return;
  try {
    const rows = cards.map(mapCardToDB);
    await supabase.from('nfc_cards').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Batch Push] Cards sync error:', e);
  }
}

export async function syncQRCodesToSupabase(qrCodes: QRCodeItem[]): Promise<void> {
  if (!isSupabaseConfigured() || qrCodes.length === 0) return;
  try {
    const rows = qrCodes.map(mapQRToDB);
    await supabase.from('qr_codes').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Batch Push] QR codes sync error:', e);
  }
}

export async function syncAnalyticsToSupabase(events: AnalyticsEvent[]): Promise<void> {
  if (!isSupabaseConfigured() || events.length === 0) return;
  try {
    const rows = events.map(mapAnalyticsToDB);
    await supabase.from('analytics_events').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Batch Push] Analytics sync error:', e);
  }
}

export async function syncUsersToSupabase(users: User[]): Promise<void> {
  if (!isSupabaseConfigured() || users.length === 0) return;
  try {
    const rows = users.map(mapUserToDB);
    await supabase.from('users').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Batch Push] Users sync error:', e);
  }
}

export async function syncInvitesToSupabase(invites: UserInvite[]): Promise<void> {
  if (!isSupabaseConfigured() || invites.length === 0) return;
  try {
    const rows = invites.map(mapInviteToDB);
    await supabase.from('user_invites').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Batch Push] Invites sync error:', e);
  }
}

export async function syncNotificationsToSupabase(notifs: NotificationItem[]): Promise<void> {
  if (!isSupabaseConfigured() || notifs.length === 0) return;
  try {
    const rows = notifs.map(mapNotificationToDB);
    await supabase.from('notifications').upsert(rows, { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Batch Push] Notifications sync error:', e);
  }
}

export async function clearSupabaseNotifications(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('notifications').delete().neq('id', '');
  } catch (e) {
    console.warn('[Supabase Delete] Notifications clear error:', e);
  }
}

export async function syncSettingsToSupabase(settings: SystemSettings): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('system_settings').upsert(mapSettingsToDB(settings), { onConflict: 'id' });
  } catch (e) {
    console.warn('[Supabase Push] Settings sync error:', e);
  }
}

// ==============================================================================
// MERGE & HYDRATION LAYER (Remote Pull + O(1) Map Deduplication)
// ==============================================================================

export async function fetchRemoteUsers(local: User[]): Promise<User[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return local;

    const merged = new Map<string, User>();
    local.forEach(u => merged.set(u.id, u));
    data.forEach(r => {
      const parsed = mapDBToUser(r);
      const existing = merged.get(parsed.id);
      merged.set(parsed.id, existing ? { ...existing, ...parsed } : parsed);
    });
    return Array.from(merged.values());
  } catch {
    return local;
  }
}

export async function fetchRemoteProfiles(local: Profile[]): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data) return local;

    const merged = new Map<string, Profile>();
    local.forEach(p => merged.set(p.id, p));
    data.forEach(r => {
      const parsed = mapDBToProfile(r);
      const existing = merged.get(parsed.id);
      merged.set(parsed.id, existing ? { ...existing, ...parsed } : parsed);
    });
    return Array.from(merged.values());
  } catch {
    return local;
  }
}

export async function fetchRemoteLinks(local: LinkItem[]): Promise<LinkItem[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('links').select('*').order('position', { ascending: true });
    if (error || !data) return local;

    const merged = new Map<string, LinkItem>();
    local.forEach(l => merged.set(l.id, l));
    data.forEach(r => {
      const parsed = mapDBToLink(r);
      const existing = merged.get(parsed.id);
      merged.set(parsed.id, existing ? { ...existing, ...parsed } : parsed);
    });
    return Array.from(merged.values());
  } catch {
    return local;
  }
}

export async function fetchRemoteCards(local: NFCCard[]): Promise<NFCCard[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('nfc_cards').select('*');
    if (error || !data) return local;

    const merged = new Map<string, NFCCard>();
    local.forEach(c => merged.set(c.id, c));
    data.forEach(r => {
      const parsed = mapDBToCard(r);
      const existing = merged.get(parsed.id);
      merged.set(parsed.id, existing ? { ...existing, ...parsed } : parsed);
    });
    return Array.from(merged.values());
  } catch {
    return local;
  }
}

export async function fetchRemoteQRCodes(local: QRCodeItem[]): Promise<QRCodeItem[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('qr_codes').select('*');
    if (error || !data) return local;

    const merged = new Map<string, QRCodeItem>();
    local.forEach(q => merged.set(q.id, q));
    data.forEach(r => {
      const parsed = mapDBToQR(r);
      const existing = merged.get(parsed.id);
      merged.set(parsed.id, existing ? { ...existing, ...parsed } : parsed);
    });
    return Array.from(merged.values());
  } catch {
    return local;
  }
}

export async function fetchRemoteAnalytics(local: AnalyticsEvent[]): Promise<AnalyticsEvent[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('analytics_events').select('*').order('timestamp', { ascending: false }).limit(500);
    if (error || !data) return local;

    const merged = new Map<string, AnalyticsEvent>();
    local.forEach(a => merged.set(a.id, a));
    data.forEach(r => {
      const parsed = mapDBToAnalytics(r);
      merged.set(parsed.id, parsed);
    });
    return Array.from(merged.values());
  } catch {
    return local;
  }
}

export async function fetchRemoteInvites(local: UserInvite[]): Promise<UserInvite[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('user_invites').select('*');
    if (error || !data) return local;

    const merged = new Map<string, UserInvite>();
    local.forEach(i => merged.set(i.id, i));
    data.forEach(r => {
      const parsed = mapDBToInvite(r);
      const existing = merged.get(parsed.id);
      merged.set(parsed.id, existing ? { ...existing, ...parsed } : parsed);
    });
    return Array.from(merged.values());
  } catch {
    return local;
  }
}

export async function fetchRemoteNotifications(local: NotificationItem[]): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false }).limit(100);
    if (error || !data) return local;

    const merged = new Map<string, NotificationItem>();
    local.forEach(n => merged.set(n.id, n));
    data.forEach(r => {
      const parsed = mapDBToNotification(r);
      const existing = merged.get(parsed.id);
      merged.set(parsed.id, existing ? { ...existing, ...parsed } : parsed);
    });
    return Array.from(merged.values());
  } catch {
    return local;
  }
}

export async function fetchRemoteSettings(local: SystemSettings): Promise<SystemSettings> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('system_settings').select('*').eq('id', 'global').maybeSingle();
    if (error || !data) return local;
    return mapDBToSettings(data);
  } catch {
    return local;
  }
}

// ==============================================================================
// SUPABASE REALTIME MULTI-DEVICE SUBSCRIPTION
// ==============================================================================
export function subscribeToRealtimeChanges(onDataChange: () => void): () => void {
  if (!isSupabaseConfigured()) return () => {};

  try {
    const channel = supabase
      .channel('tapit-global-sync-channel')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        onDataChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase Realtime] Channel subscription warning:', err);
    return () => {};
  }
}
