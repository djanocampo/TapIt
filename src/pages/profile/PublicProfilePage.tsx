import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { PublicProfileRenderer } from '../../components/profile/PublicProfileRenderer';
import { ShareProfileModal } from '../../components/profile/ShareProfileModal';
import { Radio, ArrowLeft, LayoutDashboard, Share2, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PublicProfilePage: React.FC = () => {
  const { username, profileSlug } = useParams<{ username?: string; profileSlug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const source = searchParams.get('src') || 'direct';

  const { profiles, links, recordLinkClick, logAnalyticsEvent } = useTapIt();
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Normalize username query (remove @ if present)
  const rawIdentifier = (profileSlug || username || '').trim();
  const cleanUsername = rawIdentifier.replace(/^@/, '').toLowerCase();

  // Redirect if an invite or tap token was hit on root slug
  useEffect(() => {
    if (cleanUsername.startsWith('inv-')) {
      navigate(`/invite/${rawIdentifier}`, { replace: true });
    } else if (cleanUsername.startsWith('tap-')) {
      navigate(`/t/${rawIdentifier}`, { replace: true });
    }
  }, [cleanUsername, rawIdentifier, navigate]);

  // Match profile by slug, name, or default to active/first profile
  const targetProfile = 
    profiles.find((p) => p.slug.toLowerCase() === cleanUsername) ||
    profiles.find((p) => p.name.toLowerCase() === cleanUsername) ||
    profiles.find((p) => p.displayName.toLowerCase() === cleanUsername) ||
    profiles.find((p) => p.id === cleanUsername) ||
    profiles.find((p) => p.isActive) ||
    profiles[0];

  // Log view event on mount
  useEffect(() => {
    if (targetProfile) {
      logAnalyticsEvent({
        profileId: targetProfile.id,
        eventType: 'profile_view',
        trafficSource: (source as any) || 'direct',
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
        browser: 'Chrome',
        os: 'iOS',
        country: 'Philippines',
        city: 'Manila',
      });
    }
  }, [targetProfile?.id, source]);

  if (!targetProfile) {
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-white">Profile Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">The TapIt profile you are looking for does not exist.</p>
        <Link to="/" className="mt-4">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 transition-colors"
      style={{
        backgroundColor: targetProfile.theme.bgColor,
        backgroundImage: targetProfile.theme.bgGradient,
      }}
    >
      {/* Top Floating Mini-Nav */}
      <div className="w-full max-w-md flex items-center justify-between py-2 px-3 mb-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-xs">
        <Link to="/" className="flex items-center gap-1.5 font-bold text-white hover:text-cyan-400 transition">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>TapIt</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareOpen(true)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-[11px] font-semibold"
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <Link
            to="/dashboard"
            className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition flex items-center gap-1 text-[11px] font-semibold border border-cyan-500/30"
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Main Public Profile Content */}
      <div className="w-full flex-1 flex items-center justify-center">
        <PublicProfileRenderer
          profile={targetProfile}
          links={links}
          onLinkClick={(link) => recordLinkClick(link.id, targetProfile.id, source)}
          onOpenShare={() => setIsShareOpen(true)}
          isEmbed={false}
        />
      </div>

      {/* Share Modal */}
      <ShareProfileModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profile={targetProfile}
      />
    </div>
  );
};
