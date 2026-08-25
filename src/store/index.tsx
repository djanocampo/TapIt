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
  CardMaterial
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
  profiles: Profile[];
  activeProfile: Profile;
  links: LinkItem[];
  cards: NFCCard[];
  qrCodes: QRCodeItem[];
  analyticsEvents: AnalyticsEvent[];
  notifications: NotificationItem[];
  systemSettings: SystemSettings;
  allUsers: User[];
  isSimulatorOpen: boolean;
  simulatorCard: NFCCard | null;

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

const STORAGE_KEY = 'tapit_app_state_v1';

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

  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadStoredData('role', 'user'));
  const [currentUser, setCurrentUser] = useState<User>(() => currentRole === 'admin' ? INITIAL_ADMIN : INITIAL_USER);
  const [profiles, setProfiles] = useState<Profile[]>(() => loadStoredData('profiles', INITIAL_PROFILES));
  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => loadStoredData('activeProfileId', 'prof_prof_01'));
  const [links, setLinks] = useState<LinkItem[]>(() => loadStoredData('links', INITIAL_LINKS));
  const [cards, setCards] = useState<NFCCard[]>(() => loadStoredData('cards', INITIAL_CARDS));
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>(() => loadStoredData('qrCodes', INITIAL_QR_CODES));
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => loadStoredData('analyticsEvents', INITIAL_ANALYTICS_EVENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStoredData('notifications', INITIAL_NOTIFICATIONS));
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => loadStoredData('systemSettings', INITIAL_SYSTEM_SETTINGS));
  const [allUsers, setAllUsers] = useState<User[]>(() => loadStoredData('allUsers', ADMIN_USERS_LIST));

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
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [currentRole, profiles, activeProfileId, links, cards, qrCodes, analyticsEvents, notifications, systemSettings, allUsers]);

  // Sync user profile with role
  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentUser(INITIAL_ADMIN);
    } else if (role === 'user') {
      setCurrentUser(INITIAL_USER);
    } else {
      setCurrentUser({
        id: 'usr_guest_00',
        name: 'Guest Visitor',
        username: 'guest',
        email: 'guest@tapit.app',
        role: 'guest',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
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
      name: data.name || 'New Profile',
      slug,
      displayName: data.displayName || currentUser.name,
      headline: data.headline || 'Digital Identity & Links',
      bio: data.bio || '',
      avatar: data.avatar || currentUser.avatar,
      coverImage: data.coverImage,
      email: data.email || currentUser.email,
      phone: data.phone || '',
      location: data.location || '',
      website: data.website || '',
      company: data.company || '',
      jobTitle: data.jobTitle || '',
      theme: data.theme || THEME_PRESETS['minimal-dark'],
      isActive: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socials: data.socials || {},
    };

    setProfiles(prev => [...prev, newProfile]);

    // Create default QR code
    const newQr: QRCodeItem = {
      id: `qr_${Date.now()}`,
      profileId: newId,
      token: `qr_${slug}`,
      fgColor: '#06b6d4',
      bgColor: '#090d16',
      includeLogo: true,
      scans: 0,
      createdAt: new Date().toISOString(),
    };
    setQrCodes(prev => [...prev, newQr]);

    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    }));
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    setLinks(prev => prev.filter(l => l.profileId !== id));
    setCards(prev => prev.map(c => c.profileId === id ? { ...c, profileId: undefined } : c));
    if (activeProfileId === id) {
      const remaining = profiles.filter(p => p.id !== id);
      if (remaining.length > 0) setActiveProfileId(remaining[0].id);
    }
  };

  const duplicateProfile = (id: string): Profile => {
    const source = profiles.find(p => p.id === id) || activeProfile;
    const duplicatedSlug = `${source.slug}-copy-${Math.floor(Math.random() * 900 + 100)}`;
    const newProfile: Profile = {
      ...source,
      id: `prof_${Date.now()}`,
      name: `${source.name} (Copy)`,
      slug: duplicatedSlug,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfiles(prev => [...prev, newProfile]);

    // Duplicate links
    const sourceLinks = links.filter(l => l.profileId === id);
    const newLinks: LinkItem[] = sourceLinks.map((l, index) => ({
      ...l,
      id: `lnk_${Date.now()}_${index}`,
      profileId: newProfile.id,
      clicks: 0,
      createdAt: new Date().toISOString(),
    }));
    setLinks(prev => [...prev, ...newLinks]);

    return newProfile;
  };

  const toggleProfileArchive = (id: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, isArchived: !p.isArchived } : p));
  };

  // Link Operations
  const addLink = (linkData: Omit<LinkItem, 'id' | 'createdAt' | 'clicks'>): LinkItem => {
    const newLink: LinkItem = {
      ...linkData,
      id: `lnk_${Date.now()}`,
      clicks: 0,
      createdAt: new Date().toISOString(),
    };
    setLinks(prev => [...prev, newLink]);
    return newLink;
  };

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const toggleLinkActive = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
  };

  const reorderLinks = (profileId: string, orderedIds: string[]) => {
    setLinks(prev => {
      const nonProfileLinks = prev.filter(l => l.profileId !== profileId);
      const profileLinks = prev.filter(l => l.profileId === profileId);
      
      const reordered = orderedIds.map((id, index) => {
        const item = profileLinks.find(l => l.id === id);
        return item ? { ...item, position: index } : null;
      }).filter(Boolean) as LinkItem[];

      return [...nonProfileLinks, ...reordered];
    });
  };

  const recordLinkClick = (linkId: string, profileId: string, source: string = 'direct') => {
    setLinks(prev => prev.map(l => l.id === linkId ? { ...l, clicks: l.clicks + 1, lastClickedAt: new Date().toISOString() } : l));
    
    // Log analytics event
    logAnalyticsEvent({
      profileId,
      linkId,
      eventType: 'link_click',
      trafficSource: (source as any) || 'direct',
      deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      browser: 'Chrome',
      os: 'iOS',
      country: 'Philippines',
      city: 'Manila',
    });
  };

  // Card Operations
  const claimCard = (cardToken: string, profileId: string, name?: string) => {
    const existing = cards.find(c => c.cardToken.toLowerCase() === cardToken.trim().toLowerCase());
    
    if (!existing) {
      // Create and claim brand new card
      const newCard: NFCCard = {
        id: `crd_${Date.now()}`,
        cardToken: cardToken.trim(),
        userId: currentUser.id,
        profileId,
        name: name || `Custom TapIt Card (${cardToken.slice(0, 6)})`,
        material: 'matte-black',
        status: 'active',
        taps: 0,
        uniqueTappers: 0,
        createdAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
      };
      setCards(prev => [...prev, newCard]);
      
      // Notify
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: '✨ Card Successfully Claimed!',
        message: `Card ${newCard.name} has been activated and linked to your profile.`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);

      return { success: true, card: newCard, message: 'Card claimed and activated successfully!' };
    }

    if (existing.status === 'active' && existing.userId && existing.userId !== currentUser.id) {
      return { success: false, message: 'This card is already claimed and active on another account.' };
    }

    const updatedCard: NFCCard = {
      ...existing,
      userId: currentUser.id,
      profileId,
      name: name || existing.name,
      status: 'active',
      activatedAt: existing.activatedAt || new Date().toISOString(),
    };

    setCards(prev => prev.map(c => c.id === existing.id ? updatedCard : c));

    // Notify
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: '✨ Card Claimed & Linked',
      message: `Card ${updatedCard.name} is now connected.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, card: updatedCard, message: 'Card linked successfully!' };
  };

  const updateCard = (id: string, updates: Partial<NFCCard>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleCardStatus = (id: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'active' ? 'disabled' : 'active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const reassignCard = (cardId: string, profileId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, profileId } : c));
  };

  const generateBatchCards = (count: number, material: CardMaterial): NFCCard[] => {
    const generated: NFCCard[] = [];
    const timestamp = Date.now();
    for (let i = 0; i < count; i++) {
      const randomStr = Math.random().toString(36).substring(2, 9).toUpperCase();
      const newCard: NFCCard = {
        id: `crd_batch_${timestamp}_${i}`,
        cardToken: `TAP-${randomStr}`,
        material,
        name: `TapIt Batch #${Math.floor(timestamp / 1000).toString().slice(-4)} (${i + 1})`,
        status: 'unclaimed',
        taps: 0,
        uniqueTappers: 0,
        createdAt: new Date().toISOString(),
      };
      generated.push(newCard);
    }
    setCards(prev => [...prev, ...generated]);
    return generated;
  };

  const recordCardTap = (cardToken: string) => {
    const card = cards.find(c => c.cardToken.toLowerCase() === cardToken.trim().toLowerCase());
    if (!card) {
      return { status: 'not_found' };
    }
    if (card.status === 'unclaimed') {
      return { card, status: 'unclaimed' };
    }
    if (card.status === 'disabled' || card.status === 'suspended') {
      return { card, status: card.status };
    }

    // Active card: increment tap count
    const assignedProfile = profiles.find(p => p.id === card.profileId) || profiles[0];
    
    setCards(prev => prev.map(c => {
      if (c.id === card.id) {
        return {
          ...c,
          taps: c.taps + 1,
          uniqueTappers: c.uniqueTappers + 1,
          lastTappedAt: new Date().toISOString(),
        };
      }
      return c;
    }));

    // Log analytics event
    logAnalyticsEvent({
      profileId: assignedProfile.id,
      cardId: card.id,
      eventType: 'nfc_tap',
      trafficSource: 'nfc',
      deviceType: 'mobile',
      browser: 'Safari',
      os: 'iOS',
      country: 'Philippines',
      city: 'Manila',
    });

    // Create live notification
    const tapNotif: NotificationItem = {
      id: `notif_tap_${Date.now()}`,
      title: '📱 Real-Time NFC Tap Detected',
      message: `${card.name} was just tapped. Visitor redirected to ${assignedProfile.name} profile.`,
      type: 'tap',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [tapNotif, ...prev.slice(0, 19)]);

    return { card, profile: assignedProfile, status: 'active' };
  };

  // QR Code Operations
  const updateQRCode = (id: string, updates: Partial<QRCodeItem>) => {
    setQrCodes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const recordQRScan = (profileId: string) => {
    setQrCodes(prev => prev.map(q => q.profileId === profileId ? { ...q, scans: q.scans + 1, lastScannedAt: new Date().toISOString() } : q));
    logAnalyticsEvent({
      profileId,
      eventType: 'qr_scan',
      trafficSource: 'qr',
      deviceType: 'mobile',
      browser: 'Chrome',
      os: 'Android',
      country: 'Philippines',
      city: 'Quezon City',
    });
  };

  // Analytics
  const logAnalyticsEvent = (eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
    const newEvt: AnalyticsEvent = {
      ...eventData,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    setAnalyticsEvents(prev => [newEvt, ...prev.slice(0, 99)]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Admin
  const toggleUserStatus = (userId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: u.status === 'active' ? 'suspended' : 'active',
        };
      }
      return u;
    }));
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    setSystemSettings(prev => ({ ...prev, ...settings }));
  };

  // Simulator
  const openSimulator = (card?: NFCCard | null) => {
    setSimulatorCard(card || cards[0] || null);
    setIsSimulatorOpen(true);
  };

  const closeSimulator = () => {
    setIsSimulatorOpen(false);
  };

  const resetAllData = () => {
    localStorage.clear();
    setProfiles(INITIAL_PROFILES);
    setActiveProfileIdState('prof_prof_01');
    setLinks(INITIAL_LINKS);
    setCards(INITIAL_CARDS);
    setQrCodes(INITIAL_QR_CODES);
    setAnalyticsEvents(INITIAL_ANALYTICS_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSystemSettings(INITIAL_SYSTEM_SETTINGS);
    setAllUsers(ADMIN_USERS_LIST);
    setCurrentRole('user');
    setCurrentUser(INITIAL_USER);
  };

  return (
    <TapItContext.Provider
      value={{
        currentUser,
        currentRole,
        profiles,
        activeProfile,
        links,
        cards,
        qrCodes,
        analyticsEvents,
        notifications,
        systemSettings,
        allUsers,
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
