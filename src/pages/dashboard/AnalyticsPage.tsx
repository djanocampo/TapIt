import React, { useState } from 'react';
import { useTapIt } from '../../store';
import { MetricCard } from '../../components/analytics/MetricCard';
import { TrafficChart } from '../../components/analytics/TrafficChart';
import { TrafficSourceChart } from '../../components/analytics/TrafficSourceChart';
import { TopLinksTable } from '../../components/analytics/TopLinksTable';
import { CardComparisonTable } from '../../components/analytics/CardComparisonTable';
import { 
  Eye, 
  Radio, 
  MousePointerClick, 
  Users, 
  QrCode, 
  Percent, 
  Zap, 
  Smartphone, 
  Globe, 
  ShieldCheck,
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AnalyticsPage: React.FC = () => {
  const { profiles, activeProfile, links, cards, analyticsEvents } = useTapIt();

  const profileLinks = links.filter((l) => l.profileId === activeProfile.id);
  const totalTaps = cards.reduce((sum, c) => sum + c.taps, 0);
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Deep Telemetry & Analytics</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time insights across NFC chip taps, QR scans, profile visits, and link click-through conversions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Stream Active</span>
          </div>
        </div>
      </div>

      {/* 7 MAIN KPI METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <MetricCard
          title="Total Views"
          value={2847}
          change={18.4}
          icon={Eye}
          variant="purple"
        />
        <MetricCard
          title="Unique Visitors"
          value={1932}
          change={9.6}
          icon={Users}
          variant="cyan"
        />
        <MetricCard
          title="NFC Taps"
          value={totalTaps || 1542}
          change={24.2}
          icon={Radio}
          variant="cyan"
        />
        <MetricCard
          title="QR Scans"
          value={522}
          change={14.1}
          icon={QrCode}
          variant="purple"
        />
        <MetricCard
          title="Link Clicks"
          value={totalClicks || 4521}
          change={12.8}
          icon={MousePointerClick}
          variant="emerald"
        />
        <MetricCard
          title="CTR %"
          value="48.2%"
          change={3.4}
          icon={Percent}
          variant="amber"
        />
        <MetricCard
          title="Engagement"
          value="71.5%"
          change={5.1}
          icon={Zap}
          variant="emerald"
        />
      </div>

      {/* TRAFFIC OVER TIME & SOURCES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <TrafficChart timeframe="weekly" />
        </div>
        <div className="lg:col-span-4">
          <TrafficSourceChart />
        </div>
      </div>

      {/* TOP LINKS & NFC CARDS COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6">
          <TopLinksTable links={profileLinks} />
        </div>
        <div className="lg:col-span-6">
          <CardComparisonTable cards={cards} profiles={profiles} />
        </div>
      </div>

      {/* DEVICE & GEOGRAPHIC BREAKDOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Devices */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            Device Distribution
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">iOS Mobile (iPhone)</span>
              <strong className="text-white font-mono">68%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Android Mobile</span>
              <strong className="text-white font-mono">24%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Desktop (Mac/PC)</span>
              <strong className="text-white font-mono">8%</strong>
            </div>
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-purple-400" />
            Top Locations
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">🇵🇭 Metro Manila, PH</span>
              <strong className="text-white font-mono">54%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">🇺🇸 San Francisco, US</span>
              <strong className="text-white font-mono">22%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">🇸🇬 Singapore, SG</span>
              <strong className="text-white font-mono">14%</strong>
            </div>
          </div>
        </div>

        {/* Privacy Shield */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Privacy & Compliance
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All telemetry is GDPR & CCPA compliant. Visitor IP addresses are anonymized. Zero personally identifiable visitor information is retained.
          </p>
        </div>
      </div>
    </div>
  );
};
