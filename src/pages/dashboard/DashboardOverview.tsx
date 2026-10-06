import React from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { MetricCard } from '../../components/analytics/MetricCard';
import { TrafficChart } from '../../components/analytics/TrafficChart';
import { TopLinksTable } from '../../components/analytics/TopLinksTable';
import { NFCCardPreview } from '../../components/nfc/NFCCardPreview';
import { Button } from '../../components/ui/Button';
import { 
  Eye, 
  Radio, 
  MousePointerClick, 
  Users, 
  Plus, 
  CreditCard, 
  Clock, 
  Sparkles,
  Copy,
  Check,
  Zap,
  ExternalLink
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';

export const DashboardOverview: React.FC = () => {
  const { currentUser, profiles, activeProfile, links, cards, notifications, analyticsEvents } = useTapIt();
  const [copied, setCopied] = React.useState(false);

  // Active profile's links and card
  const profileLinks = links.filter((l) => l.profileId === activeProfile.id);
  const activeCard = cards.find((c) => c.profileId === activeProfile.id) || cards[0];

  // Dynamic metrics computed from real state
  const totalTaps = cards.reduce((sum, c) => sum + c.taps, 0);
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const totalViews = analyticsEvents.filter(e => e.eventType === 'profile_view').length;
  const uniqueVisitors = new Set(analyticsEvents.map(e => e.id)).size;

  // Onboarding Checklist calculation
  const hasAvatarAndBio = Boolean(activeProfile.avatar && (activeProfile.headline || activeProfile.bio));
  const hasLinks = profileLinks.length >= 3;
  const hasLinkedCard = Boolean(cards.some(c => c.profileId === activeProfile.id && c.status === 'active'));
  const completedSteps = (hasAvatarAndBio ? 1 : 0) + (hasLinks ? 1 : 0) + (hasLinkedCard ? 1 : 0);
  const [isChecklistDismissed, setIsChecklistDismissed] = React.useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('tapit_dismiss_checklist') === 'true' : false;
  });

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
    navigator.clipboard.writeText(`${origin}/@${activeProfile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismissChecklist = () => {
    setIsChecklistDismissed(true);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tapit_dismiss_checklist', 'true');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-bits-azure/40 via-bits-navy/90 to-bits-midnight border border-bits-vapor/15 shadow-card-bits relative overflow-hidden backdrop-blur-xl">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-bits-cyan bg-bits-azure/30 border border-bits-cyan/30 px-3 py-1 rounded-full mb-1">
            <BitsInfinityEmblem size={12} />
            <span>Active Persona: {activeProfile.name}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {greeting}, {currentUser.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Your digital identity is live and ready to connect. Here is your real-time networking overview.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
          <Link to={`/@${activeProfile.slug}`} target="_blank">
            <Button variant="glow" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />}>
              View Live Profile
            </Button>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-glow-emerald'
                : 'bg-bits-navy hover:bg-bits-midnight text-slate-200 hover:text-white border-bits-vapor/15'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-bits-cyan" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <Link to="/dashboard/cards">
            <Button variant="secondary" size="sm" leftIcon={<CreditCard className="w-4 h-4 text-bits-cyan" />}>
              My Cards ({cards.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* 3-STEP SETUP CHECKLIST (Visible until completed or dismissed) */}
      {!isChecklistDismissed && completedSteps < 3 && (
        <div className="bg-gradient-to-r from-[#081530] via-bits-navy/90 to-[#0a1b3d] border border-bits-cyan/30 rounded-3xl p-5 sm:p-6 shadow-card-bits relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-bits-vapor/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-bits-cyan/20 border border-bits-cyan/40 text-bits-cyan flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                  Get Started in 3 Simple Steps
                  <span className="text-xs font-mono font-bold text-bits-cyan bg-bits-azure/30 border border-bits-cyan/30 px-2 py-0.5 rounded-full">
                    {completedSteps}/3 Done
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Follow these steps to activate your digital card and share with prospective connections.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissChecklist}
              className="text-xs text-slate-400 hover:text-slate-200 self-end sm:self-auto transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            {/* Step 1 */}
            <Link
              to={`/dashboard/profiles/edit/${activeProfile.id}`}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 group ${
                hasAvatarAndBio
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-bits-midnight/70 border-bits-vapor/15 hover:border-bits-cyan/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  hasAvatarAndBio ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {hasAvatarAndBio ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">Complete Bio & Avatar</h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {hasAvatarAndBio ? 'Completed' : 'Add photo & title'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-bits-cyan group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>

            {/* Step 2 */}
            <Link
              to="/dashboard/links"
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 group ${
                hasLinks
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-bits-midnight/70 border-bits-vapor/15 hover:border-bits-cyan/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  hasLinks ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {hasLinks ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">Add First 3 Links</h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {hasLinks ? `${profileLinks.length} destinations linked` : `${profileLinks.length}/3 links added`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-bits-cyan group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>

            {/* Step 3 */}
            <Link
              to="/dashboard/cards"
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 group ${
                hasLinkedCard
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-bits-midnight/70 border-bits-vapor/15 hover:border-bits-cyan/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                  hasLinkedCard ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {hasLinkedCard ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">Physical Smart Card</h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {hasLinkedCard ? 'Smart card active & linked' : 'Check card status & routing'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-bits-cyan group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4 PRIMARY METRIC CARDS - Plain Language */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Profile Visits"
          value={totalViews}
          change={totalViews > 0 ? 100 : 0}
          icon={Eye}
          variant="cyan"
        />
        <MetricCard
          title="Physical Card Taps"
          value={totalTaps}
          change={totalTaps > 0 ? 100 : 0}
          icon={Radio}
          variant="amber"
        />
        <MetricCard
          title="Link Clicks"
          value={totalClicks}
          change={totalClicks > 0 ? 100 : 0}
          icon={MousePointerClick}
          variant="electric"
        />
        <MetricCard
          title="New Connections"
          value={uniqueVisitors}
          change={uniqueVisitors > 0 ? 100 : 0}
          icon={Users}
          variant="azure"
        />
      </div>

      {/* CHARTS & RECENT ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Traffic Chart & Top Links */}
        <div className="lg:col-span-8 space-y-8">
          <TrafficChart timeframe="weekly" />
          <TopLinksTable links={profileLinks} />
        </div>

        {/* Right: Active Card & Recent Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active NFC Card Widget */}
          <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-5 shadow-card-bits space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-bits-cyan" />
                Linked NFC Card
              </span>
              <Link to="/dashboard/cards" className="text-xs text-bits-cyan hover:underline font-mono">
                View all ({cards.length})
              </Link>
            </div>
            {activeCard ? (
              <NFCCardPreview
                card={activeCard}
                profile={activeProfile}
                interactive={false}
              />
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 space-y-2">
                <p>No active NFC card linked yet.</p>
                <Link to="/dashboard/cards" className="inline-block text-cyan-400 hover:underline font-semibold">
                  + Claim NFC Card
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity Stream */}
          <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-5 shadow-card-bits space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-bits-cyan" />
                Recent Interactions
              </h3>
              <span className="w-2 h-2 rounded-full bg-bits-cyan animate-ping"></span>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                <p>No recent activity recorded yet.</p>
                <p className="text-[11px] text-slate-500">Tap your NFC card or share your profile to see real-time connections appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-bits-midnight/60 border border-bits-vapor/10 hover:border-bits-cyan/40 transition space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-100">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
