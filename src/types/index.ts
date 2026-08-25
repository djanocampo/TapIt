export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  headline?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  lastLoginAt: string;
}

export type ThemeStyle = 
  | 'minimal-dark'
  | 'cyberpunk-neon'
  | 'obsidian-gold'
  | 'sunset-aurora'
  | 'glass-frost'
  | 'executive-slate'
  | 'emerald-glow'
  | 'clean-light';

export type ButtonStyle = 'pill' | 'rounded' | 'glass' | 'outline' | 'shadow';
export type FontStyle = 'plus-jakarta' | 'outfit' | 'inter' | 'mono';

export interface ProfileThemeConfig {
  id: ThemeStyle;
  name: string;
  bgType: 'color' | 'gradient' | 'mesh';
  bgColor: string;
  bgGradient?: string;
  textColor: string;
  subtextColor: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  buttonStyle: ButtonStyle;
  fontStyle: FontStyle;
  accentColor: string;
  badgeBg: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string; // e.g. "Professional", "Personal", "Creator", "Business"
  slug: string; // e.g. "professional"
  displayName: string;
  headline: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  theme: ProfileThemeConfig;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  socials: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    discord?: string;
    spotify?: string;
    behance?: string;
  };
}

export type LinkCategory = 
  | 'work'
  | 'social'
  | 'portfolio'
  | 'contact'
  | 'media'
  | 'commerce'
  | 'other';

export interface LinkItem {
  id: string;
  profileId: string;
  title: string;
  url: string;
  icon: string; // lucide icon identifier or preset
  category: LinkCategory;
  position: number;
  isActive: boolean;
  isFeatured?: boolean;
  clicks: number;
  lastClickedAt?: string;
  createdAt: string;
}

export type NFCCardStatus = 'active' | 'unclaimed' | 'disabled' | 'suspended';
export type CardMaterial = 'matte-black' | 'cyber-cyan' | 'gold-metal' | 'aurora-violet' | 'white-ceramic';

export interface NFCCard {
  id: string;
  cardToken: string; // unique URL token e.g. "8xK29mQ"
  userId?: string;
  profileId?: string; // assigned profile
  name: string; // e.g. "Professional Matte Black Card"
  material: CardMaterial;
  status: NFCCardStatus;
  taps: number;
  uniqueTappers: number;
  lastTappedAt?: string;
  createdAt: string;
  activatedAt?: string;
}

export interface QRCodeItem {
  id: string;
  profileId: string;
  token: string;
  fgColor: string;
  bgColor: string;
  includeLogo: boolean;
  scans: number;
  lastScannedAt?: string;
  createdAt: string;
}

export type EventType = 
  | 'profile_view'
  | 'nfc_tap'
  | 'qr_scan'
  | 'link_click'
  | 'contact_save'
  | 'profile_share';

export type TrafficSource = 'nfc' | 'qr' | 'direct' | 'social' | 'referral';

export interface AnalyticsEvent {
  id: string;
  profileId: string;
  cardId?: string;
  linkId?: string;
  eventType: EventType;
  trafficSource: TrafficSource;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other';
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux';
  country: string;
  city: string;
  timestamp: string;
}

export interface SystemSettings {
  platformName: string;
  maintenanceMode: boolean;
  allowPublicRegistrations: boolean;
  enforceNfcVerification: boolean;
  maxProfilesPerUser: number;
  maxCardsPerUser: number;
  defaultTheme: ThemeStyle;
  supportedPlatforms: {
    name: string;
    key: string;
    enabled: boolean;
    baseUrl: string;
    icon: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'tap';
  timestamp: string;
  read: boolean;
  link?: string;
}
