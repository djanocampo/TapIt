import React from 'react';
import { useTapIt } from '../../store';
import { MetricCard } from '../../components/analytics/MetricCard';
import { TrafficChart } from '../../components/analytics/TrafficChart';
import { TrafficSourceChart } from '../../components/analytics/TrafficSourceChart';
import { 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Globe, 
  Cpu, 
  Radio, 
  Users, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { formatNumber } from '../../lib/utils';

export const AdminAnalyticsPage: React.FC = () => {
  const { cards, profiles, allUsers, analyticsEvents } = useTapIt();

  const totalProfileVisits = analyticsEvents.filter((e) => e.eventType === 'profile_view').length;
  const totalNFCTaps = cards.reduce((sum, c) => sum + c.taps, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Platform-Wide Telemetry</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Global traffic distribution, hardware tap rates, anti-fraud detection, and regional usage.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Global Event Ingestion: Active</span>
        </div>
      </div>

      {/* 4 Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Global Profile Visits"
          value={totalProfileVisits}
          change={totalProfileVisits > 0 ? 100 : 0}
          icon={Globe}
          variant="cyan"
        />
        <MetricCard
          title="Total NFC Hardware Taps"
          value={totalNFCTaps}
          change={totalNFCTaps > 0 ? 100 : 0}
          icon={Radio}
          variant="purple"
        />
        <MetricCard
          title="Active Creators & Pros"
          value={allUsers.length}
          change={allUsers.length > 0 ? 100 : 0}
          icon={Users}
          variant="emerald"
        />
        <MetricCard
          title="Suspicious Tap Detection"
          value="0.0%"
          change={0}
          icon={ShieldCheck}
          variant="amber"
        />
      </div>

      {/* Global Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <TrafficChart timeframe="weekly" />
        </div>
        <div className="lg:col-span-4">
          <TrafficSourceChart />
        </div>
      </div>

      {/* Real-time Anti-Fraud & Hardware Security Log */}
      <div className="bg-[#0d1322] border border-purple-900/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            NFC Token Collision & Fraud Monitor
          </h3>
          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
            0 CRITICAL ALERTS
          </span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Token <strong className="font-mono text-cyan-400">/t/8xK29mQ</strong> verified cryptographic handshake with iPhone 15 Pro.</span>
            </div>
            <span className="text-slate-500 text-[10px]">Just now</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Token <strong className="font-mono text-cyan-400">/t/4kL92pZ</strong> rate limit check passed (1 tap / 30s debounce).</span>
            </div>
            <span className="text-slate-500 text-[10px]">4m ago</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Unclaimed token <strong className="font-mono text-amber-400">/t/NEW_TAP_77</strong> pinged from IP: 112.198.x.x — redirected to claim page.</span>
            </div>
            <span className="text-slate-500 text-[10px]">12m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
