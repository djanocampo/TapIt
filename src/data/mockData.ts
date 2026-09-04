import { User, Profile, LinkItem, NFCCard, QRCodeItem, AnalyticsEvent, SystemSettings, NotificationItem } from '../types';

export const INITIAL_ADMIN: User = {
  id: 'usr_admin_001',
  name: 'System Admin',
  username: 'admin',
  email: 'admin@tapit.app',
  password: 'admin123',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  headline: 'TapIt System Administrator',
  bio: 'Platform administration, hardware NFC batch token provisioning, and security controls.',
  status: 'active',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

// Clean empty starter collections - Ready for 1st User creation & live end-to-end testing
export const INITIAL_PROFILES: Profile[] = [];

export const INITIAL_LINKS: LinkItem[] = [];

export const INITIAL_CARDS: NFCCard[] = [];

export const INITIAL_QR_CODES: QRCodeItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_ANALYTICS_EVENTS: AnalyticsEvent[] = [];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  platformName: 'TapIt Smart Identity Platform',
  maintenanceMode: false,
  allowPublicRegistrations: true,
  enforceNfcVerification: true,
  maxProfilesPerUser: 10,
  maxCardsPerUser: 25,
  defaultTheme: 'minimal-dark',
  supportedPlatforms: [
    { name: 'LinkedIn', key: 'linkedin', enabled: true, baseUrl: 'https://linkedin.com/in/', icon: 'Linkedin' },
    { name: 'GitHub', key: 'github', enabled: true, baseUrl: 'https://github.com/', icon: 'Github' },
    { name: 'Instagram', key: 'instagram', enabled: true, baseUrl: 'https://instagram.com/', icon: 'Instagram' },
    { name: 'X / Twitter', key: 'twitter', enabled: true, baseUrl: 'https://x.com/', icon: 'Twitter' },
    { name: 'YouTube', key: 'youtube', enabled: true, baseUrl: 'https://youtube.com/@', icon: 'Youtube' },
    { name: 'TikTok', key: 'tiktok', enabled: true, baseUrl: 'https://tiktok.com/@', icon: 'Video' },
    { name: 'Spotify', key: 'spotify', enabled: true, baseUrl: 'https://open.spotify.com/', icon: 'Music' },
    { name: 'Discord', key: 'discord', enabled: true, baseUrl: 'https://discord.gg/', icon: 'MessageSquare' },
    { name: 'Portfolio', key: 'portfolio', enabled: true, baseUrl: 'https://', icon: 'Globe' },
    { name: 'Resume', key: 'resume', enabled: true, baseUrl: 'https://', icon: 'FileText' },
    { name: 'Email', key: 'email', enabled: true, baseUrl: 'mailto:', icon: 'Mail' },
    { name: 'Phone', key: 'phone', enabled: true, baseUrl: 'tel:', icon: 'Phone' },
    { name: 'WhatsApp', key: 'whatsapp', enabled: true, baseUrl: 'https://wa.me/', icon: 'PhoneCall' },
    { name: 'Telegram', key: 'telegram', enabled: true, baseUrl: 'https://t.me/', icon: 'Send' },
  ]
};

export const ADMIN_USERS_LIST: User[] = [
  INITIAL_ADMIN,
];
