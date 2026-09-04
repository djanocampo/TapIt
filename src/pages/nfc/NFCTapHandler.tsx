import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getClientDeviceInfo } from '../../lib/utils';
import { Radio, Smartphone, CheckCircle2, AlertTriangle, HelpCircle, HandMetal, ShieldCheck, ArrowRight, LayoutDashboard } from 'lucide-react';
import { UnclaimedCardPage } from './UnclaimedCardPage';
import { DisabledCardPage } from './DisabledCardPage';
import { Button } from '../../components/ui/Button';

export const NFCTapHandler: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { cards, recordCardTap, profiles, logAnalyticsEvent } = useTapIt();

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

      // 1. Try resolving via local store
      const localResult = recordCardTap(cleanToken);
      if (localResult.status === 'active' && localResult.profile) {
        if (!isMounted) return;
        const slug = localResult.profile.slug || 'djan';
        setTargetSlug(slug);
        setProfileName(localResult.profile.displayName || localResult.profile.name || 'Profile');

        if (isUnderCooldown && remainingCooldown > 0) {
          setStatus('cooldown');
          setCooldownSeconds(remainingCooldown);
          let count = remainingCooldown;
          const interval = setInterval(() => {
            count -= 1;
            setCooldownSeconds(count);
            if (count <= 0) {
              clearInterval(interval);
              navigate(`/@${slug}?src=nfc`, { replace: true });
            }
          }, 1000);
          return;
        } else {
          setStatus('active');
          setTimeout(() => {
            if (isMounted) navigate(`/@${slug}?src=nfc`, { replace: true });
          }, 800);
          return;
        }
      }

      // 2. Query Supabase remote database (vital for public visitors and cross-device taps)
      if (isSupabaseConfigured()) {
        try {
          const { data: dbCard, error } = await supabase
            .from('nfc_cards')
            .select('*, profiles(*)')
            .ilike('card_token', cleanToken)
            .limit(1)
            .maybeSingle();

          if (!error && dbCard && isMounted) {
            if (dbCard.status === 'active' && dbCard.profiles) {
              const prof = Array.isArray(dbCard.profiles) ? dbCard.profiles[0] : dbCard.profiles;
              const slug = prof?.slug || 'djan';
              const name = prof?.display_name || prof?.name || 'Profile';

              setTargetSlug(slug);
              setProfileName(name);

              // Log remote tap event
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

              // Increment taps
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
                  setCooldownSeconds(count);
                  if (count <= 0) {
                    clearInterval(interval);
                    navigate(`/@${slug}?src=nfc`, { replace: true });
                  }
                }, 1000);
                return;
              } else {
                setStatus('active');
                setTimeout(() => {
                  if (isMounted) navigate(`/@${slug}?src=nfc`, { replace: true });
                }, 800);
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
        } catch (err) {
          console.warn('Error resolving NFC card remotely:', err);
        }
      }

      if (!isMounted) return;

      // 3. Fallback evaluation
      if (localResult.status === 'unclaimed') {
        setStatus('unclaimed');
      } else if (localResult.status === 'disabled') {
        setStatus('disabled');
      } else {
        setStatus('not_found');
      }
    }

    resolveTag();

    return () => {
      isMounted = false;
    };
  }, [token, navigate, profiles, cards, recordCardTap]);

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

          <div className="p-3 bg-black/50 border border-white/10 rounded-2xl text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Card Token:</span>
              <span className="font-mono text-cyan-300 font-bold">/t/{token}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Target Persona:</span>
              <span className="text-white font-bold">{profileName} (@{targetSlug})</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              variant="glow"
              size="md"
              onClick={() => navigate(`/@${targetSlug}?src=nfc`, { replace: true })}
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Profile Now (@{targetSlug})
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

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4 text-center">
      {/* NFC Ripple Wave */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
          <Radio className="w-10 h-10 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400/50 animate-ping pointer-events-none"></div>
      </div>

      <div className="space-y-2 max-w-sm">
        <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
          NFC Token Detected
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
          Connecting to TapIt Profile...
        </h2>
        {profileName && (
          <p className="text-sm font-bold text-cyan-300">
            {profileName} (@{targetSlug})
          </p>
        )}
        <p className="text-xs text-slate-400">
          Token: <strong className="font-mono text-slate-200">/t/{token}</strong>
        </p>
      </div>
    </div>
  );
};
