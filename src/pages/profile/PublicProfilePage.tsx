import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { PublicProfileRenderer } from '../../components/profile/PublicProfileRenderer';
import { ShareProfileModal } from '../../components/profile/ShareProfileModal';
import { Radio } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { NFCTapLoadingScreen } from '../../components/nfc/NFCTapLoadingScreen';
import tapItLogo from '../../assets/tapit-logo.png';

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapDBToProfile, mapDBToLink } from '../../services/dualLayerSync';
import { Profile, LinkItem } from '../../types';

export const PublicProfilePage: React.FC = () => {
  const { username, profileSlug } = useParams<{ username?: string; profileSlug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const source = searchParams.get('src') || 'direct';

  const { allProfiles, allUsers, allLinks, recordLinkClick, logAnalyticsEvent } = useTapIt();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [remoteProfile, setRemoteProfile] = useState<Profile | null>(null);
  const [remoteLinks, setRemoteLinks] = useState<LinkItem[] | null>(null);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  // Normalize route parameters
  const userParam = (username || '').replace(/^@/, '').toLowerCase().trim();
  const slugParam = (profileSlug || '').replace(/^@/, '').toLowerCase().trim();
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

  // Match profile locally from store
  const localMatch = React.useMemo(() => {
    if (!cleanUsername) return null;

    // 1. If both username and profileSlug are provided (e.g. /djanocampo/personal)
    if (userParam && slugParam && userParam !== slugParam) {
      const user = allUsers.find((u) => u.username.toLowerCase() === userParam);
      if (user) {
        const userProfs = allProfiles.filter((p) => p.userId === user.id);
        const match = userProfs.find(
          (p) =>
            p.slug.toLowerCase() === slugParam ||
            p.name.toLowerCase() === slugParam ||
            p.name.toLowerCase().includes(slugParam)
        );
        if (match) return match;
      }
    }

    // 2. Direct slug or ID match
    const bySlug = allProfiles.find(
      (p) =>
        p.slug.toLowerCase() === cleanUsername ||
        p.id.toLowerCase() === cleanUsername
    );
    if (bySlug) return bySlug;

    // 3. Fallback: If cleanUsername is a user's username, pick their personal or active profile
    const user = allUsers.find((u) => u.username.toLowerCase() === cleanUsername);
    if (user) {
      const userProfs = allProfiles.filter((p) => p.userId === user.id);
      const personalProf = userProfs.find(
        (p) =>
          p.name.toLowerCase() === 'personal' ||
          p.name.toLowerCase().includes('personal') ||
          p.slug.toLowerCase().includes('personal')
      );
      if (personalProf) return personalProf;
      return userProfs.find((p) => p.isActive) || userProfs[0] || null;
    }

    return null;
  }, [cleanUsername, userParam, slugParam, allProfiles, allUsers]);

  const localMatchRef = React.useRef(localMatch);
  localMatchRef.current = localMatch;

  // Query Supabase database directly for authoritative remote data
  useEffect(() => {
    let isMounted = true;
    // Clear previous profile data immediately to avoid stale state flicker on route transitions
    setRemoteProfile(null);
    setRemoteLinks(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (cleanUsername && isSupabaseConfigured()) {
      if (!localMatchRef.current) setIsSearchingRemote(true);
      (async () => {
        try {
          let foundProfileRow: any = null;

          // 1. If both user and profile slug are provided (e.g. /djanocampo/personal)
          if (userParam && slugParam && userParam !== slugParam) {
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .ilike('username', userParam)
              .maybeSingle();

            if (userData?.id) {
              const { data: userProfs } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userData.id);

              if (userProfs && userProfs.length > 0) {
                foundProfileRow =
                  userProfs.find(
                    (p: any) =>
                      p.slug?.toLowerCase() === slugParam ||
                      p.name?.toLowerCase() === slugParam ||
                      p.name?.toLowerCase().includes(slugParam)
                  ) || null;
              }
            }
          }

          // 2. Direct lookup by slug or id
          if (!foundProfileRow) {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .or(`slug.ilike.${cleanUsername},id.eq.${cleanUsername}`)
              .limit(1)
              .maybeSingle();

            if (!error && data) {
              foundProfileRow = data;
            }
          }

          // 3. Fallback: Check if cleanUsername is a user's username
          if (!foundProfileRow) {
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .ilike('username', cleanUsername)
              .maybeSingle();

            if (userData?.id) {
              const { data: userProfs } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userData.id);

              if (userProfs && userProfs.length > 0) {
                foundProfileRow =
                  userProfs.find(
                    (p: any) =>
                      p.name?.toLowerCase() === 'personal' ||
                      p.name?.toLowerCase().includes('personal') ||
                      p.slug?.toLowerCase().includes('personal')
                  ) ||
                  userProfs.find((p: any) => p.is_active) ||
                  userProfs[0];
              }
            }
          }

          if (foundProfileRow && isMounted) {
            const parsed = mapDBToProfile(foundProfileRow);
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
  }, [cleanUsername, userParam, slugParam]);

  // Always prioritize whichever record (local live store vs remote fetch) has the latest updatedAt timestamp
  const targetProfile = (localMatch && remoteProfile)
    ? (new Date(localMatch.updatedAt || 0).getTime() >= new Date(remoteProfile.updatedAt || 0).getTime() ? localMatch : remoteProfile)
    : (remoteProfile || localMatch);

  const activeLinks = targetProfile
    ? (remoteLinks && remoteLinks.length > 0 ? remoteLinks : allLinks.filter((l) => l.profileId === targetProfile.id))
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
      <NFCTapLoadingScreen
        statusText="Loading TapIt Profile..."
        subText="Syncing dynamic profile links & credentials..."
        profileSlug={cleanUsername}
      />
    );
  }

  if (!targetProfile) {
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-4">
          <img
            src={tapItLogo}
            alt="TapIt"
            className="h-10 w-auto object-contain opacity-70 mx-auto"
          />
        </div>
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
      className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 transition-colors"
      style={{
        backgroundColor: targetProfile.theme.bgColor,
        backgroundImage: targetProfile.theme.bgGradient,
      }}
    >
      {/* Main Public Profile Content */}
      <div className="w-full max-w-md flex-1 flex items-center justify-center">
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
