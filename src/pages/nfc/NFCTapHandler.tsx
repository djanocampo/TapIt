import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Radio, Smartphone, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { UnclaimedCardPage } from './UnclaimedCardPage';
import { DisabledCardPage } from './DisabledCardPage';

export const NFCTapHandler: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { cards, recordCardTap, profiles } = useTapIt();

  const [status, setStatus] = useState<'resolving' | 'active' | 'unclaimed' | 'disabled' | 'not_found'>('resolving');
  const [resolvedProfileSlug, setResolvedProfileSlug] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('not_found');
      return;
    }

    const timer = setTimeout(() => {
      const result = recordCardTap(token);

      if (result.status === 'active') {
        const assignedProfile = result.profile || profiles.find(p => p.id === result.card?.profileId) || profiles[0];
        setResolvedProfileSlug(assignedProfile.slug);
        setStatus('active');
        // Redirect seamlessly to public profile with NFC attribution
        setTimeout(() => {
          navigate(`/@${assignedProfile.slug}?src=nfc`);
        }, 1000);
      } else if (result.status === 'unclaimed') {
        setStatus('unclaimed');
      } else if (result.status === 'disabled' || result.status === 'suspended') {
        setStatus('disabled');
      } else {
        setStatus('not_found');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [token]);

  if (status === 'unclaimed') {
    return <UnclaimedCardPage cardToken={token || ''} />;
  }

  if (status === 'disabled') {
    return <DisabledCardPage cardToken={token || ''} />;
  }

  if (status === 'not_found') {
    return <UnclaimedCardPage cardToken={token || ''} isNewToken={true} />;
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
        <p className="text-xs text-slate-400">
          Token: <strong className="font-mono text-slate-200">/t/{token}</strong>
        </p>
      </div>
    </div>
  );
};
