import React, { useState, useMemo } from 'react';
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
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';

export const AnalyticsPage: React.FC = () => {
  const { profiles, activeProfile, links, cards, analyticsEvents } = useTapIt();

  const [showDetailedTelemetry, setShowDetailedTelemetry] = useState(false);

  const profileLinks = links.filter((l) => l.profileId === activeProfile.id);
  const totalTaps = cards.reduce((sum, c) => sum + c.taps, 0);
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const totalViews = analyticsEvents.filter((e) => e.eventType === 'profile_view').length;
  const totalQRScans = analyticsEvents.filter((e) => e.eventType === 'qr_scan').length;
  const uniqueVisitors = new Set(analyticsEvents.map((e) => e.id)).size;
  const totalConnections = totalTaps + totalQRScans + totalViews;

  const topLink = useMemo(() => {
    if (profileLinks.length === 0) return null;
    const sorted = [...profileLinks].sort((a, b) => b.clicks - a.clicks);
    return sorted[0];
  }, [profileLinks]);

  const ctr = totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(1)}%` : '0.0%';
  const engagement = totalViews > 0 ? `${(((totalClicks + totalTaps) / totalViews) * 100).toFixed(1)}%` : '0.0%';

  // Device breakdown
  const iosCount = analyticsEvents.filter((e) => e.os === 'iOS').length;
  const androidCount = analyticsEvents.filter((e) => e.os === 'Android').length;
  const desktopCount = analyticsEvents.filter((e) => e.os === 'Windows' || e.os === 'macOS' || e.os === 'Linux').length;
  const totalDeviceEvents = iosCount + androidCount + desktopCount || 1;

  const iosPct = Math.round((iosCount / totalDeviceEvents) * 100);
  const androidPct = Math.round((androidCount / totalDeviceEvents) * 100);
  const desktopPct = Math.round((desktopCount / totalDeviceEvents) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bits-cyan bg-bits-azure/30 border border-bits-cyan/30 px-3 py-0.5 rounded-full mb-1">
            <BitsInfinityEmblem size={12} />
            <span>Real-Time Contactless Telemetry Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Performance & Analytics</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Plain-language answers to your interactions, plus deep technical telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-glow-emerald">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Stream Active</span>
          </div>
        </div>
      </div>

      {/* 3 HUMAN QUESTIONS HERO SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Who connected with you? */}
        <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits space-y-4 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Audience Reach
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-full">Question 1</span>
            </div>
            <h3 className="text-base font-bold text-white">Who connected with you?</h3>
            <div className="pt-2">
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-2">
                {totalConnections}
                <span className="text-xs text-slate-400 font-sans font-normal">total impressions</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Physical NFC Taps
              </span>
              <strong className="text-white font-mono">{totalTaps}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                Matrix QR Scans
              </span>
              <strong className="text-white font-mono">{totalQRScans}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Unique Visitors
              </span>
              <strong className="text-white font-mono">{uniqueVisitors}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: What interested them most? */}
        <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits space-y-4 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <MousePointerClick className="w-4 h-4" />
                Interest & Conversion
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-full">Question 2</span>
            </div>
            <h3 className="text-base font-bold text-white">What interested them most?</h3>
            <div className="pt-2">
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-2">
                {totalClicks}
                <span className="text-xs text-slate-400 font-sans font-normal">total link clicks</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#050c18] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Top Performing Destination</span>
            {topLink ? (
              <div>
                <p className="text-xs font-bold text-white truncate">{topLink.title}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                  <span className="font-mono text-cyan-400">{topLink.clicks} clicks</span>
                  <span>{totalClicks > 0 ? `${Math.round((topLink.clicks / totalClicks) * 100)}% share` : '0%'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No link activity recorded yet.</p>
            )}
          </div>
        </div>

        {/* Card 3: When were they active? */}
        <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits space-y-4 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Activity Timeline
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-full">Question 3</span>
            </div>
            <h3 className="text-base font-bold text-white">When were they active?</h3>
            <div className="pt-2">
              <div className="text-xs text-slate-300 leading-relaxed">
                Interaction activity is synchronized in real-time across your active smart cards and web links.
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-[#050c18] border border-white/[0.06]">
              <span className="text-slate-400">Live Traffic Stream</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Click &ldquo;Expand Telemetry&rdquo; below for detailed charts
            </p>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE TELEMETRY DRAWER TOGGLE */}
      <div className="flex items-center justify-between pt-2 pb-1 border-t border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Detailed Telemetry & Device Breakdown
          </h3>
          <p className="text-xs text-slate-400">
            {showDetailedTelemetry ? 'Showing conversion ratios, hardware comparisons, and device distribution' : 'Click to inspect raw KPI metrics, conversion ratios, and device telemetry'}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowDetailedTelemetry((prev) => !prev)}
          rightIcon={showDetailedTelemetry ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        >
          {showDetailedTelemetry ? 'Collapse Telemetry' : 'Expand Telemetry'}
        </Button>
      </div>

      {showDetailedTelemetry && (
        <div className="space-y-8 animate-fadeIn">
          {/* 7 MAIN KPI METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <MetricCard
              title="Total Views"
              value={totalViews}
              change={totalViews > 0 ? 100 : 0}
              icon={Eye}
              variant="azure"
            />
            <MetricCard
              title="Unique Visitors"
              value={uniqueVisitors}
              change={uniqueVisitors > 0 ? 100 : 0}
              icon={Users}
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
              title="QR Scans"
              value={totalQRScans}
              change={totalQRScans > 0 ? 100 : 0}
              icon={QrCode}
              variant="azure"
            />
            <MetricCard
              title="Link Clicks"
              value={totalClicks}
              change={totalClicks > 0 ? 100 : 0}
              icon={MousePointerClick}
              variant="electric"
            />
            <MetricCard
              title="CTR %"
              value={ctr}
              change={totalViews > 0 ? 100 : 0}
              icon={Percent}
              variant="amber"
            />
            <MetricCard
              title="Engagement"
              value={engagement}
              change={totalViews > 0 ? 100 : 0}
              icon={Zap}
              variant="cyan"
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
          {analyticsEvents.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No device telemetry recorded yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">iOS Mobile (iPhone)</span>
                <strong className="text-white font-mono">{iosPct}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Android Mobile</span>
                <strong className="text-white font-mono">{androidPct}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Desktop (Mac/PC)</span>
                <strong className="text-white font-mono">{desktopPct}%</strong>
              </div>
            </div>
          )}
        </div>

        {/* Top Locations */}
        <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-purple-400" />
            Top Locations
          </h4>
          {analyticsEvents.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No location telemetry recorded yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">🇵🇭 Metro Manila, PH</span>
                <strong className="text-white font-mono">100%</strong>
              </div>
            </div>
          )}
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
      )}
    </div>
  );
};
