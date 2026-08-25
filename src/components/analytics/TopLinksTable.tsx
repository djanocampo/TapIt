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
    <div className="bg-[#0d1322] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-display">Top-Performing Links</h3>
          <p className="text-xs text-slate-400">Ranked by total click-through count and conversion share</p>
        </div>
        <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
          {formatNumber(totalClicks)} Total Clicks
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-3 pl-1 font-medium">Rank & Link</th>
              <th className="pb-3 font-medium hidden sm:table-cell">Category</th>
              <th className="pb-3 text-right font-medium">Clicks</th>
              <th className="pb-3 text-right pr-1 font-medium">Share %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {sortedLinks.map((link, index) => {
              const share = Math.round((link.clicks / totalClicks) * 100);
              return (
                <tr key={link.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                        <p className="font-semibold text-slate-100 truncate">{link.title}</p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-cyan-400 hover:underline truncate block"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-medium uppercase tracking-wider">
                      {link.category}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-white">
                    {formatNumber(link.clicks)}
                  </td>
                  <td className="py-3 text-right pr-1">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-14 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden md:block">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${share}%` }} />
                      </div>
                      <span className="font-mono text-cyan-400 font-semibold">{share}%</span>
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
