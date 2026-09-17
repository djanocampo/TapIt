import React from 'react';
import { Profile, LinkItem } from '../../types';
import { 
  Download, 
  Share2, 
  ExternalLink, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Building, 
  Radio, 
  CheckCircle2, 
  Sparkles,
  Facebook,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Music,
  Video,
  FileText,
  Briefcase,
  Coffee,
  Calendar,
  CreditCard,
  MessageSquare,
  MessageCircle,
  Send,
  Link2,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { downloadVCard } from '../../lib/utils';
import { Button } from '../ui/Button';
import { THEME_PRESETS } from '../../data/themes';
import { ProfileThemeConfig } from '../../types';
import { sanitizeUrl } from '../../utils/crypto';

interface PublicProfileRendererProps {
  profile: Profile;
  links: LinkItem[];
  onLinkClick?: (link: LinkItem) => void;
  onOpenShare?: () => void;
  isEmbed?: boolean;
}

// Icon helper map
const ICON_MAP: Record<string, React.ElementType> = {
  Facebook,
  Briefcase,
  Linkedin,
  Github,
  FileText,
  Mail,
  Instagram,
  Music,
  Youtube,
  Coffee,
  CreditCard,
  Calendar,
  Twitter,
  Video,
  Globe,
  Phone,
  MessageCircle,
  MessageSquare,
  Send,
  Link2,
  Link: Link2,
  ExternalLink,
};

export const PublicProfileRenderer: React.FC<PublicProfileRendererProps> = ({
  profile,
  links,
  onLinkClick,
  onOpenShare,
  isEmbed = false,
}) => {
  const rawTheme = profile?.theme;
  const theme: ProfileThemeConfig = typeof rawTheme === 'string'
    ? (THEME_PRESETS[rawTheme] || THEME_PRESETS['cyberpunk-neon'])
    : { ...(THEME_PRESETS[rawTheme?.id] || THEME_PRESETS['cyberpunk-neon']), ...(rawTheme || {}) };
  const activeLinks = links
    .filter((l) => l.profileId === profile.id && l.isActive)
    .sort((a, b) => a.position - b.position);

  const { allProfiles, allUsers } = useTapIt();

  // Dynamically resolve user djanocampo's personal profile URL
  const djanPersonalUrl = React.useMemo(() => {
    // 1. Search for user djanocampo in allUsers
    const djanUser = allUsers.find(
      (u) => u.username?.toLowerCase() === 'djanocampo'
    );
    if (djanUser) {
      const userProfs = allProfiles.filter((p) => p.userId === djanUser.id);
      const personalProf = userProfs.find(
        (p) =>
          p.name?.toLowerCase() === 'personal' ||
          p.name?.toLowerCase().includes('personal') ||
          p.slug?.toLowerCase().includes('personal')
      );
      if (personalProf) return `/@${personalProf.slug}`;
      const activeOrFirst = userProfs.find((p) => p.isActive) || userProfs[0];
      if (activeOrFirst) return `/@${activeOrFirst.slug}`;
    }

    // 2. Direct slug or name match in allProfiles
    const directProf = allProfiles.find(
      (p) =>
        p.slug?.toLowerCase() === 'djanocampo' ||
        (p.name?.toLowerCase() === 'personal' && p.slug?.toLowerCase().includes('djano'))
    );
    if (directProf) return `/@${directProf.slug}`;

    // 3. Fallback direct route that connects to djanocampo's personal profile
    return '/@djanocampo';
  }, [allProfiles, allUsers]);

  // Dynamic button shape classes
  const getButtonShapeClass = () => {
    switch (theme.buttonStyle) {
      case 'pill':
        return 'rounded-full';
      case 'glass':
        return 'rounded-2xl backdrop-blur-md';
      case 'outline':
        return 'rounded-xl border-2';
      case 'shadow':
        return 'rounded-xl shadow-lg';
      case 'rounded':
      default:
        return 'rounded-xl';
    }
  };

  // Dynamic font class
  const getFontClass = () => {
    switch (theme.fontStyle) {
      case 'outfit':
        return 'font-display';
      case 'mono':
        return 'font-mono';
      case 'inter':
        return 'font-inter';
      case 'plus-jakarta':
      default:
        return 'font-jakarta';
    }
  };

  const handleDownloadContact = () => {
    downloadVCard(profile);
  };

  const renderIcon = (iconName: string) => {
    const Component = ICON_MAP[iconName] || Globe;
    return <Component className="w-5 h-5 shrink-0" />;
  };

  return (
    <div
      style={{
        backgroundColor: theme.bgColor,
        backgroundImage: theme.bgGradient,
        color: theme.textColor,
      }}
      className={`min-h-full w-full flex flex-col items-center justify-between p-4 sm:p-6 transition-all duration-300 ${getFontClass()} ${
        isEmbed ? 'py-6 px-3' : 'py-10 max-w-md mx-auto rounded-3xl shadow-2xl border border-white/10'
      }`}
    >
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-end mb-4">
        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="p-2 rounded-full backdrop-blur-md transition hover:scale-105"
            style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            title="Share profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="w-full flex flex-col items-center text-center space-y-3">
        {/* Avatar */}
        <div className="relative group">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 shadow-2xl transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${theme.accentColor}, #8b5cf6)`,
            }}
          >
            {profile.avatar ? (
              <img
                src={sanitizeUrl(profile.avatar, '')}
                alt={profile.displayName || 'Profile'}
                className="w-full h-full rounded-full object-cover border-2 border-slate-900"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-900 border-2 border-slate-900 flex items-center justify-center text-white font-bold text-2xl">
                {(profile.displayName || profile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div
            className="absolute bottom-1 right-1 p-1 rounded-full text-slate-950 shadow-md"
            style={{ backgroundColor: theme.accentColor }}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Name & Headline */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{profile.displayName || 'Unnamed Persona'}</h2>
          {profile.headline && (
            <p className="text-xs sm:text-sm font-medium mt-1 max-w-xs leading-snug" style={{ color: theme.subtextColor }}>
              {profile.headline}
            </p>
          )}
        </div>

        {/* Direct Contact Badges (Controlled by checkboxes) */}
        {((profile.email && profile.showEmail) || (profile.phone && profile.showPhone)) && (
          <div className="flex items-center justify-center gap-3 text-xs flex-wrap pt-0.5" style={{ color: theme.subtextColor }}>
            {profile.email && profile.showEmail && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-1 hover:underline">
                <Mail className="w-3 h-3 text-cyan-400" />
                <span>{profile.email}</span>
              </a>
            )}
            {profile.phone && profile.showPhone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-1 hover:underline">
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>{profile.phone}</span>
              </a>
            )}
          </div>
        )}

        {/* Meta badges: Job Title / Company / Location / Website */}
        {(profile.jobTitle || profile.company || profile.location || profile.website) && (
          <div className="flex items-center justify-center gap-3 text-xs flex-wrap" style={{ color: theme.subtextColor }}>
            {(profile.jobTitle || profile.company) && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {[profile.jobTitle, profile.company].filter(Boolean).join(' • ')}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={sanitizeUrl(profile.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs sm:text-sm max-w-xs leading-relaxed opacity-90 px-2" style={{ color: theme.subtextColor }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* Links List */}
      <div className="w-full my-6 space-y-3 max-w-sm">
        {activeLinks.length === 0 ? (
          <div className="text-center py-6 text-xs" style={{ color: theme.subtextColor }}>
            No active links added yet.
          </div>
        ) : (
          activeLinks.map((link) => {
            const safeHref = sanitizeUrl(link.url);
            return (
              <a
                key={link.id}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (safeHref === '#') {
                    e.preventDefault();
                    return;
                  }
                  onLinkClick && onLinkClick(link);
                }}
                className={`w-full p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98] ${getButtonShapeClass()}`}
              style={{
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textColor,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="p-2 rounded-lg shrink-0 transition-colors group-hover:scale-110"
                  style={{ backgroundColor: theme.badgeBg, color: theme.accentColor }}
                >
                  {renderIcon(link.icon)}
                </div>
                <span className="truncate">{link.title}</span>
              </div>
              <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          );
        })
      )}
      </div>

      {/* Social Media Footer Bar */}
      {profile.socials && Object.values(profile.socials).some(Boolean) && (
        <div className="flex items-center justify-center gap-3 flex-wrap my-3">
          {profile.socials.linkedin && (
            <a href={sanitizeUrl(profile.socials.linkedin)} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:scale-110 transition" style={{ backgroundColor: theme.badgeBg, color: theme.accentColor }}>
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {profile.socials.github && (
            <a href={sanitizeUrl(profile.socials.github)} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:scale-110 transition" style={{ backgroundColor: theme.badgeBg, color: theme.accentColor }}>
              <Github className="w-4 h-4" />
            </a>
          )}
          {profile.socials.twitter && (
            <a href={sanitizeUrl(profile.socials.twitter)} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:scale-110 transition" style={{ backgroundColor: theme.badgeBg, color: theme.accentColor }}>
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {profile.socials.instagram && (
            <a href={sanitizeUrl(profile.socials.instagram)} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:scale-110 transition" style={{ backgroundColor: theme.badgeBg, color: theme.accentColor }}>
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {profile.socials.youtube && (
            <a href={sanitizeUrl(profile.socials.youtube)} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:scale-110 transition" style={{ backgroundColor: theme.badgeBg, color: theme.accentColor }}>
              <Youtube className="w-4 h-4" />
            </a>
          )}
          {profile.socials.spotify && (
            <a href={sanitizeUrl(profile.socials.spotify)} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:scale-110 transition" style={{ backgroundColor: theme.badgeBg, color: theme.accentColor }}>
              <Music className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {/* User Actions: Log in & Get your own TapIt */}
      {!isEmbed && (
        <div className="mt-5 w-full space-y-2.5">
          {/* User Log in Button */}
          <Link
            to="/login"
            className={`w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-bold transition duration-200 border ${getButtonShapeClass()} hover:opacity-90 active:scale-[0.99] shadow-sm`}
            style={{
              backgroundColor: theme.badgeBg || 'rgba(6, 182, 212, 0.15)',
              borderColor: theme.cardBorder || 'rgba(255, 255, 255, 0.1)',
              color: theme.textColor || '#ffffff',
            }}
          >
            <LogIn className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            <span>User Log in</span>
          </Link>

          {/* Get your own TapIt Button */}
          <Link
            to={djanPersonalUrl}
            className={`w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-bold transition duration-200 border ${getButtonShapeClass()} hover:opacity-90 active:scale-[0.99] shadow-sm`}
            style={{
              backgroundColor: theme.accentColor ? `${theme.accentColor}18` : 'rgba(6, 182, 212, 0.15)',
              borderColor: theme.accentColor ? `${theme.accentColor}55` : 'rgba(6, 182, 212, 0.35)',
              color: theme.textColor || '#ffffff',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accentColor || '#06b6d4' }} />
            <span>Get your own TapIt</span>
          </Link>
        </div>
      )}

      {/* Powered by TapIt Badge */}
      <div className="mt-4 pt-4 border-t w-full text-center flex flex-col items-center gap-1" style={{ borderColor: theme.cardBorder }}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase opacity-75 hover:opacity-100 transition"
          style={{ color: theme.subtextColor }}
        >
          <Radio className="w-3 h-3" style={{ color: theme.accentColor }} />
          <span>Powered by TapIt</span>
        </a>
        <span className="text-[9px] opacity-50" style={{ color: theme.subtextColor }}>
          Smart NFC Digital Business Card
        </span>
      </div>
    </div>
  );
};
