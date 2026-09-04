import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getClientDeviceInfo } from '../../lib/utils';
import { Radio, HandMetal, ArrowRight, LayoutDashboard } from 'lucide-react';
import { UnclaimedCardPage } from './UnclaimedCardPage';
import { DisabledCardPage } from './DisabledCardPage';
import { Button } from '../../components/ui/Button';

export const NFCTapHandler: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { allCards, recordCardTap, allProfiles } = useTapIt();

  const [status, setStatus] = useState<'resolving' | 'active' | 'unclaimed' | 'disabled' | 'not_found' | 'cooldown'>('resolving');
  const [targetSlug, setTargetSlug] = useState<string>('');
  const [profileName, setProfileName] = useState<string>('');
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function resolveTag() {
      if (!token) {
        if (isMounted) setStatus('not_found');
        return;
      }

      const cleanToken = token.trim();
      const stripped = cleanToken.replace(/^TAP-?/i, '');
      const normalized = cleanToken.toLowerCase();
      const strippedLower = stripped.toLowerCase();
      const prefixedLower = `tap-${strippedLower}`;

      // Check if tag was just written in this browser session (3-second cooldown active)
      let isUnderCooldown = false;
      let remainingCooldown = 0;
      if (typeof sessionStorage !== 'undefined') {
        const cooldownUntilStr = sessionStorage.getItem('tapit_nfc_cooldown_until');
        if (cooldownUntilStr) {
          const cooldownUntil = parseInt(cooldownUntilStr, 10);
          const diff = cooldownUntil - Date.now();
          if (diff > 0) {
            isUnderCooldown = true;
            remainingCooldown = Math.ceil(diff / 1000);
          }
        }
      }

      // ── STEP 1: AUTHORITATIVE REMOTE DATABASE RESOLUTION (Supabase) ──
      // When Supabase is configured, always resolve hardware cards directly from the database
      // so local browser cache / stale state never falsely intercept or block valid tags.
      if (isSupabaseConfigured()) {
        try {
          const candidateTokens = Array.from(new Set([
            cleanToken,
            cleanToken.toUpperCase(),
            cleanToken.toLowerCase(),
            stripped,
            stripped.toUpperCase(),
            stripped.toLowerCase(),
            `TAP-${stripped.toUpperCase()}`,
            `tap-${stripped.toLowerCase()}`
          ]));

          const { data: dbCard, error } = await supabase
            .from('nfc_cards')
            .select('*, profiles(*)')
            .in('card_token', candidateTokens)
            .limit(1)
            .maybeSingle();

          if (!error && dbCard && isMounted) {
            if (dbCard.status === 'active' && dbCard.profiles) {
              const prof = Array.isArray(dbCard.profiles) ? dbCard.profiles[0] : dbCard.profiles;
              if (!prof) {
                setStatus('unclaimed');
                return;
              }
              const slug = prof.slug || 'profile';
              const name = prof.display_name || prof.name || 'Profile';

              setTargetSlug(slug);
              setProfileName(name);

              // Non-blocking fire-and-forget background analytics and counter updates
              const client = getClientDeviceInfo();
              void supabase.from('analytics_events').insert({
                id: `evt_${Date.now()}`,
                profile_id: prof?.id,
                card_id: dbCard.id,
                event_type: 'nfc_tap',
                traffic_source: 'nfc',
                device_type: client.deviceType,
                browser: client.browser,
                os: client.os,
                country: 'Philippines',
                city: 'Manila',
                timestamp: new Date().toISOString(),
              });

              void supabase.from('nfc_cards').update({
                taps: (dbCard.taps || 0) + 1,
                last_tapped_at: new Date().toISOString(),
              }).eq('id', dbCard.id);

              if (isUnderCooldown && remainingCooldown > 0) {
                setStatus('cooldown');
                setCooldownSeconds(remainingCooldown);
                let count = remainingCooldown;
                const interval = setInterval(() => {
                  count -= 1;
                  if (isMounted) setCooldownSeconds(count);
                  if (count <= 0) {
                    clearInterval(interval);
                    if (isMounted) navigate(`/@${slug}?src=nfc`, { replace: true });
                  }
                }, 1000);
                return;
              } else {
                // INSTANT REDIRECT AS SOON AS DB RETURNS
                navigate(`/@${slug}?src=nfc`, { replace: true });
                return;
              }
            } else if (dbCard.status === 'disabled' || dbCard.status === 'suspended') {
              setStatus('disabled');
              return;
            } else if (dbCard.status === 'unclaimed') {
              setStatus('unclaimed');
              return;
            }
          }

          // Check if slug exists directly in remote profiles table
          const { data: remoteProf } = await supabase
            .from('profiles')
            .select('slug, name, display_name')
            .or(`slug.eq.${cleanToken},slug.eq.${stripped}`)
            .limit(1)
            .maybeSingle();

          if (remoteProf && isMounted) {
            navigate(`/@${remoteProf.slug}?src=nfc`, { replace: true });
            return;
          }
        } catch (err) {
          console.warn('Error resolving NFC card remotely, trying local fallback:', err);
        }
      }

      // ── STEP 2: OFFLINE LOCAL STORE FALLBACK (Only if Supabase not configured or unreachable) ──
      const localCard = allCards.find(c => {
        const t = c.cardToken.toLowerCase();
        return t === normalized || t === strippedLower || t === prefixedLower;
      });

      if (localCard) {
        if (localCard.status === 'active') {
          const prof = allProfiles.find(p => p.id === localCard.profileId);
          if (!prof) {
            if (isMounted) setStatus('unclaimed');
            return;
          }
          const slug = prof.slug || 'profile';
          const name = prof.displayName || prof.name || 'Profile';

          if (!isMounted) return;
          setTargetSlug(slug);
          setProfileName(name);
          recordCardTap(localCard.cardToken);

          if (isUnderCooldown && remainingCooldown > 0) {
            setStatus('cooldown');
            setCooldownSeconds(remainingCooldown);
            let count = remainingCooldown;
            const interval = setInterval(() => {
              count -= 1;
              if (isMounted) setCooldownSeconds(count);
              if (count <= 0) {
                clearInterval(interval);
                if (isMounted) navigate(`/@${slug}?src=nfc`, { replace: true });
              }
            }, 1000);
            return;
          } else {
            navigate(`/@${slug}?src=nfc`, { replace: true });
            return;
          }
        } else if (localCard.status === 'unclaimed') {
          if (isMounted) setStatus('unclaimed');
          return;
        } else if (localCard.status === 'disabled' || localCard.status === 'suspended') {
          if (isMounted) setStatus('disabled');
          return;
        }
      }

      // ── STEP 3: CHECK IF TOKEN IS DIRECT LOCAL PROFILE SLUG ──
      const directLocalProfile = allProfiles.find(p => 
        p.slug.toLowerCase() === normalized || 
        p.slug.toLowerCase() === strippedLower
      );
      if (directLocalProfile) {
        if (!isMounted) return;
        navigate(`/@${directLocalProfile.slug}?src=nfc`, { replace: true });
        return;
      }

      if (!isMounted) return;

      // ── STEP 4: FALLBACK TO UNCLAIMED ──
      setStatus('unclaimed');
    }

    resolveTag();

    return () => {
      isMounted = false;
    };
  }, [token, navigate, allProfiles, allCards, recordCardTap]);

  if (status === 'unclaimed') {
    return <UnclaimedCardPage cardToken={token || ''} />;
  }

  if (status === 'disabled') {
    return <DisabledCardPage cardToken={token || ''} />;
  }

  if (status === 'not_found') {
    return <UnclaimedCardPage cardToken={token || ''} isNewToken={true} />;
  }

  if (status === 'cooldown') {
    return (
      <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-[#0d1322] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-300 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/20 animate-pulse">
            <HandMetal className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full inline-block">
              Auto-Read Protection Active ({cooldownSeconds}s)
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              NFC Tag Just Programmed!
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Holding card buffer active to prevent accidental scan loops while the physical card is near your phone.
            </p>
          </div>

          {profileName && (
            <div className="p-3 bg-black/50 border border-white/10 rounded-2xl text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Target Identity:</span>
                <span className="text-cyan-300 font-bold">{profileName} (@{targetSlug})</span>
              </div>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <Button
              variant="glow"
              size="md"
              onClick={() => navigate(`/@${targetSlug}?src=nfc`, { replace: true })}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Profile Now
            </Button>

            <Link to="/dashboard" className="block w-full">
              <Button variant="secondary" size="sm" className="w-full justify-center" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── CLEAN HIGH-SPEED LOADING STATE (NO RAW TOKEN DISPLAYED) ──
  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.25)]">
          <Radio className="w-9 h-9 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400/40 animate-ping pointer-events-none" />
      </div>

      <div className="space-y-2 max-w-sm">
        <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-full inline-block">
          Smart NFC Card Detected
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display">
          Connecting to TapIt Profile...
        </h2>
        {profileName ? (
          <p className="text-sm font-bold text-cyan-300">
            {profileName} (@{targetSlug})
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Fast digital identity resolution in progress
          </p>
        )}
      </div>
    </div>
  );
};

