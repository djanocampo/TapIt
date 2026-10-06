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

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapit.app';
    navigator.clipboard.writeText(`${origin}/@${activeProfile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Your digital identity is live and ready to connect. Here is your real-time networking telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
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
            <span>{copied ? 'Copied Profile Link!' : 'Copy Profile Link'}</span>
          </button>

          <Link to="/dashboard/cards">
            <Button variant="glow" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
              My Cards
            </Button>
          </Link>

          <Link to={`/@${activeProfile.slug}`} target="_blank">
            <Button variant="secondary" size="sm" leftIcon={<ExternalLink className="w-4 h-4 text-bits-cyan" />}>
              View Live Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Profile Views"
          value={totalViews}
          change={totalViews > 0 ? 100 : 0}
          icon={Eye}
          variant="cyan"
        />
        <MetricCard
          title="NFC Taps"
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
          title="Unique Visitors"
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
                Live Telemetry Feed
              </h3>
              <span className="w-2 h-2 rounded-full bg-bits-cyan animate-ping"></span>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                <p>No recent activity recorded yet.</p>
                <p className="text-[11px] text-slate-500">Tap a physical NFC card or share your profile to see live telemetry stream.</p>
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
