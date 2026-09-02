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
  INITIAL_USER, 
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
  toggleCardStatus: (id: string) => void;
  reassignCard: (cardId: string, profileId: string) => void;
  generateBatchCards: (count: number, material: CardMaterial) => NFCCard[];
  recordCardTap: (cardToken: string) => { card?: NFCCard; profile?: Profile; status: string };

  // Invite & User Provisioning Wizard Actions
  createInvite: (initialName: string, material: CardMaterial, customCardToken?: string) => { invite: UserInvite; inviteUrl: string };
  getInviteByToken: (inviteToken: string) => UserInvite | undefined;
  completeInviteRegistration: (inviteToken: string, data: { name: string; username: string; email: string; password?: string }) => { success: boolean; user?: User; message: string };

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

  // Utilities
  resetAllData: () => void;
}

const STORAGE_KEY = 'tapit_app_state_v9';

const TapItContext = createContext<TapItContextType | undefined>(undefined);

export const TapItProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const loadStoredData = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStoredData('isAuthenticated', true));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadStoredData('role', 'user'));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return loadStoredData('currentUser', currentRole === 'admin' ? INITIAL_ADMIN : INITIAL_USER);
  });
  const [profiles, setProfiles] = useState<Profile[]>(() => loadStoredData('profiles', INITIAL_PROFILES));
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => loadStoredData('activeProfileId', 'prof_prof_01'));
  const [links, setLinks] = useState<LinkItem[]>(() => loadStoredData('links', INITIAL_LINKS));
  const [cards, setCards] = useState<NFCCard[]>(() => loadStoredData('cards', INITIAL_CARDS));
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>(() => loadStoredData('qrCodes', INITIAL_QR_CODES));
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => loadStoredData('analyticsEvents', INITIAL_ANALYTICS_EVENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStoredData('notifications', INITIAL_NOTIFICATIONS));
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => loadStoredData('systemSettings', INITIAL_SYSTEM_SETTINGS));
  const [allUsers, setAllUsers] = useState<User[]>(() => loadStoredData('allUsers', ADMIN_USERS_LIST));
  const [invites, setInvites] = useState<UserInvite[]>(() => loadStoredData('invites', []));

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

  // Simulator modal state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorCard, setSimulatorCard] = useState<NFCCard | null>(null);

  // Sync to LocalStorage
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

  // Sync user profile with role
  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
    } else {
      // Find Djan or active user
      const existingUser = allUsers.find(u => u.role === 'user') || INITIAL_USER;
      setCurrentUser(existingUser);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILES[0];

  const setActiveProfileId = (id: string) => {
    setActiveProfileIdState(id);
    setProfiles(prev => prev.map(p => ({
      ...p,
      isActive: p.id === id,
    })));
  };

  // Profile operations
  const createProfile = (data: Partial<Profile>): Profile => {
    const newId = `prof_${Date.now()}`;
    const slug = data.slug || `profile-${Date.now().toString().slice(-4)}`;
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
      isActive: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socials: data.socials || {},
      ...data,
    };

    setProfiles(prev => [newProfile, ...prev]);
    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
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

    setProfiles(prev => [duplicatedProfile, ...prev]);
    setLinks(prev => [...prev, ...duplicatedLinks]);

    return duplicatedProfile;
  };

  const toggleProfileArchive = (id: string) => {
    setProfiles(prev => prev.map(p => (p.id === id ? { ...p, isArchived: !p.isArchived } : p)));
  };

  // Link operations
  const addLink = (linkData: Omit<LinkItem, 'id' | 'createdAt' | 'clicks'>): LinkItem => {
    const newLink: LinkItem = {
      ...linkData,
      id: `lnk_${Date.now()}`,
      clicks: 0,
      createdAt: new Date().toISOString(),
    };

    setLinks(prev => [newLink, ...prev]);
    return newLink;
  };

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    setLinks(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const toggleLinkActive = (id: string) => {
    setLinks(prev => prev.map(l => (l.id === id ? { ...l, isActive: !l.isActive } : l)));
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

      return [...otherLinks, ...reordered];
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
    setLinks(prev => prev.map(l => (l.id === linkId ? { ...l, clicks: l.clicks + 1, lastClickedAt: new Date().toISOString() } : l)));

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
      setCards(prev => [newCard, ...prev]);
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

    setCards(prev => prev.map(c => (c.id === existing.id ? updatedCard : c)));
    return { success: true, card: updatedCard, message: 'Card activated successfully!' };
  };

  const updateCard = (id: string, updates: Partial<NFCCard>) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const toggleCardStatus = (id: string) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, status: c.status === 'active' ? 'disabled' : 'active' } : c)));
  };

  const reassignCard = (cardId: string, profileId: string) => {
    setCards(prev => prev.map(c => (c.id === cardId ? { ...c, profileId } : c)));
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
    setCards(prev => [...newCards, ...prev]);
    return newCards;
  };

  const recordCardTap = (cardToken: string) => {
    const card = cards.find(c => c.cardToken.toLowerCase() === cardToken.toLowerCase());

    if (!card) return { status: 'invalid_card' };
    if (card.status === 'disabled') return { card, status: 'disabled' };
    if (card.status === 'unclaimed') return { card, status: 'unclaimed' };

    setCards(prev => prev.map(c => (c.id === card.id ? { ...c, taps: c.taps + 1, lastTappedAt: new Date().toISOString() } : c)));

    const targetProfile = profiles.find(p => p.id === card.profileId) || profiles[0];

    const client = getClientDeviceInfo();

    logAnalyticsEvent({
      profileId: targetProfile.id,
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

  // ==========================================
  // INVITE & USER PROVISIONING WIZARD ACTIONS
  // ==========================================
  const createInvite = (initialName: string, material: CardMaterial = 'matte-black', customCardToken?: string) => {
    const inviteId = `inv_${Date.now()}`;
    const inviteToken = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const cardToken = customCardToken?.trim() || `TAP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Ensure card exists in cards inventory as unclaimed
    const existingCard = cards.find(c => c.cardToken.toLowerCase() === cardToken.toLowerCase());
    if (!existingCard) {
      const newCard: NFCCard = {
        id: `crd_${Date.now()}`,
        cardToken: cardToken,
        name: `${initialName || 'New User'}'s Smart Card`,
        material: material,
        status: 'unclaimed',
        taps: 0,
        uniqueTappers: 0,
        createdAt: new Date().toISOString(),
      };
      setCards(prev => [newCard, ...prev]);
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

    setInvites(prev => [newInvite, ...prev]);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
    const inviteUrl = `${origin}/invite/${inviteToken}`;

    return { invite: newInvite, inviteUrl };
  };

  const getInviteByToken = (inviteToken: string) => {
    return invites.find(inv => inv.inviteToken.toLowerCase() === inviteToken.toLowerCase() || inv.id === inviteToken);
  };

  const completeInviteRegistration = (inviteToken: string, data: { name: string; username: string; email: string; password?: string }) => {
    const invite = invites.find(inv => inv.inviteToken.toLowerCase() === inviteToken.toLowerCase() || inv.id === inviteToken);
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
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
      headline: 'Digital Identity & NFC Smart Card Owner',
      bio: `Welcome to ${data.name.trim()}'s TapIt profile. Connect, save contact, or explore my links below!`,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const newProfile: Profile = {
      id: newProfileId,
      userId: newUserId,
      name: 'Professional',
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

    // Link pre-bound physical card to newly created user and profile
    setCards(prev => prev.map(c => {
      if (c.cardToken.toLowerCase() === invite.cardToken.toLowerCase()) {
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
    }));

    // Add new user to allUsers
    setAllUsers(prev => [...prev, newUser]);
    // Add new profile
    setProfiles(prev => [...prev, newProfile]);
    // Mark invite used
    setInvites(prev => prev.map(inv => inv.id === invite.id ? { ...inv, isUsed: true, usedByUserId: newUserId } : inv));

    // Log user in
    setCurrentRole('user');
    setCurrentUser(newUser);
    setActiveProfileIdState(newProfileId);

    return { success: true, user: newUser, message: 'Account created and NFC Smart Card activated successfully!' };
  };

  // QR Operations
  const updateQRCode = (id: string, updates: Partial<QRCodeItem>) => {
    setQrCodes(prev => prev.map(q => (q.id === id ? { ...q, ...updates } : q)));
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

    setAnalyticsEvents(prev => [newEvent, ...prev.slice(0, 999)]);

    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: eventData.eventType === 'nfc_tap' ? '⚡ New NFC Card Tap!' : eventData.eventType === 'qr_scan' ? '📷 QR Code Scanned' : '🔗 Link Clicked',
      message: `Someone connected with your profile from ${eventData.city || 'Manila'}, ${eventData.country || 'PH'}.`,
      type: eventData.eventType === 'nfc_tap' ? 'tap' : 'info',
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Admin Actions
  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u)));
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...settings }));
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

  // Utilities
  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_role`);
    localStorage.removeItem(`${STORAGE_KEY}_profiles`);
    localStorage.removeItem(`${STORAGE_KEY}_activeProfileId`);
    localStorage.removeItem(`${STORAGE_KEY}_links`);
    localStorage.removeItem(`${STORAGE_KEY}_cards`);
    localStorage.removeItem(`${STORAGE_KEY}_qrCodes`);
    localStorage.removeItem(`${STORAGE_KEY}_analyticsEvents`);
    localStorage.removeItem(`${STORAGE_KEY}_notifications`);
    localStorage.removeItem(`${STORAGE_KEY}_systemSettings`);
    localStorage.removeItem(`${STORAGE_KEY}_allUsers`);
    localStorage.removeItem(`${STORAGE_KEY}_invites`);

    setProfiles(INITIAL_PROFILES);
    setActiveProfileIdState('prof_prof_01');
    setLinks(INITIAL_LINKS);
    setCards(INITIAL_CARDS);
    setQrCodes(INITIAL_QR_CODES);
    setAnalyticsEvents(INITIAL_ANALYTICS_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSystemSettings(INITIAL_SYSTEM_SETTINGS);
    setAllUsers(ADMIN_USERS_LIST);
    setInvites([]);
    setCurrentRole('user');
    setCurrentUser(INITIAL_USER);
  };

  return (
    <TapItContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        login,
        logout,
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
        toggleCardStatus,
        reassignCard,
        generateBatchCards,
        recordCardTap,
        createInvite,
        getInviteByToken,
        completeInviteRegistration,
        updateQRCode,
        recordQRScan,
        logAnalyticsEvent,
        markNotificationAsRead,
        clearAllNotifications,
        toggleUserStatus,
        updateSystemSettings,
        openSimulator,
        closeSimulator,
        resetAllData,
      }}
    >
      {children}
    </TapItContext.Provider>
  );
};

export const useTapIt = () => {
  const context = useContext(TapItContext);
  if (!context) {
    throw new Error('useTapIt must be used within a TapItProvider');
  }
  return context;
};
