import React from 'react';
import { LinkItem } from '../../types';
import { ExternalLink, TrendingUp, MousePointerClick, BarChart2 } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface TopLinksTableProps {
  links: LinkItem[];
}

export const TopLinksTable: React.FC<TopLinksTableProps> = ({ links }) => {
  const sortedLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 6);
  const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0) || 1;

  return (
    <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-5 sm:p-6 shadow-card-bits space-y-4 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white font-display">Top-Performing Links</h3>
          <p className="text-xs text-slate-400">Ranked by total click-through count and conversion share</p>
        </div>
        <div>
          <span className="inline-block text-xs font-semibold text-bits-cyan bg-bits-azure/30 border border-bits-cyan/30 px-3 py-1 rounded-full shadow-glow-cyan">
            {formatNumber(totalClicks)} Total Clicks
          </span>
        </div>
      </div>

      <div className="overflow-x-auto touch-pan-x -mx-1 sm:mx-0">
        <table className="w-full min-w-[340px] text-left text-xs">
          <thead>
            <tr className="border-b border-bits-vapor/10 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-3 pl-1 font-medium">Rank & Link</th>
              <th className="pb-3 font-medium hidden sm:table-cell">Category</th>
              <th className="pb-3 text-right font-medium">Clicks</th>
              <th className="pb-3 text-right pr-1 font-medium">Share %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bits-vapor/10 text-slate-200">
            {sortedLinks.map((link, index) => {
              const share = Math.round((link.clicks / totalClicks) * 100);
              return (
                <tr key={link.id} className="hover:bg-bits-midnight/50 transition">
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-bits-midnight text-bits-cyan font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-bits-vapor/10">
                        {index + 1}
                      </span>
                      <div className="min-w-0 max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                        <p className="font-semibold text-slate-100 truncate">{link.title}</p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-bits-cyan hover:underline truncate block font-mono"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-bits-midnight/80 border border-bits-vapor/10 text-slate-300 text-[10px] font-medium uppercase tracking-wider">
                      {link.category}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-white">
                    {formatNumber(link.clicks)}
                  </td>
                  <td className="py-3 text-right pr-1">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-14 bg-bits-midnight h-1.5 rounded-full overflow-hidden hidden md:block border border-bits-vapor/10">
                        <div className="bg-gradient-to-r from-bits-electric to-bits-cyan h-full rounded-full" style={{ width: `${share}%` }} />
                      </div>
                      <span className="font-mono text-bits-cyan font-semibold">{share}%</span>
                    </div>
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
