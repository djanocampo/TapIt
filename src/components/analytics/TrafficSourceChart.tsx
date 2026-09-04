import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Radio, QrCode, Globe, Share2 } from 'lucide-react';
import { useTapIt } from '../../store';
import { AnalyticsEvent, NFCCard } from '../../types';

interface TrafficSourceChartProps {
  events?: AnalyticsEvent[];
  cards?: NFCCard[];
}

export const TrafficSourceChart: React.FC<TrafficSourceChartProps> = ({ events, cards: customCards }) => {
  const store = useTapIt();
  const activeEvents: AnalyticsEvent[] = events || store.analyticsEvents;
  const activeCards: NFCCard[] = customCards || store.cards;

  const nfcCount = activeEvents.filter((e: AnalyticsEvent) => e.trafficSource === 'nfc' || e.eventType === 'nfc_tap').length + activeCards.reduce((s: number, c: NFCCard) => s + c.taps, 0);
  const qrCount = activeEvents.filter((e: AnalyticsEvent) => e.trafficSource === 'qr' || e.eventType === 'qr_scan').length;
  const directCount = activeEvents.filter((e: AnalyticsEvent) => e.trafficSource === 'direct' || e.eventType === 'profile_view').length;
  const linkCount = activeEvents.filter((e: AnalyticsEvent) => e.eventType === 'link_click').length;

  const total = nfcCount + qrCount + directCount + linkCount;

  const sourceData = [
    { 
      name: 'NFC Tap', 
      value: total > 0 ? Math.round((nfcCount / total) * 100) : 0, 
      count: `${nfcCount} taps`, 
      color: '#06b6d4', 
      icon: Radio 
    },
    { 
      name: 'QR Code', 
      value: total > 0 ? Math.round((qrCount / total) * 100) : 0, 
      count: `${qrCount} scans`, 
      color: '#8b5cf6', 
      icon: QrCode 
    },
    { 
      name: 'Direct Visit', 
      value: total > 0 ? Math.round((directCount / total) * 100) : 0, 
      count: `${directCount} visits`, 
      color: '#10b981', 
      icon: Globe 
    },
    { 
      name: 'Link Clicks', 
      value: total > 0 ? Math.round((linkCount / total) * 100) : 0, 
      count: `${linkCount} clicks`, 
      color: '#f59e0b', 
      icon: Share2 
    },
  ];

  const topSourcePct = total > 0 ? Math.max(...sourceData.map(s => s.value)) : 0;

  return (
    <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-white font-display">Traffic Sources Breakdown</h3>
        <p className="text-xs text-slate-400">Distribution of how visitors access your profiles</p>
      </div>

      {/* Donut Chart */}
      <div className="h-44 w-full relative flex items-center justify-center">
        {total === 0 ? (
          <div className="text-center space-y-1">
            <span className="text-xs text-slate-400 block font-semibold">No Traffic Logged Yet</span>
            <span className="text-[11px] text-slate-500 block">Tap a card to start streaming telemetry</span>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0d1322" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Share']}
                  contentStyle={{
                    backgroundColor: '#070a13',
                    borderColor: '#334155',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-white font-display">{topSourcePct}%</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Top Source</span>
            </div>
          </>
        )}
      </div>

      {/* Sources list */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        {sourceData.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">{item.count}</span>
                <span className="font-bold text-white w-8 text-right font-mono">{item.value}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
