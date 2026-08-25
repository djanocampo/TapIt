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
  QrCode, 
  Palette, 
  Clock, 
  ExternalLink,
  Smartphone,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';

export const DashboardOverview: React.FC = () => {
  const { currentUser, profiles, activeProfile, links, cards, notifications, openSimulator } = useTapIt();

  // Active profile's links and card
  const profileLinks = links.filter((l) => l.profileId === activeProfile.id);
  const activeCard = cards.find((c) => c.profileId === activeProfile.id) || cards[0];

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-purple-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>Active Profile: {activeProfile.name}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {greeting}, {currentUser.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Your digital identity is live and ready to connect. Here is your networking summary.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
          <Link to="/dashboard/links">
            <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Link
            </Button>
          </Link>
          <Link to="/dashboard/cards">
            <Button variant="secondary" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
              My Cards
            </Button>
          </Link>
          <Button
            variant="glow"
            size="sm"
            onClick={() => openSimulator(activeCard)}
            leftIcon={<Radio className="w-4 h-4" />}
          >
            Simulate Tap
          </Button>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Profile Views"
          value={2847}
          change={18.4}
          icon={Eye}
          variant="purple"
        />
        <MetricCard
          title="NFC Taps"
          value={1542}
          change={24.2}
          icon={Radio}
          variant="cyan"
        />
        <MetricCard
          title="Link Clicks"
          value={4521}
          change={12.8}
          icon={MousePointerClick}
          variant="emerald"
        />
        <MetricCard
          title="Unique Visitors"
          value={1932}
          change={9.6}
          icon={Users}
          variant="amber"
        />
      </div>

      {/* CHARTS & RECENT ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Traffic Chart */}
        <div className="lg:col-span-8 space-y-8">
          <TrafficChart timeframe="weekly" />
          <TopLinksTable links={profileLinks} />
        </div>

        {/* Right: Active Card & Recent Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active NFC Card Widget */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                Linked NFC Card
              </span>
              <Link to="/dashboard/cards" className="text-xs text-cyan-400 hover:underline">
                View all ({cards.length})
              </Link>
            </div>
            {activeCard ? (
              <NFCCardPreview
                card={activeCard}
                profile={activeProfile}
                onTapSimulate={() => openSimulator(activeCard)}
                interactive={false}
              />
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No active NFC card linked yet.
              </div>
            )}
          </div>

          {/* Recent Activity Stream */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                Live Activity Feed
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">{item.title}</span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
