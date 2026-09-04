import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Profile, 
  LinkItem, 
  NFCCard, 
  QRCodeItem, 
  AnalyticsEvent, 
  NotificationItem, 
  SystemSettings, 
  CardMaterial, 
  UserInvite 
} from '../types';
import { 
  INITIAL_ADMIN, 
  INITIAL_PROFILES, 
  INITIAL_LINKS, 
  INITIAL_CARDS, 
  INITIAL_QR_CODES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ANALYTICS_EVENTS, 
  INITIAL_SYSTEM_SETTINGS, 
  ADMIN_USERS_LIST 
} from '../data/mockData';
import { THEME_PRESETS } from '../data/themes';
import { 
  syncProfilesToSupabase,
  syncLinksToSupabase,
  syncCardsToSupabase,
  syncQRCodesToSupabase,
  syncAnalyticsToSupabase,
  syncUsersToSupabase,
  syncInvitesToSupabase,
  syncNotificationsToSupabase,
  clearSupabaseNotifications,
  syncSettingsToSupabase,
  deleteSupabaseRecord
} from '../services/dualLayerSync';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RemoteHydrationPayload {
  users?: User[];
  profiles?: Profile[];
  links?: LinkItem[];
  cards?: NFCCard[];
  qrCodes?: QRCodeItem[];
  analytics?: AnalyticsEvent[];
  invites?: UserInvite[];
  notifications?: NotificationItem[];
  settings?: SystemSettings;
}

interface TapItContextType {
  currentUser: User;
  currentRole: UserRole;
  isAuthenticated: boolean;
  profiles: Profile[];
  activeProfile: Profile;
  links: LinkItem[];
  cards: NFCCard[];
  qrCodes: QRCodeItem[];
  analyticsEvents: AnalyticsEvent[];
  notifications: NotificationItem[];
  systemSettings: SystemSettings;
  allUsers: User[];
  invites: UserInvite[];
  isSimulatorOpen: boolean;
  simulatorCard: NFCCard | null;

  // Auth & Session
  login: (user: User, role: UserRole) => void;
  logout: () => void;

  // Role & Profile Navigation
  setRole: (role: UserRole) => void;
  setActiveProfileId: (id: string) => void;
  
