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
  recipient_user_id: n.recipientUserId || null,
  profile_id: n.profileId || null,
  timestamp: n.timestamp,
});

export const mapDBToNotification = (r: any): NotificationItem => ({
  id: r.id,
  title: r.title,
  message: r.message,
  type: r.type,
  read: r.read,
  link: r.link || undefined,
  recipientUserId: r.recipient_user_id || undefined,
  profileId: r.profile_id || undefined,
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

export async function deleteSupabaseCard(idOrToken: string, cardToken?: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const token = cardToken || idOrToken;
    const { error } = await supabase
      .from('nfc_cards')
      .delete()
      .or(`id.eq.${idOrToken},card_token.eq.${token},id.eq.${token},card_token.eq.${idOrToken}`);
    if (error) {
      console.warn('[Supabase Delete] nfc_cards delete warning:', error.message);
    }
    // Clean up any matching hardware invite
    await supabase
      .from('user_invites')
      .delete()
      .or(`card_token.eq.${token},card_token.eq.${idOrToken}`);
  } catch (err) {
    console.warn('[Supabase Delete] Card deletion network error:', err);
  }
}

export async function deleteSupabaseUser(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    // 1. Delete user row from users table (Postgres cascades to profiles & links)
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.warn('[Supabase Delete] User delete warning:', error.message);
    }
    // 2. Unbind physical cards assigned to this user back to unclaimed inventory
    await supabase
      .from('nfc_cards')
      .update({ user_id: null, profile_id: null, status: 'unclaimed' })
      .eq('user_id', userId);
    // 3. Clean up invites used by this user
    await supabase.from('user_invites').delete().eq('used_by_user_id', userId);
    // 4. Clean up notifications for this user
    await supabase.from('notifications').delete().eq('recipient_user_id', userId);
  } catch (err) {
    console.warn('[Supabase Delete] User deletion network error:', err);
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
    const { error } = await supabase.from('nfc_cards').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase Batch Push] Cards sync error:', error.message);
    }
  } catch (e) {
    console.warn('[Supabase Batch Push] Cards sync error:', e);
  }
}

/**
 * Explicit single-entity upserts for registration flow.
 * Guarantees that users and profiles are written and committed in Supabase
 * BEFORE any child records (like nfc_cards with foreign keys) are inserted/updated.
 */
export async function upsertSingleUser(user: User): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  try {
    const row = mapUserToDB(user);
    const { error } = await supabase.from('users').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('[Supabase Direct] upsertSingleUser error:', error.message, error.details);
      return false;
    }
    console.log(`[Supabase Direct] User ${user.id} (${user.username}) successfully synced to Supabase`);
    return true;
  } catch (err) {
    console.error('[Supabase Direct] upsertSingleUser network error:', err);
    return false;
  }
}

export async function upsertSingleProfile(profile: Profile): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  try {
    const row = mapProfileToDB(profile);
    const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('[Supabase Direct] upsertSingleProfile error:', error.message, error.details);
      return false;
    }
    console.log(`[Supabase Direct] Profile ${profile.id} (${profile.slug}) successfully synced to Supabase`);
    return true;
  } catch (err) {
    console.error('[Supabase Direct] upsertSingleProfile network error:', err);
    return false;
  }
}

export async function upsertSingleQRCode(qr: QRCodeItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  try {
    const row = mapQRToDB(qr);
    const { error } = await supabase.from('qr_codes').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('[Supabase Direct] upsertSingleQRCode error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase Direct] upsertSingleQRCode network error:', err);
    return false;
  }
}

/**
 * Direct targeted card binding with token normalization, multi-stage fallback,
 * and post-write verification. Ensures that nfc_cards row in Supabase has
 * user_id, profile_id, and status = 'active'.
 */
