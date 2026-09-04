import React, { useEffect } from 'react';
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
  syncUsersToSupabase,
  syncProfilesToSupabase,
  syncLinksToSupabase,
  syncCardsToSupabase,
  syncQRCodesToSupabase,
  syncAnalyticsToSupabase,
  syncInvitesToSupabase,
  syncNotificationsToSupabase,
  syncSettingsToSupabase,
  subscribeToRealtimeChanges
} from '../../services/dualLayerSync';
import { isSupabaseConfigured } from '../../lib/supabase';

export const BackendSyncInit: React.FC = () => {
  const { 
    allUsers, 
    profiles, 
    links, 
    cards, 
    qrCodes, 
    analyticsEvents, 
    invites, 
    notifications, 
    systemSettings,
    hydrateFromRemote
  } = useTapIt();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const syncAllStores = async () => {
      try {
        // ── PHASE 1: PULL (Remote → Local Merge) ──
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
          fetchRemoteProfiles(profiles),
          fetchRemoteLinks(links),
          fetchRemoteCards(cards),
          fetchRemoteQRCodes(qrCodes),
          fetchRemoteAnalytics(analyticsEvents),
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

        // ── PHASE 2: PUSH (Local Offline Delta → Remote Persistence) ──
        await Promise.all([
          syncUsersToSupabase(remoteUsers),
          syncProfilesToSupabase(remoteProfiles),
          syncLinksToSupabase(remoteLinks),
          syncCardsToSupabase(remoteCards),
          syncQRCodesToSupabase(remoteQRCodes),
          syncAnalyticsToSupabase(remoteAnalytics),
          syncInvitesToSupabase(remoteInvites),
          syncNotificationsToSupabase(remoteNotifs),
          syncSettingsToSupabase(remoteSettings),
        ]);
      } catch (err) {
        console.warn('[Dual-Layer Sync] Background sync cycle deferred:', err);
      }
    };

    // Initial mount sync
    void syncAllStores();

    // ── RECONNECTION & TAB FOCUS LISTENERS ──
    const handleReconnection = () => {
      void syncAllStores();
    };

    window.addEventListener('online', handleReconnection);
    window.addEventListener('focus', handleReconnection);
    document.addEventListener('visibilitychange', handleReconnection);

    // ── SUPABASE REALTIME LIVE WEBSOCKET SUBSCRIPTION ──
    const unsubscribe = subscribeToRealtimeChanges(() => {
      void syncAllStores();
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
