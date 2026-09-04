import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { PublicProfileRenderer } from '../../components/profile/PublicProfileRenderer';
import { ShareProfileModal } from '../../components/profile/ShareProfileModal';
import { Radio, ArrowLeft, LayoutDashboard, Share2, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapDBToProfile, mapDBToLink } from '../../services/dualLayerSync';
import { Profile, LinkItem } from '../../types';

export const PublicProfilePage: React.FC = () => {
  const { username, profileSlug } = useParams<{ username?: string; profileSlug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const source = searchParams.get('src') || 'direct';

  const { allProfiles, allLinks, recordLinkClick, logAnalyticsEvent } = useTapIt();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [remoteProfile, setRemoteProfile] = useState<Profile | null>(null);
  const [remoteLinks, setRemoteLinks] = useState<LinkItem[] | null>(null);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

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

  // Match profile strictly by slug or id from allProfiles
  const localMatch = cleanUsername
    ? allProfiles.find(
        (p) =>
          p.slug.toLowerCase() === cleanUsername ||
          p.id.toLowerCase() === cleanUsername
      )
    : null;

  // If not found locally in memory, query Supabase database directly
  useEffect(() => {
    let isMounted = true;
    if (!localMatch && cleanUsername && isSupabaseConfigured()) {
      setIsSearchingRemote(true);
      (async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`slug.ilike.${cleanUsername},id.eq.${cleanUsername}`)
            .limit(1)
            .maybeSingle();

          if (!error && data && isMounted) {
            const parsed = mapDBToProfile(data);
            setRemoteProfile(parsed);

            const { data: linksData } = await supabase
              .from('links')
              .select('*')
              .eq('profile_id', parsed.id)
              .order('position', { ascending: true });

            if (linksData && isMounted) {
              setRemoteLinks(linksData.map(mapDBToLink));
            }
          }
        } catch {
          // ignore
        } finally {
          if (isMounted) setIsSearchingRemote(false);
        }
      })();
    } else {
      setIsSearchingRemote(false);
    }
    return () => {
      isMounted = false;
    };
  }, [cleanUsername, localMatch]);

  const targetProfile = localMatch || remoteProfile;
  const activeLinks = targetProfile
    ? (remoteLinks || allLinks.filter((l) => l.profileId === targetProfile.id))
    : [];

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

  if (isSearchingRemote) {
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-2xl border-2 border-cyan-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 mb-4 shadow-xl">
          <Radio className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>
        <h2 className="text-xl font-bold text-white">Profile Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          The TapIt profile <span className="text-cyan-400 font-mono font-bold">@{cleanUsername}</span> does not exist or has been deleted.
        </p>
        <Link to="/" className="mt-6">
          <Button variant="primary" size="sm">Return Home</Button>
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
          links={activeLinks}
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
