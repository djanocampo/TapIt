import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTapIt } from '../../store';

import { AnalyticsEvent, NFCCard } from '../../types';

interface TrafficChartProps {
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  events?: AnalyticsEvent[];
  cards?: NFCCard[];
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ events, cards: customCards }) => {
  const store = useTapIt();
  const activeEvents = events || store.analyticsEvents;
  const activeCards = customCards || store.cards;
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const totalTaps = activeCards.reduce((sum, c) => sum + c.taps, 0);
  const totalViews = activeEvents.filter(e => e.eventType === 'profile_view').length;
  const totalQr = activeEvents.filter(e => e.eventType === 'qr_scan').length;

  const getData = () => {
    if (period === 'daily') {
      return [
        { time: '00:00', views: 0, taps: 0, qr: 0 },
        { time: '04:00', views: 0, taps: 0, qr: 0 },
        { time: '08:00', views: 0, taps: 0, qr: 0 },
        { time: '12:00', views: Math.round(totalViews * 0.4), taps: Math.round(totalTaps * 0.4), qr: Math.round(totalQr * 0.4) },
        { time: '16:00', views: Math.round(totalViews * 0.7), taps: Math.round(totalTaps * 0.7), qr: Math.round(totalQr * 0.7) },
        { time: 'Now', views: totalViews, taps: totalTaps, qr: totalQr },
      ];
    }
    if (period === 'monthly') {
      return [
        { time: 'Week 1', views: 0, taps: 0, qr: 0 },
        { time: 'Week 2', views: 0, taps: 0, qr: 0 },
        { time: 'Week 3', views: Math.round(totalViews * 0.5), taps: Math.round(totalTaps * 0.5), qr: Math.round(totalQr * 0.5) },
        { time: 'This Week', views: totalViews, taps: totalTaps, qr: totalQr },
      ];
    }
    return [
      { time: 'Mon', views: 0, taps: 0, qr: 0 },
      { time: 'Tue', views: 0, taps: 0, qr: 0 },
      { time: 'Wed', views: 0, taps: 0, qr: 0 },
      { time: 'Thu', views: 0, taps: 0, qr: 0 },
      { time: 'Fri', views: Math.round(totalViews * 0.5), taps: Math.round(totalTaps * 0.5), qr: Math.round(totalQr * 0.5) },
      { time: 'Today', views: totalViews, taps: totalTaps, qr: totalQr },
    ];
  };

  return (
    <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white font-display">Traffic & Engagement Over Time</h3>
          <p className="text-xs text-slate-400">Comparing total profile views, physical NFC taps, and QR scans</p>
        </div>

        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                period === p
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={getData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorTaps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorQr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#070a13',
                borderColor: '#334155',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Area type="monotone" dataKey="views" name="Profile Views" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
            <Area type="monotone" dataKey="taps" name="NFC Taps" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTaps)" />
            <Area type="monotone" dataKey="qr" name="QR Scans" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorQr)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