  // Profile Actions
  createProfile: (data: Partial<Profile>) => Profile;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string) => Profile;
  toggleProfileArchive: (id: string) => void;
  
  // Link Actions
  addLink: (link: Omit<LinkItem, 'id' | 'createdAt' | 'clicks'>) => LinkItem;
  updateLink: (id: string, updates: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  toggleLinkActive: (id: string) => void;
  reorderLinks: (profileId: string, orderedIds: string[]) => void;
  recordLinkClick: (linkId: string, profileId: string, source?: string) => void;

  // Card Actions
  claimCard: (cardToken: string, profileId: string, name?: string) => { success: boolean; card?: NFCCard; message: string };
  updateCard: (id: string, updates: Partial<NFCCard>) => void;
  deleteCard: (id: string) => void;
  toggleCardStatus: (id: string) => void;
  reassignCard: (cardId: string, profileId: string) => void;
  generateBatchCards: (count: number, material: CardMaterial) => NFCCard[];
  recordCardTap: (cardToken: string) => { card?: NFCCard; profile?: Profile; status: string };

  // User Provisioning Wizard Actions
  createInvite: (initialName: string, material: CardMaterial, customCardToken?: string) => { invite: UserInvite; inviteUrl: string };
  getInviteByToken: (inviteToken: string) => UserInvite | undefined;
  completeInviteRegistration: (inviteToken: string, data: { name: string; username: string; email: string; password?: string }) => { success: boolean; user?: User; message: string };
  registerUser: (data: { name: string; username: string; email: string; password?: string }) => { success: boolean; user?: User; message: string };

  // QR Actions
  updateQRCode: (id: string, updates: Partial<QRCodeItem>) => void;
  recordQRScan: (profileId: string) => void;

  // Telemetry & Logs
  logAnalyticsEvent: (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Admin Actions
  toggleUserStatus: (userId: string) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;

  // Simulator
  openSimulator: (card?: NFCCard | null) => void;
  closeSimulator: () => void;

  // Dual-Layer Remote Hydration
  hydrateFromRemote: (payload: RemoteHydrationPayload) => void;

  // Utilities & Cache Management
  resetAllData: () => void;
  clearLocalStorageCache: (options?: { keepSession?: boolean; reload?: boolean }) => void;
  reloadFromStorage: () => void;
  getStorageMetrics: () => { keysCount: number; approxBytes: number; profilesCount: number; cardsCount: number; linksCount: number; eventsCount: number };
}

const STORAGE_KEY = 'tapit_app_live_v11';

const TapItContext = createContext<TapItContextType | undefined>(undefined);

export const TapItProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Layer 1: Load initial state from LocalStorage or clean initial state
  const loadStoredData = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStoredData('isAuthenticated', false));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadStoredData('role', 'user'));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return loadStoredData('currentUser', INITIAL_ADMIN);
  });
  const [profiles, setProfiles] = useState<Profile[]>(() => loadStoredData('profiles', INITIAL_PROFILES));
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => loadStoredData('activeProfileId', ''));
  const [links, setLinks] = useState<LinkItem[]>(() => loadStoredData('links', INITIAL_LINKS));
  const [cards, setCards] = useState<NFCCard[]>(() => loadStoredData('cards', INITIAL_CARDS));
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>(() => loadStoredData('qrCodes', INITIAL_QR_CODES));
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => loadStoredData('analyticsEvents', INITIAL_ANALYTICS_EVENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStoredData('notifications', INITIAL_NOTIFICATIONS));
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => loadStoredData('systemSettings', INITIAL_SYSTEM_SETTINGS));
  const [allUsers, setAllUsers] = useState<User[]>(() => loadStoredData('allUsers', ADMIN_USERS_LIST));
  const [invites, setInvites] = useState<UserInvite[]>(() => loadStoredData('invites', []));

  // Simulator modal state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorCard, setSimulatorCard] = useState<NFCCard | null>(null);

  // Sync to Layer 1 (LocalStorage)
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_role`, JSON.stringify(currentRole));
      localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(profiles));
      localStorage.setItem(`${STORAGE_KEY}_activeProfileId`, JSON.stringify(activeProfileId));
      localStorage.setItem(`${STORAGE_KEY}_links`, JSON.stringify(links));
      localStorage.setItem(`${STORAGE_KEY}_cards`, JSON.stringify(cards));
      localStorage.setItem(`${STORAGE_KEY}_qrCodes`, JSON.stringify(qrCodes));
      localStorage.setItem(`${STORAGE_KEY}_analyticsEvents`, JSON.stringify(analyticsEvents));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_systemSettings`, JSON.stringify(systemSettings));
      localStorage.setItem(`${STORAGE_KEY}_allUsers`, JSON.stringify(allUsers));
      localStorage.setItem(`${STORAGE_KEY}_invites`, JSON.stringify(invites));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [currentRole, profiles, activeProfileId, links, cards, qrCodes, analyticsEvents, notifications, systemSettings, allUsers, invites]);

  // Auth & Session
  const login = (user: User, role: UserRole) => {
    setCurrentUser(user);
    setCurrentRole(role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(user));
      localStorage.setItem(`${STORAGE_KEY}_role`, JSON.stringify(role));
      localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(true));
    } catch {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(false));
    } catch {}
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
    } else {
      const existingUser = allUsers.find(u => u.role === 'user') || INITIAL_ADMIN;
      setCurrentUser(existingUser);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles.find(p => p.userId === currentUser.id) || profiles[0] || {
    id: 'prof_default',
    userId: currentUser.id,
    name: 'Primary Profile',
    slug: currentUser.username || 'user',
    displayName: currentUser.name || 'TapIt User',
    headline: currentUser.headline || 'Digital Identity Owner',
    bio: currentUser.bio || 'Connect with me across the web!',
    avatar: currentUser.avatar || '',
    theme: THEME_PRESETS['minimal-dark'],
    isActive: true,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    socials: {}
  };

  const setActiveProfileId = (id: string) => {
    setActiveProfileIdState(id);
    setProfiles(prev => {
      const updated = prev.map(p => ({
        ...p,
        isActive: p.id === id,
      }));
      void syncProfilesToSupabase(updated);
      return updated;
    });
  };

  // Profile Operations
  const createProfile = (data: Partial<Profile>): Profile => {
    const newId = `prof_${Date.now()}`;
    const slug = (data.slug || `profile-${Date.now().toString().slice(-4)}`).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    const newProfile: Profile = {
      id: newId,
      userId: currentUser.id,
      name: data.name || 'New Persona',
      slug,
      displayName: data.displayName || currentUser.name,
      headline: data.headline || 'Digital Explorer & Creator',
      bio: data.bio || 'Connect with me across the web!',
      avatar: data.avatar || currentUser.avatar,
      coverImage: data.coverImage,
      theme: data.theme || THEME_PRESETS['cyberpunk-neon'],
      isActive: profiles.length === 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socials: data.socials || {},
      ...data,
    };

    setProfiles(prev => {
      const updated = [newProfile, ...prev];
      void syncProfilesToSupabase(updated);
      return updated;
    });

    if (profiles.length === 0) {
      setActiveProfileIdState(newId);
    }

    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
      void syncProfilesToSupabase(updated);
      return updated;
    });
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => {
      const updated = prev.filter(p => p.id !== id);
      void deleteSupabaseRecord('profiles', id);
      return updated;
    });
    setLinks(prev => prev.filter(l => l.profileId !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter(p => p.id !== id);
      if (remaining.length > 0) {
        setActiveProfileId(remaining[0].id);
      }
    }
  };

  const duplicateProfile = (id: string): Profile => {
    const target = profiles.find(p => p.id === id);
    if (!target) throw new Error('Profile not found');

    const newId = `prof_${Date.now()}`;
    const newSlug = `${target.slug}-copy-${Date.now().toString().slice(-3)}`;
    const duplicatedProfile: Profile = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      slug: newSlug,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const targetLinks = links.filter(l => l.profileId === id);
    const duplicatedLinks: LinkItem[] = targetLinks.map(l => ({
      ...l,
      id: `lnk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      profileId: newId,
      clicks: 0,
      createdAt: new Date().toISOString(),
    }));

    setProfiles(prev => {
      const updated = [duplicatedProfile, ...prev];
      void syncProfilesToSupabase(updated);
      return updated;
    });

    setLinks(prev => {
      const updated = [...prev, ...duplicatedLinks];
      void syncLinksToSupabase(updated);
      return updated;
    });

    return duplicatedProfile;
  };

  const toggleProfileArchive = (id: string) => {
    setProfiles(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, isArchived: !p.isArchived } : p));
      void syncProfilesToSupabase(updated);
      return updated;
    });
  };

  // Link Operations
  const addLink = (linkData: Omit<LinkItem, 'id' | 'createdAt' | 'clicks'>): LinkItem => {
    const newLink: LinkItem = {
      ...linkData,
      id: `lnk_${Date.now()}`,
      clicks: 0,
      createdAt: new Date().toISOString(),
    };

    setLinks(prev => {
      const updated = [newLink, ...prev];
      void syncLinksToSupabase(updated);
      return updated;
    });
    return newLink;
  };

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    setLinks(prev => {
      const updated = prev.map(l => (l.id === id ? { ...l, ...updates } : l));
      void syncLinksToSupabase(updated);
      return updated;
    });
  };

  const deleteLink = (id: string) => {
    setLinks(prev => {
      const updated = prev.filter(l => l.id !== id);
      void deleteSupabaseRecord('links', id);
      return updated;
    });
  };

  const toggleLinkActive = (id: string) => {
    setLinks(prev => {
      const updated = prev.map(l => (l.id === id ? { ...l, isActive: !l.isActive } : l));
      void syncLinksToSupabase(updated);
      return updated;
    });
  };

  const reorderLinks = (profileId: string, orderedIds: string[]) => {
    setLinks(prev => {
      const otherLinks = prev.filter(l => l.profileId !== profileId);
      const targetLinks = prev.filter(l => l.profileId === profileId);

      const reordered = orderedIds
        .map((id, index) => {
          const item = targetLinks.find(l => l.id === id);
          return item ? { ...item, position: index } : null;
        })
        .filter(Boolean) as LinkItem[];

      const updated = [...otherLinks, ...reordered];
      void syncLinksToSupabase(updated);
      return updated;
    });
  };

  const getClientDeviceInfo = (): {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux';
    browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other';
  } => {
    if (typeof window === 'undefined') {
      return { deviceType: 'desktop', os: 'Windows', browser: 'Chrome' };
    }
    const ua = navigator.userAgent;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    let os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' = 'Windows';
    let browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other' = 'Chrome';

    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) {
      deviceType = 'mobile';
    }

    if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/macintosh|mac\sos\sx/i.test(ua)) os = 'macOS';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/linux/i.test(ua)) os = 'Linux';

    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else browser = 'Other';

    return { deviceType, os, browser };
  };

  const recordLinkClick = (linkId: string, profileId: string, source = 'direct') => {
    setLinks(prev => {
      const updated = prev.map(l => (l.id === linkId ? { ...l, clicks: l.clicks + 1, lastClickedAt: new Date().toISOString() } : l));
      void syncLinksToSupabase(updated);
      return updated;
    });

    const client = getClientDeviceInfo();

    logAnalyticsEvent({
      profileId,
      linkId,
      eventType: 'link_click',
      trafficSource: source as any,
      deviceType: client.deviceType,
      browser: client.browser,
      os: client.os,
      country: 'Philippines',
      city: 'Manila',
    });
  };

  // Card Operations
  const claimCard = (cardToken: string, profileId: string, name?: string) => {
    const existing = cards.find(c => c.cardToken.toLowerCase() === cardToken.toLowerCase());

    if (!existing) {
      const newCard: NFCCard = {
        id: `crd_${Date.now()}`,
        cardToken,
        userId: currentUser.id,
        profileId,
        name: name || 'My TapIt Card',
        material: 'matte-black',
        status: 'active',
        taps: 0,
        uniqueTappers: 0,
        createdAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
      };
      setCards(prev => {
        const updated = [newCard, ...prev];
        void syncCardsToSupabase(updated);
        return updated;
      });
      return { success: true, card: newCard, message: 'NFC Card successfully registered and bound!' };
    }

    if (existing.status === 'active' && existing.userId && existing.userId !== currentUser.id) {
      return { success: false, message: 'This card is already claimed by another account.' };
    }

    const updatedCard: NFCCard = {
      ...existing,
      userId: currentUser.id,
      profileId,
      status: 'active',
      name: name || existing.name,
      activatedAt: new Date().toISOString(),
    };

    setCards(prev => {
      const updated = prev.map(c => (c.id === existing.id ? updatedCard : c));
      void syncCardsToSupabase(updated);
      return updated;
    });
    return { success: true, card: updatedCard, message: 'Card activated successfully!' };
  };

  const updateCard = (id: string, updates: Partial<NFCCard>) => {
    setCards(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, ...updates } : c));
      void syncCardsToSupabase(updated);
      return updated;
    });
  };

  const deleteCard = (id: string) => {
    setCards(prev => {
      const updated = prev.filter(c => c.id !== id);
      void syncCardsToSupabase(updated);
      return updated;
    });
    if (isSupabaseConfigured()) {
      void supabase.from('nfc_cards').delete().eq('id', id);
    }
  };

  const toggleCardStatus = (id: string) => {
    setCards(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, status: (c.status === 'active' ? 'disabled' : 'active') as NFCCard['status'] } : c));
      void syncCardsToSupabase(updated);
      return updated;
    });
  };

  const reassignCard = (cardId: string, profileId: string) => {
    setCards(prev => {
      const updated = prev.map(c => (c.id === cardId ? { ...c, profileId } : c));
      void syncCardsToSupabase(updated);
      return updated;
    });
  };

  const generateBatchCards = (count: number, material: CardMaterial): NFCCard[] => {
    const newCards: NFCCard[] = [];
    for (let i = 0; i < count; i++) {
      const cardToken = `TAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      newCards.push({
        id: `crd_${Date.now()}_${i}`,
        cardToken,
        name: `TapIt ${material} Hardware Card #${i + 1}`,
        material,
        status: 'unclaimed',
        taps: 0,
        uniqueTappers: 0,
        createdAt: new Date().toISOString(),
      });
    }
    setCards(prev => {
      const updated = [...newCards, ...prev];
      void syncCardsToSupabase(updated);
      return updated;
    });
    return newCards;
  };

  const recordCardTap = (cardToken: string) => {
    const cleanToken = cardToken.trim();
    const card = cards.find(c => c.cardToken.toLowerCase() === cleanToken.toLowerCase());

    if (!card) {
      if (profiles.length > 0) {
        const targetProfile = profiles.find(p => p.isActive) || profiles[0];
        const newCard: NFCCard = {
          id: `crd_${Date.now()}`,
          cardToken: cleanToken,
          userId: targetProfile.userId,
          profileId: targetProfile.id,
          name: `NFC Card (${cleanToken})`,
          material: 'matte-black',
          status: 'active',
          taps: 1,
          uniqueTappers: 1,
          createdAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
          lastTappedAt: new Date().toISOString(),
        };
        setCards(prev => {
          const updated = [newCard, ...prev];
          void syncCardsToSupabase(updated);
          return updated;
        });

        const client = getClientDeviceInfo();
        logAnalyticsEvent({
          profileId: targetProfile.id,
          cardId: newCard.id,
          eventType: 'nfc_tap',
          trafficSource: 'nfc',
          deviceType: client.deviceType,
          browser: client.browser,
          os: client.os,
          country: 'Philippines',
          city: 'Manila',
        });

        return { card: newCard, profile: targetProfile, status: 'active' };
      }
      return { status: 'invalid_card' };
    }

    if (card.status === 'disabled') return { card, status: 'disabled' };
    if (card.status === 'unclaimed') return { card, status: 'unclaimed' };

    setCards(prev => {
      const updated = prev.map(c => (c.id === card.id ? { ...c, taps: c.taps + 1, lastTappedAt: new Date().toISOString() } : c));
      void syncCardsToSupabase(updated);
      return updated;
    });

    const targetProfile = profiles.find(p => p.id === card.profileId) || profiles[0];

    const client = getClientDeviceInfo();

    logAnalyticsEvent({
      profileId: targetProfile ? targetProfile.id : '',
      cardId: card.id,
      eventType: 'nfc_tap',
      trafficSource: 'nfc',
      deviceType: client.deviceType,
      browser: client.browser,
      os: client.os,
      country: 'Philippines',
      city: 'Manila',
    });

    return { card, profile: targetProfile, status: 'active' };
  };

  // Invite & Provisioning Wizard Actions
  const createInvite = (initialName: string, material: CardMaterial = 'matte-black', customCardToken?: string) => {
    const inviteId = `inv_${Date.now()}`;
    const inviteToken = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const cardToken = customCardToken?.trim() || `TAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const existingCard = cards.find(c => c.cardToken.toLowerCase() === cardToken.toLowerCase());
    if (!existingCard) {
      const newCard: NFCCard = {
        id: `crd_${Date.now()}`,
        cardToken: cardToken,
        name: `${initialName || 'New Member'}'s Smart Card`,
        material: material,
        status: 'unclaimed',
        taps: 0,
        uniqueTappers: 0,
        createdAt: new Date().toISOString(),
      };
      setCards(prev => {
        const updated = [newCard, ...prev];
        void syncCardsToSupabase(updated);
        return updated;
      });
    }

    const newInvite: UserInvite = {
      id: inviteId,
      inviteToken,
      initialName: initialName || 'New Member',
      cardToken,
      material,
      createdAt: new Date().toISOString(),
      isUsed: false,
    };

    setInvites(prev => {
      const updated = [newInvite, ...prev];
      void syncInvitesToSupabase(updated);
      return updated;
    });

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
    const inviteUrl = `${origin}/invite/${inviteToken}`;

    return { invite: newInvite, inviteUrl };
  };

  const getInviteByToken = (inviteToken: string) => {
    if (!inviteToken) return undefined;
    const clean = inviteToken.trim();
    const cleanUpper = clean.toUpperCase();
    const tokenWithoutPrefix = cleanUpper.startsWith('INV-') ? cleanUpper.replace(/^INV-/, '') : cleanUpper;
    const tokenWithPrefix = cleanUpper.startsWith('INV-') ? cleanUpper : `INV-${cleanUpper}`;

    return invites.find(inv => {
      const invTokenUpper = (inv.inviteToken || '').toUpperCase();
      return (
        invTokenUpper === cleanUpper ||
        invTokenUpper === tokenWithPrefix ||
        invTokenUpper === tokenWithoutPrefix ||
        inv.id === clean ||
        inv.id === cleanUpper
      );
    });
  };

  const completeInviteRegistration = (inviteToken: string, data: { name: string; username: string; email: string; password?: string }) => {
    const invite = getInviteByToken(inviteToken);
    if (!invite) {
      return { success: false, message: 'Invalid or expired invitation link.' };
    }
    if (invite.isUsed) {
      return { success: false, message: 'This invitation link has already been used.' };
    }

    const newUserId = `usr_${Date.now()}`;
    const newProfileId = `prof_${Date.now()}`;
    const cleanUsername = data.username.toLowerCase().replace(/[^a-z0-9_-]/g, '') || `user${Date.now().toString().slice(-4)}`;

    const newUser: User = {
      id: newUserId,
      name: data.name.trim(),
      username: cleanUsername,
      email: data.email.trim().toLowerCase(),
      password: data.password || 'password123',
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      headline: 'Digital Identity & NFC Smart Card Owner',
      bio: `Welcome to ${data.name.trim()}'s TapIt profile. Connect, save contact, or explore my links below!`,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const newProfile: Profile = {
      id: newProfileId,
      userId: newUserId,
      name: 'Primary Profile',
      slug: cleanUsername,
      displayName: data.name.trim(),
      headline: 'TapIt Smart Card Member',
      bio: 'Tap my NFC card to connect instantly or save my contact details.',
      avatar: newUser.avatar,
      email: data.email.trim(),
      theme: THEME_PRESETS['cyberpunk-neon'],
      isActive: true,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socials: {},
    };

    const newQR: QRCodeItem = {
      id: `qr_${Date.now()}`,
      profileId: newProfileId,
      token: `qr_${cleanUsername}`,
      fgColor: '#06b6d4',
      bgColor: '#090d16',
      includeLogo: true,
      scans: 0,
      createdAt: new Date().toISOString(),
    };

    // Link pre-bound physical card
    setCards(prev => {
      let found = false;
      const updated = prev.map(c => {
        if (c.cardToken.toLowerCase() === invite.cardToken.toLowerCase()) {
          found = true;
          return {
            ...c,
            userId: newUserId,
            profileId: newProfileId,
            status: 'active' as const,
            name: `${data.name.trim()}'s Smart Card`,
            activatedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      if (!found) {
        const newCard: NFCCard = {
          id: `crd_${Date.now()}`,
          cardToken: invite.cardToken,
          userId: newUserId,
          profileId: newProfileId,
          name: `${data.name.trim()}'s Smart Card`,
          material: invite.material || 'matte-black',
          status: 'active',
          taps: 0,
          uniqueTappers: 0,
          createdAt: new Date().toISOString(),
          activatedAt: new Date().toISOString(),
        };
        updated.unshift(newCard);
      }

      void syncCardsToSupabase(updated);
      return updated;
    });

    setAllUsers(prev => {
      const updated = [...prev, newUser];
      void syncUsersToSupabase(updated);
      return updated;
    });

    setProfiles(prev => {
      const updated = [...prev, newProfile];
      void syncProfilesToSupabase(updated);
      return updated;
    });

    setQrCodes(prev => {
      const updated = [...prev, newQR];
      void syncQRCodesToSupabase(updated);
      return updated;
    });

    setInvites(prev => {
      const updated = prev.map(inv => (inv.id === invite.id || inv.inviteToken.toLowerCase() === invite.inviteToken.toLowerCase()) ? { ...inv, isUsed: true, usedByUserId: newUserId } : inv);
      void syncInvitesToSupabase(updated);
      return updated;
    });

    login(newUser, 'user');
    setActiveProfileIdState(newProfileId);

    return { success: true, user: newUser, message: 'Account created and NFC Smart Card activated successfully!' };
  };

  // QR Operations
  const updateQRCode = (id: string, updates: Partial<QRCodeItem>) => {
    setQrCodes(prev => {
      const updated = prev.map(q => (q.id === id ? { ...q, ...updates } : q));
      void syncQRCodesToSupabase(updated);
      return updated;
    });
  };

  const recordQRScan = (profileId: string) => {
    logAnalyticsEvent({
      profileId,
      eventType: 'qr_scan',
      trafficSource: 'qr',
      deviceType: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      country: 'Philippines',
      city: 'Manila',
    });
  };

  // Telemetry & Logs
  const logAnalyticsEvent = (eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
    const newEvent: AnalyticsEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };

    setAnalyticsEvents(prev => {
      const updated = [newEvent, ...prev.slice(0, 999)];
      void syncAnalyticsToSupabase(updated);
      return updated;
    });

    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: eventData.eventType === 'nfc_tap' ? '⚡ New NFC Card Tap!' : eventData.eventType === 'qr_scan' ? '📷 QR Code Scanned' : '🔗 Link Clicked',
      message: `Someone connected with your profile from ${eventData.city || 'Manila'}, ${eventData.country || 'PH'}.`,
      type: eventData.eventType === 'nfc_tap' ? 'tap' : 'info',
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev.slice(0, 99)];
      void syncNotificationsToSupabase(updated);
      return updated;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      void syncNotificationsToSupabase(updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    void clearSupabaseNotifications();
  };

  // Admin Actions
  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => {
      const updated = prev.map(u => (u.id === userId ? { ...u, status: u.status === 'active' ? ('suspended' as const) : ('active' as const) } : u));
      void syncUsersToSupabase(updated);
      return updated;
    });
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings(prev => {
      const updated = { ...prev, ...settings };
      void syncSettingsToSupabase(updated);
      return updated;
    });
  };

  // Simulator
  const openSimulator = (card?: NFCCard | null) => {
    const active = card || cards[0] || null;
    setSimulatorCard(active);
    setIsSimulatorOpen(true);
  };

  const closeSimulator = () => {
    setIsSimulatorOpen(false);
    setSimulatorCard(null);
  };

  // User Registration
  const registerUser = (data: { name: string; username: string; email: string; password?: string }): { success: boolean; user?: User; message: string } => {
    const cleanUsername = data.username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    const cleanEmail = data.email.toLowerCase().trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }

    const existing = allUsers.find(
      u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );
    if (existing) {
      return { success: false, message: 'An account with this email or username already exists.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim() || 'TapIt User',
      username: cleanUsername,
      email: cleanEmail,
      password: data.password || 'password123',
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      headline: 'TapIt Smart Identity Owner',
      bio: 'Welcome to my official TapIt digital profile!',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const newProfile: Profile = {
      id: `prof_${Date.now()}`,
      userId: newUser.id,
      name: 'Primary Profile',
      slug: cleanUsername,
      displayName: newUser.name,
      headline: newUser.headline || 'TapIt Smart Identity Owner',
      bio: newUser.bio || 'Welcome to my official TapIt digital profile!',
      avatar: newUser.avatar,
      theme: THEME_PRESETS['cyberpunk-neon'],
      isActive: true,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socials: {},
    };

    const newQr: QRCodeItem = {
      id: `qr_${Date.now()}`,
      profileId: newProfile.id,
      token: `qr_${cleanUsername}`,
      fgColor: '#06b6d4',
      bgColor: '#090d16',
      includeLogo: true,
      scans: 0,
      createdAt: new Date().toISOString(),
    };

    setAllUsers(prev => {
      const updated = [...prev, newUser];
      void syncUsersToSupabase(updated);
      return updated;
    });

    setProfiles(prev => {
      const updated = [...prev, newProfile];
      void syncProfilesToSupabase(updated);
      return updated;
    });

    setActiveProfileIdState(newProfile.id);

    setQrCodes(prev => {
      const updated = [...prev, newQr];
      void syncQRCodesToSupabase(updated);
      return updated;
    });

    login(newUser, 'user');
    return { success: true, user: newUser, message: 'Account registered successfully!' };
  };

  // Remote Hydration callback from BackendSyncInit
  const hydrateFromRemote = (payload: RemoteHydrationPayload) => {
    if (payload.users && payload.users.length > 0) setAllUsers(payload.users);
    if (payload.profiles && payload.profiles.length > 0) setProfiles(payload.profiles);
    if (payload.links && payload.links.length > 0) setLinks(payload.links);
    if (payload.cards && payload.cards.length > 0) setCards(payload.cards);
    if (payload.qrCodes && payload.qrCodes.length > 0) setQrCodes(payload.qrCodes);
    if (payload.analytics && payload.analytics.length > 0) setAnalyticsEvents(payload.analytics);
    if (payload.invites && payload.invites.length > 0) setInvites(payload.invites);
    if (payload.notifications && payload.notifications.length > 0) setNotifications(payload.notifications);
    if (payload.settings) setSystemSettings(payload.settings);
  };

  // Utilities & Cache Management
  const clearLocalStorageCache = (options: { keepSession?: boolean; reload?: boolean } = { keepSession: false, reload: true }) => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY)) {
          if (options.keepSession && (key.endsWith('_currentUser') || key.endsWith('_role') || key.endsWith('_isAuthenticated'))) {
            continue;
          }
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error clearing localStorage cache:', e);
    }

    setProfiles(INITIAL_PROFILES);
    setActiveProfileIdState('');
    setLinks(INITIAL_LINKS);
    setCards(INITIAL_CARDS);
    setQrCodes(INITIAL_QR_CODES);
    setAnalyticsEvents(INITIAL_ANALYTICS_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSystemSettings(INITIAL_SYSTEM_SETTINGS);
    setAllUsers(ADMIN_USERS_LIST);
    setInvites([]);

    if (!options.keepSession) {
      setCurrentRole('user');
      setCurrentUser(INITIAL_ADMIN);
      setIsAuthenticated(false);
      try {
        localStorage.setItem(`${STORAGE_KEY}_isAuthenticated`, JSON.stringify(false));
      } catch {}
    }

    if (options.reload) {
      window.location.reload();
    }
  };

  const reloadFromStorage = () => {
    setIsAuthenticated(loadStoredData('isAuthenticated', false));
    const loadedRole = loadStoredData<UserRole>('role', 'user');
    setCurrentRole(loadedRole);
    setCurrentUser(loadStoredData('currentUser', INITIAL_ADMIN));
    setProfiles(loadStoredData('profiles', INITIAL_PROFILES));
    setActiveProfileIdState(loadStoredData('activeProfileId', ''));
    setLinks(loadStoredData('links', INITIAL_LINKS));
    setCards(loadStoredData('cards', INITIAL_CARDS));
    setQrCodes(loadStoredData('qrCodes', INITIAL_QR_CODES));
    setAnalyticsEvents(loadStoredData('analyticsEvents', INITIAL_ANALYTICS_EVENTS));
    setNotifications(loadStoredData('notifications', INITIAL_NOTIFICATIONS));
    setSystemSettings(loadStoredData('systemSettings', INITIAL_SYSTEM_SETTINGS));
    setAllUsers(loadStoredData('allUsers', ADMIN_USERS_LIST));
    setInvites(loadStoredData('invites', []));
  };

  const resetAllData = () => {
    clearLocalStorageCache({ keepSession: false, reload: true });
  };

  const getStorageMetrics = () => {
    let approxBytes = 0;
    let keysCount = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY)) {
          keysCount++;
          const val = localStorage.getItem(key) || '';
          approxBytes += (key.length + val.length) * 2;
        }
      }
    } catch {}
    return {
      keysCount,
      approxBytes,
      profilesCount: profiles.length,
      cardsCount: cards.length,
      linksCount: links.length,
      eventsCount: analyticsEvents.length,
    };
  };

  return (
    <TapItContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        profiles,
        activeProfile,
        links,
        cards,
        qrCodes,
        analyticsEvents,
        notifications,
        systemSettings,
        allUsers,
        invites,
        isSimulatorOpen,
        simulatorCard,

        login,
        logout,
        setRole,
        setActiveProfileId,

        createProfile,
        updateProfile,
        deleteProfile,
        duplicateProfile,
        toggleProfileArchive,

        addLink,
        updateLink,
        deleteLink,
        toggleLinkActive,
        reorderLinks,
        recordLinkClick,

        claimCard,
        updateCard,
        deleteCard,
        toggleCardStatus,
        reassignCard,
        generateBatchCards,
        recordCardTap,

        createInvite,
        getInviteByToken,
        completeInviteRegistration,
        registerUser,

        updateQRCode,
        recordQRScan,

        logAnalyticsEvent,
        markNotificationAsRead,
        clearAllNotifications,

        toggleUserStatus,
        updateSystemSettings,

        openSimulator,
        closeSimulator,

        hydrateFromRemote,
        resetAllData,
        clearLocalStorageCache,
        reloadFromStorage,
        getStorageMetrics,
      }}
    >
      {children}
    </TapItContext.Provider>
  );
};

export const useTapIt = (): TapItContextType => {
  const context = useContext(TapItContext);
  if (!context) {
    throw new Error('useTapIt must be used within a TapItProvider');
  }
  return context;
};
