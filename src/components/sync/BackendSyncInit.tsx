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

const SYNC_COOLDOWN_MS = 30000; // 30s cooldown between auto-refreshes on window focus

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

        // ── PULL (Remote Authoritative Fetch) ──
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

        // Hydrate store state with merged records
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

    // Defer initial sync slightly to allow instant first frame paint (<10ms)
    const initialTimer = setTimeout(() => {
      void runPullSync();
    }, 400);

    // ── THROTTLED RECONNECTION & TAB FOCUS LISTENERS ──
    const handleReconnection = () => {
      if (document.visibilityState === 'hidden') return;
      const now = Date.now();
      if (now - lastSyncTimeRef.current < SYNC_COOLDOWN_MS) {
        return; // Skip if synced recently
      }
      void runPullSync();
    };

    window.addEventListener('online', handleReconnection);
    window.addEventListener('focus', handleReconnection);
    document.addEventListener('visibilitychange', handleReconnection);

    // ── SUPABASE REALTIME LIVE WEBSOCKET SUBSCRIPTION ──
    const unsubscribe = subscribeToRealtimeChanges(() => {
      void runPullSync();
    });

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('online', handleReconnection);
      window.removeEventListener('focus', handleReconnection);
      document.removeEventListener('visibilitychange', handleReconnection);
      unsubscribe();
    };
  }, []);

  return null; // Headless component - Renders zero DOM
};

