import React, { useEffect, useRef } from 'react';
import { useTapIt } from '../../store';
import { 
  fetchRemoteUsers,
  fetchRemoteProfiles,
  fetchRemoteLinks,
  fetchRemoteCards,
  fetchRemoteQRCodes,
  fetchRemoteAnalytics,
  fetchRemoteInvites,
  fetchRemoteNotifications,
  fetchRemoteSettings,
  subscribeToRealtimeChanges
} from '../../services/dualLayerSync';
import { isSupabaseConfigured } from '../../lib/supabase';

const SYNC_COOLDOWN_MS = 2000; // 2s cooldown to prevent flood while remaining responsive

export const BackendSyncInit: React.FC = () => {
  const store = useTapIt();
  const storeRef = useRef(store);
  storeRef.current = store;

  const isSyncingRef = useRef(false);
  const lastSyncTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const runPullSync = async () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      lastSyncTimeRef.current = Date.now();

      try {
        const { 
          allUsers, 
          allProfiles, 
          allLinks, 
          allCards, 
          qrCodes, 
          allAnalyticsEvents, 
          invites, 
          notifications, 
          systemSettings,
          hydrateFromRemote 
        } = storeRef.current;

        // ── PULL (Remote Authoritative Fetch Directly From Supabase) ──
        const [
          remoteUsers,
          remoteProfiles,
          remoteLinks,
          remoteCards,
          remoteQRCodes,
          remoteAnalytics,
          remoteInvites,
          remoteNotifs,
          remoteSettings
        ] = await Promise.all([
          fetchRemoteUsers(allUsers),
          fetchRemoteProfiles(allProfiles),
          fetchRemoteLinks(allLinks),
          fetchRemoteCards(allCards),
          fetchRemoteQRCodes(qrCodes),
          fetchRemoteAnalytics(allAnalyticsEvents),
          fetchRemoteInvites(invites),
          fetchRemoteNotifications(notifications),
          fetchRemoteSettings(systemSettings),
        ]);

        // Hydrate store state with clean remote records
        hydrateFromRemote({
          users: remoteUsers,
          profiles: remoteProfiles,
          links: remoteLinks,
          cards: remoteCards,
          qrCodes: remoteQRCodes,
          analytics: remoteAnalytics,
          invites: remoteInvites,
          notifications: remoteNotifs,
          settings: remoteSettings,
        });
      } catch (err) {
        console.warn('[Dual-Layer Sync] Background pull deferred:', err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Run pull sync immediately upon page visit / refresh
    void runPullSync();

    // ── RECONNECTION & TAB FOCUS LISTENERS ──
    const handleReconnection = () => {
      if (document.visibilityState === 'hidden') return;
      const now = Date.now();
      if (now - lastSyncTimeRef.current < SYNC_COOLDOWN_MS) {
        return;
      }
      void runPullSync();
    };

    window.addEventListener('online', handleReconnection);
    window.addEventListener('focus', handleReconnection);
    document.addEventListener('visibilitychange', handleReconnection);

    // ── SUPABASE REALTIME LIVE WEBSOCKET SUBSCRIPTION ──
    const unsubscribe = subscribeToRealtimeChanges(() => {
      const now = Date.now();
      if (now - lastSyncTimeRef.current < SYNC_COOLDOWN_MS) {
        return;
      }
      void runPullSync();
    });

    return () => {
      window.removeEventListener('online', handleReconnection);
      window.removeEventListener('focus', handleReconnection);
      document.removeEventListener('visibilitychange', handleReconnection);
      unsubscribe();
    };
  }, []);

  return null; // Headless component - Renders zero DOM
};