export async function bindCardToUser(
  cardToken: string,
  userId: string,
  profileId: string,
  cardName: string,
  material: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  try {
    const clean = cardToken.trim();
    const cleanUpper = clean.toUpperCase();
    const stripped = cleanUpper.replace(/^TAP-/, '');
    const candidateTokens = Array.from(new Set([
      clean,
      cleanUpper,
      clean.toLowerCase(),
      stripped,
      stripped.toLowerCase(),
      `TAP-${stripped}`,
      `tap-${stripped.toLowerCase()}`,
    ]));

    console.log(`[Supabase Direct] Binding card token="${cleanUpper}" to userId="${userId}", profileId="${profileId}"...`);

    // 1. Search for any existing card record in Supabase matching any variant of this token
    const { data: existingRows, error: searchError } = await supabase
      .from('nfc_cards')
      .select('id, card_token, user_id, profile_id')
      .in('card_token', candidateTokens)
      .limit(1);

    if (searchError) {
      console.warn('[Supabase Direct] Search card error:', searchError.message);
    }

    if (existingRows && existingRows.length > 0) {
      const targetCard = existingRows[0];
      console.log(`[Supabase Direct] Found existing card id="${targetCard.id}" for token="${targetCard.card_token}". Updating binding...`);

      const { error: updateError } = await supabase
        .from('nfc_cards')
        .update({
          user_id: userId,
          profile_id: profileId,
          status: 'active',
          name: cardName,
          material: material || 'matte-black',
          activated_at: new Date().toISOString(),
        })
        .eq('id', targetCard.id);

      if (updateError) {
        console.error('[Supabase Direct] Update card by id failed:', updateError.message, updateError.details);
        // Fallback: update by card_token
        const { error: tokenUpdateError } = await supabase
          .from('nfc_cards')
          .update({
            user_id: userId,
            profile_id: profileId,
            status: 'active',
            name: cardName,
            material: material || 'matte-black',
            activated_at: new Date().toISOString(),
          })
          .ilike('card_token', targetCard.card_token);

        if (tokenUpdateError) {
          console.error('[Supabase Direct] Fallback update by card_token failed:', tokenUpdateError.message);
          return false;
        }
      }
    } else {
      // 2. Card does not exist in DB yet — insert fresh active bound card record
      console.log(`[Supabase Direct] Card not found in DB. Inserting fresh bound card token="${cleanUpper}"...`);
      const canonicalToken = cleanUpper.startsWith('TAP-') ? cleanUpper : `TAP-${cleanUpper}`;
      const newCardId = `crd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const { error: insertError } = await supabase
        .from('nfc_cards')
        .insert({
          id: newCardId,
          card_token: canonicalToken,
          user_id: userId,
          profile_id: profileId,
          name: cardName,
          material: material || 'matte-black',
          status: 'active',
          taps: 0,
          unique_tappers: 0,
          created_at: new Date().toISOString(),
          activated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('[Supabase Direct] Failed to insert new bound card:', insertError.message, insertError.details);
        // If unique collision on card_token, fallback update
        if (insertError.code === '23505' || insertError.message.includes('unique constraint') || insertError.message.includes('card_token')) {
          console.log('[Supabase Direct] Collision detected on card_token. Attempting update...');
          const { error: fallbackError } = await supabase
            .from('nfc_cards')
            .update({
              user_id: userId,
              profile_id: profileId,
              status: 'active',
              name: cardName,
              material: material || 'matte-black',
              activated_at: new Date().toISOString(),
            })
            .ilike('card_token', cleanUpper);

          if (fallbackError) {
            console.error('[Supabase Direct] Collision fallback update failed:', fallbackError.message);
            return false;
          }
        } else {
          return false;
        }
      }
    }

    // 3. Verification check: confirm the row in DB now has user_id and profile_id
    const { data: verified, error: verifyError } = await supabase
      .from('nfc_cards')
      .select('id, card_token, user_id, profile_id, status')
      .in('card_token', candidateTokens)
      .limit(1)
      .maybeSingle();

    if (!verifyError && verified && verified.user_id === userId) {
      console.log(`[Supabase Direct] SUCCESS: Card "${verified.card_token}" verified bound to user_id="${verified.user_id}", profile_id="${verified.profile_id}", status="${verified.status}"`);
      return true;
    } else {
      console.warn(`[Supabase Direct] WARNING: Verification check returned user_id="${verified?.user_id || 'null'}", status="${verified?.status || 'unknown'}"`);
      return false;
    }
  } catch (e) {
    console.error('[Supabase Direct] bindCardToUser unexpected exception:', e);
    return false;
  }
}

/**
 * Auto-healer: Scans for cards in Supabase that have user_id IS NULL but whose
 * corresponding user_invite was marked used with a used_by_user_id.
 * Heals previously registered accounts whose card binding failed.
 */
export async function autoHealUnboundCards(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: usedInvites, error: invError } = await supabase
      .from('user_invites')
      .select('card_token, used_by_user_id')
      .eq('is_used', true)
      .not('used_by_user_id', 'is', null);

    if (invError || !usedInvites || usedInvites.length === 0) return;

    for (const inv of usedInvites) {
      if (!inv.card_token || !inv.used_by_user_id) continue;

      // Check if this card is currently unbound in nfc_cards
      const { data: unboundCards } = await supabase
        .from('nfc_cards')
        .select('id, card_token, user_id, profile_id')
        .ilike('card_token', inv.card_token)
        .is('user_id', null)
        .limit(1);

      if (unboundCards && unboundCards.length > 0) {
        const cardToHeal = unboundCards[0];
        // Fetch the user's primary profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('user_id', inv.used_by_user_id)
          .limit(1)
          .maybeSingle();

        if (profile) {
          console.log(`[Supabase Auto-Heal] Healing orphaned card "${cardToHeal.card_token}" for user "${inv.used_by_user_id}"...`);
          await supabase
            .from('nfc_cards')
            .update({
              user_id: inv.used_by_user_id,
              profile_id: profile.id,
              status: 'active',
              activated_at: new Date().toISOString(),
            })
            .eq('id', cardToHeal.id);
        }
      }
    }
  } catch (err) {
    // Non-blocking background heal
    console.warn('[Supabase Auto-Heal] Background check encountered error:', err);
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
// MERGE & HYDRATION LAYER (Remote Authoritative Pull with Offline Fallback)
// ==============================================================================

export async function fetchRemoteUsers(local: User[]): Promise<User[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return local;
    return data.map(mapDBToUser);
  } catch {
    return local;
  }
}

export async function fetchRemoteProfiles(local: Profile[]): Promise<Profile[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data) return local;
    return data.map(mapDBToProfile);
  } catch {
    return local;
  }
}

export async function fetchRemoteLinks(local: LinkItem[]): Promise<LinkItem[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('links').select('*').order('position', { ascending: true });
    if (error || !data) return local;
    return data.map(mapDBToLink);
  } catch {
    return local;
  }
}

export async function fetchRemoteCards(local: NFCCard[]): Promise<NFCCard[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    // Trigger non-blocking auto-heal of any previously unbound cards from used invites
    void autoHealUnboundCards();

    const { data, error } = await supabase.from('nfc_cards').select('*');
    if (error || !data) return local;
    return data.map(mapDBToCard);
  } catch {
    return local;
  }
}

export async function fetchRemoteQRCodes(local: QRCodeItem[]): Promise<QRCodeItem[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('qr_codes').select('*');
    if (error || !data) return local;
    return data.map(mapDBToQR);
  } catch {
    return local;
  }
}

export async function fetchRemoteAnalytics(local: AnalyticsEvent[]): Promise<AnalyticsEvent[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('analytics_events').select('*').order('timestamp', { ascending: false }).limit(500);
    if (error || !data) return local;
    return data.map(mapDBToAnalytics);
  } catch {
    return local;
  }
}

export async function fetchRemoteInvites(local: UserInvite[]): Promise<UserInvite[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('user_invites').select('*');
    if (error || !data) return local;
    return data.map(mapDBToInvite);
  } catch {
    return local;
  }
}

export async function fetchRemoteNotifications(local: NotificationItem[]): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured()) return local;
  try {
    const { data, error } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false }).limit(100);
    if (error || !data) return local;
    return data.map(mapDBToNotification);
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
