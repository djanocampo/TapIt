import React from 'react';
import { Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { MetricCard } from '../../components/analytics/MetricCard';
import { TrafficChart } from '../../components/analytics/TrafficChart';
import { Button } from '../../components/ui/Button';
import { 
  ShieldCheck, 
  Users, 
  UserSquare2, 
  CreditCard, 
  Eye, 
  ShieldAlert, 
  Settings, 
  Layers, 
  ArrowUpRight, 
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { formatNumber } from '../../lib/utils';

export const AdminOverview: React.FC = () => {
  const { allUsers, allProfiles, allCards, allAnalyticsEvents } = useTapIt();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/40 shadow-2xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Platform Operations Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            TapIt Global Administrator Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor real-time platform metrics, provision NFC hardware tokens, manage users, and enforce security policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <Link to="/admin/cards">
            <Button variant="glow" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
              Batch Generate Tokens
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              User Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 PLATFORM STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={allUsers.length}
          change={allUsers.length > 0 ? 100 : 0}
          icon={Users}
          variant="purple"
        />
        <MetricCard
          title="Active Profiles"
          value={allProfiles.filter(p => p.isActive).length}
          change={allProfiles.length > 0 ? 100 : 0}
          icon={UserSquare2}
          variant="cyan"
        />
        <MetricCard
          title="Registered NFC Cards"
          value={allCards.length}
          change={allCards.length > 0 ? 100 : 0}
          icon={CreditCard}
          variant="emerald"
        />
        <MetricCard
          title="Total Profile Visits"
          value={allAnalyticsEvents.filter(e => e.eventType === 'profile_view').length}
          change={allAnalyticsEvents.length > 0 ? 100 : 0}
          icon={Eye}
          variant="amber"
        />
      </div>

      {/* CHARTS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <TrafficChart timeframe="weekly" events={allAnalyticsEvents} cards={allCards} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="bg-[#0d1322] border border-purple-900/30 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              Administrative Portals
            </h3>

            <div className="space-y-2">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">User Management</h4>
                    <p className="text-[10px] text-slate-400">{allUsers.length} registered accounts</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition" />
              </Link>

              <Link
                to="/admin/profiles"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <UserSquare2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Profile Directory</h4>
                    <p className="text-[10px] text-slate-400">{allProfiles.length} published profiles</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition" />
              </Link>

              <Link
                to="/admin/cards"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">NFC Chip Inventory</h4>
                    <p className="text-[10px] text-slate-400">{allCards.length} provisioned cards</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">System Settings</h4>
                    <p className="text-[10px] text-slate-400">Security & platform toggles</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
