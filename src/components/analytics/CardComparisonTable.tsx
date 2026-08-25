import React from 'react';
import { NFCCard, Profile } from '../../types';
import { Radio, Wifi, TrendingUp, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { formatNumber, formatRelativeTime } from '../../lib/utils';

interface CardComparisonTableProps {
  cards: NFCCard[];
  profiles: Profile[];
}

export const CardComparisonTable: React.FC<CardComparisonTableProps> = ({ cards, profiles }) => {
  return (
    <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div>
        <h3 className="text-base font-bold text-white font-display">NFC Physical Cards Performance</h3>
        <p className="text-xs text-slate-400">Comparing physical chip hardware telemetry and peak engagement times</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-3 pl-1 font-medium">Card Name & Token</th>
              <th className="pb-3 font-medium">Assigned Profile</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 text-right font-medium">Total Taps</th>
              <th className="pb-3 text-right font-medium hidden md:table-cell">Unique Tappers</th>
              <th className="pb-3 text-right pr-1 font-medium hidden lg:table-cell">Last Tapped</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {cards.map((card) => {
              const assignedProfile = profiles.find((p) => p.id === card.profileId);
              return (
                <tr key={card.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{card.name}</p>
                        <span className="text-[10px] font-mono text-cyan-400">/t/{card.cardToken}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-medium">
                    {assignedProfile ? (
                      <span className="text-slate-300">💼 {assignedProfile.name}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                        card.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : card.status === 'unclaimed'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {card.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-cyan-300 text-sm">
                    {formatNumber(card.taps)}
                  </td>
                  <td className="py-3 text-right font-mono text-slate-300 hidden md:table-cell">
                    {formatNumber(card.uniqueTappers)}
                  </td>
                  <td className="py-3 text-right pr-1 text-slate-400 text-[11px] hidden lg:table-cell">
                    {card.lastTappedAt ? formatRelativeTime(card.lastTappedAt) : 'Never'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
