# Dual-Layer Sync Pattern

> A **localStorage-first, Supabase-backed** data synchronization architecture that delivers instant UI responsiveness while maintaining cross-device persistence through a remote database.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Why Dual-Layer?](#why-dual-layer)
3. [Core Concepts](#core-concepts)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Implementation Guide](#implementation-guide)
   - [Layer 1: Local Storage (Instant)](#layer-1-local-storage-instant)
   - [Layer 2: Supabase Remote (Persistent)](#layer-2-supabase-remote-persistent)
   - [Merge Strategy](#merge-strategy)
   - [Global Sync Orchestrator](#global-sync-orchestrator)
   - [Realtime Subscription](#realtime-subscription)
6. [Code Templates](#code-templates)
7. [Supabase Schema Setup](#supabase-schema-setup)
8. [Error Handling & Offline Support](#error-handling--offline-support)
9. [Gotchas & Best Practices](#gotchas--best-practices)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        USER ACTION                           │
│              (Create, Update, Delete record)                 │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              LAYER 1: localStorage (Instant)                 │
│                                                              │
│  • setState() updates React UI immediately                   │
│  • localStorage.setItem() persists to browser                │
│  • window.dispatchEvent() notifies other components          │
│  • User sees the change in < 1ms                             │
└──────────────────┬───────────────────────────────────────────┘
                   │  fire-and-forget (async, non-blocking)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           LAYER 2: Supabase Remote (Persistent)              │
│                                                              │
│  • void syncToSupabase() — non-blocking background push      │
│  • upsert() with onConflict: 'id' for idempotent writes     │
│  • Failures are silently caught — never block UI             │
│  • On next app load, remote data is fetched & merged         │
└──────────────────────────────────────────────────────────────┘
```

---

## Why Dual-Layer?

| Challenge | Single-Layer (Remote Only) | Dual-Layer Solution |
|---|---|---|
| **Offline usage** | ❌ Broken — no network = no data | ✅ Full offline CRUD via localStorage |
| **UI responsiveness** | ❌ Spinner on every action while awaiting API | ✅ Instant — state updates synchronously |
| **Cross-device sync** | ✅ Automatic | ✅ Synced on app boot, tab focus, and realtime |
| **Data loss risk** | ❌ If API fails, action is lost | ✅ localStorage retains data until next sync |
| **PWA compatibility** | ❌ Requires constant connectivity | ✅ Works fully offline as installed PWA |

---

## Core Concepts

### 1. Local-First Writes
Every user action (create, update, delete) writes to `localStorage` **first and synchronously**. React state is updated immediately. The UI never waits for a network response.

### 2. Fire-and-Forget Remote Push
After the local write, a non-blocking `void syncToSupabase()` call pushes the data to the remote database. The `void` keyword explicitly discards the Promise — if it fails, the local state is still intact.

### 3. Mount Hydration (Pull)
When the app boots (or the tab regains focus), a `fetchFromSupabase()` function pulls the latest remote data and **merges** it with whatever is in localStorage, creating a unified truth.

### 4. Realtime Subscription (Live Sync)
Supabase Realtime listens to `postgres_changes` on the `public` schema. When another device writes data, the listener fires the full sync cycle to pull changes into the current device.

### 5. Cross-Tab Notification
`window.dispatchEvent(new Event('store_updated'))` is fired after every local write. Other components can listen for these events to stay in sync without prop drilling.

---

## Data Flow Diagrams

### Write Flow (User creates/edits/deletes a record)

```
User Action
    │
    ├──▶ 1. setState(newData)           ← React UI updates instantly
    ├──▶ 2. localStorage.setItem(data)  ← Browser persistence
    ├──▶ 3. dispatchEvent('updated')    ← Cross-component notification
    └──▶ 4. void syncToSupabase(data)   ← Background remote push (non-blocking)
```

### Read Flow (App boot / Tab focus)

```
App Mounts
    │
    ├──▶ 1. getStoredData()             ← Read from localStorage (instant)
    │       └── setState(localData)     ← UI renders immediately
    │
    └──▶ 2. fetchFromSupabase()         ← Async remote fetch
            └── merge(local, remote)    ← Deduplicate by ID
            └── localStorage.setItem() ← Update local cache
            └── dispatchEvent()         ← Notify components
```

### Realtime Sync Flow (Another device writes data)

```
Device B writes to Supabase
    │
    ▼
Supabase Realtime fires postgres_changes event
    │
    ▼
Device A receives channel notification
    │
    └──▶ syncAllStores()                ← Full fetch + merge cycle
```

---

## Implementation Guide

### Layer 1: Local Storage (Instant)

The local storage layer provides three core functions per data store:

```typescript
// ═══════════════════════════════════════════
// 1. GET — Read from localStorage
// ═══════════════════════════════════════════
export const getStoredItems = (): Item[] => {
  const data = localStorage.getItem('myapp_items');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_ITEMS;  // Fallback to defaults on parse error
    }
  }

  // First-time boot: seed defaults and push to remote
  void syncItemsToSupabase(DEFAULT_ITEMS);
  localStorage.setItem('myapp_items', JSON.stringify(DEFAULT_ITEMS));
  return DEFAULT_ITEMS;
};


// ═══════════════════════════════════════════
// 2. SAVE — Write to localStorage + push remote
// ═══════════════════════════════════════════
export const saveItemsToStorage = (items: Item[]) => {
  // Layer 1: Instant local persistence
  localStorage.setItem('myapp_items', JSON.stringify(items));

  // Cross-component event notification
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('myapp_items_updated'));
  }

  // Layer 2: Non-blocking remote push
  void syncItemsToSupabase(items);
};


// ═══════════════════════════════════════════
// 3. DELETE — Remove locally + delete remote
// ═══════════════════════════════════════════
export const removeItemFromStorage = async (itemId: string) => {
  const current = getStoredItems();
  const updated = current.filter(item => item.id !== itemId);
  localStorage.setItem('myapp_items', JSON.stringify(updated));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('myapp_items_updated'));
  }

  try {
    await deleteSupabaseItem(itemId);
  } catch (error) {
    console.error('Unable to delete item from Supabase', error);
  }
};
```

---

### Layer 2: Supabase Remote (Persistent)

The Supabase layer wraps the Supabase JS client for each table:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


// ═══════════════════════════════════════════
// PUSH: Upsert a single record to Supabase
// ═══════════════════════════════════════════
export async function saveSupabaseItem(item: Item): Promise<void> {
  try {
    const payload = {
      id: item.id,
      name: item.name,
      // ... map to your Supabase column names
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('items')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert failed:', error.message);
    }
  } catch (err) {
    console.warn('Supabase save error', err);
  }
}


// ═══════════════════════════════════════════
// PULL: Fetch all records from Supabase
// ═══════════════════════════════════════════
export async function loadSupabaseItems(): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch failed:', error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    return [];
  }
}


// ═══════════════════════════════════════════
// DELETE: Remove a single record from Supabase
// ═══════════════════════════════════════════
export async function deleteSupabaseItem(id: string): Promise<void> {
  try {
    await supabase.from('items').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete error', err);
  }
}


// ═══════════════════════════════════════════
// BATCH PUSH: Sync all local items to Supabase
// ═══════════════════════════════════════════
export const syncItemsToSupabase = async (items: Item[]) => {
  try {
    for (const item of items) {
      await saveSupabaseItem(item);
    }
  } catch (error) {
    console.error('Unable to sync items to Supabase', error);
  }
};
```

---

### Merge Strategy

The merge function is the **most critical part** of the pattern. It reconciles local and remote data without losing records from either side:

```typescript
export const fetchItemsFromSupabase = async (): Promise<Item[]> => {
  try {
    const remoteItems = await loadSupabaseItems();
    const localItems = getStoredItems();

    // Use a Map keyed by ID for O(1) dedup
    const mergedMap = new Map<string, Item>();

    // 1. Populate with local items first
    localItems.forEach(item => mergedMap.set(item.id, item));

    if (Array.isArray(remoteItems)) {
      const remoteIdSet = new Set<string>();

      // 2. Overlay remote items on top (remote wins for shared fields)
      remoteItems.forEach(remoteItem => {
        remoteIdSet.add(remoteItem.id);
        const localMatch = mergedMap.get(remoteItem.id);

        if (localMatch) {
          // Merge: spread local first, then remote overrides
          mergedMap.set(localMatch.id, {
            ...localMatch,     // local fields as baseline
            ...remoteItem,     // remote fields override
            id: localMatch.id, // preserve local ID format
          });
        } else {
          // New remote record not seen locally
          mergedMap.set(remoteItem.id, remoteItem);
        }
      });

      // 3. OPTIONAL: Purge local-only records deleted on another device
      // Only do this for user-created records, not default/seed data
      for (const [id, item] of mergedMap.entries()) {
        if (item.isCustom && !remoteIdSet.has(id)) {
          mergedMap.delete(id);
        }
      }
    }

    // 4. Persist merged result back to localStorage
    const merged = Array.from(mergedMap.values());
    localStorage.setItem('myapp_items', JSON.stringify(merged));

    // 5. Notify listening components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('myapp_items_updated'));
    }

    return merged;
  } catch (error) {
    console.error('Unable to load items from Supabase', error);
  }

  // Fallback: return local data if remote fails
  return getStoredItems();
};
```

#### Merge Priority Rules

| Scenario | Winner | Rationale |
|---|---|---|
| Field exists in both local and remote | **Remote** | Remote is the cross-device source of truth |
| Record exists only locally | **Kept** | May have been created offline, will sync on next push |
| Record exists only remotely | **Added** | Created from another device |
| Record deleted remotely but exists locally | **Deleted** | Only for user-created (`isCustom`) records |
| Default/seed records | **Always kept** | Never purged even if missing remotely |

---

### Global Sync Orchestrator

A **headless React component** mounted at the app root that manages the full sync lifecycle:

```tsx
// BackendSyncInit.tsx — Mount inside your root <App> component
const BackendSyncInit: React.FC = () => {
  useEffect(() => {
    const syncAllStores = async () => {
      // ── PHASE 1: PULL (Remote → Local) ──
      try {
        await Promise.all([
          fetchClientsFromSupabase(),
          fetchItemsFromSupabase(),
          fetchOrdersFromSupabase(),
          // ... all your data stores
        ]);
      } catch (err) {
        console.warn('Remote sync fetch skipped or deferred', err);
      }

      // ── PHASE 2: PUSH (Local → Remote) ──
      try {
        await syncClientsToSupabase(getStoredClients());
        await syncItemsToSupabase(getStoredItems());
        await syncOrdersToSupabase(getStoredOrders());
        // ... all your data stores
      } catch (err) {
        console.warn('Offline sync push skipped or deferred', err);
      }
    };

    // Initial sync on app mount
    void syncAllStores();

    // ── TRIGGER SYNC ON RECONNECTION EVENTS ──
    const handleSyncTrigger = () => void syncAllStores();

    window.addEventListener('online', handleSyncTrigger);      // Network restored
    window.addEventListener('focus', handleSyncTrigger);        // Tab regains focus
    document.addEventListener('visibilitychange', handleSyncTrigger); // Tab becomes visible

    // ── SUPABASE REALTIME: Live multi-device sync ──
    const unsubscribe = subscribeToRealtimeChanges(() => {
      void syncAllStores();
    });

    return () => {
      window.removeEventListener('online', handleSyncTrigger);
      window.removeEventListener('focus', handleSyncTrigger);
      document.removeEventListener('visibilitychange', handleSyncTrigger);
      unsubscribe();
    };
  }, []);

  return null; // Headless — renders nothing
};
```

**Mount it in your app root:**

```tsx
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BackendSyncInit />   {/* ← Headless sync orchestrator */}
        <Router>
          <Routes>...</Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
```

---

### Realtime Subscription

Supabase Realtime listens to all `postgres_changes` on the `public` schema. When any table is modified by another device, the full sync cycle is triggered:

```typescript
export function subscribeToRealtimeChanges(onDataChange: () => void) {
  const channel = supabase
    .channel('myapp-sync-channel')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      onDataChange();
    })
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}
```

> **Note:** Supabase Realtime requires enabling `Realtime` on each table in the Supabase Dashboard → Database → Replication.

---

## Code Templates

### Complete Data Store Template (Copy-Paste Ready)

For each new data entity in your project, create a file following this template:

```typescript
// data/myEntityData.ts
import { supabase } from '../utils/supabase';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
export interface MyEntity {
  id: string;
  name: string;
  // ... your fields
}

const STORAGE_KEY = 'myapp_entities';
const SUPABASE_TABLE = 'entities';
const UPDATE_EVENT = 'myapp_entities_updated';
const DEFAULT_DATA: MyEntity[] = [];

// ═══════════════════════════════════════════
// LAYER 1: localStorage
// ═══════════════════════════════════════════
export const getStoredEntities = (): MyEntity[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_DATA;
    }
  }
  void syncEntitiesToSupabase(DEFAULT_DATA);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
  return DEFAULT_DATA;
};

export const saveEntitiesToStorage = (entities: MyEntity[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }
  void syncEntitiesToSupabase(entities);
};

// ═══════════════════════════════════════════
// LAYER 2: Supabase
// ═══════════════════════════════════════════
const saveSupabaseEntity = async (entity: MyEntity) => {
  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert({ ...entity, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) console.warn('Supabase upsert failed:', error.message);
  } catch (err) {
    console.warn('Supabase save error', err);
  }
};

const loadSupabaseEntities = async (): Promise<MyEntity[]> => {
  try {
    const { data, error } = await supabase.from(SUPABASE_TABLE).select('*');
    if (error) { console.warn('Supabase fetch failed:', error.message); return []; }
    return data ?? [];
  } catch { return []; }
};

export const syncEntitiesToSupabase = async (entities: MyEntity[]) => {
  try {
    for (const entity of entities) {
      await saveSupabaseEntity(entity);
    }
  } catch (error) {
    console.error('Unable to sync entities to Supabase', error);
  }
};

// ═══════════════════════════════════════════
// MERGE: Fetch remote + merge with local
// ═══════════════════════════════════════════
export const fetchEntitiesFromSupabase = async (): Promise<MyEntity[]> => {
  try {
    const remote = await loadSupabaseEntities();
    const local = getStoredEntities();

    const mergedMap = new Map<string, MyEntity>();
    local.forEach(item => mergedMap.set(item.id, item));

    if (Array.isArray(remote)) {
      remote.forEach(item => {
        const existing = mergedMap.get(item.id);
        mergedMap.set(item.id, { ...existing, ...item });
      });
    }

    const merged = Array.from(mergedMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UPDATE_EVENT));
    }
    return merged;
  } catch (error) {
    console.error('Fetch from Supabase failed', error);
  }
  return getStoredEntities();
};
```

---

### React Context with Dual-Layer Sync (Notifications Example)

```tsx
// context/NotificationContext.tsx
const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ── Layer 1: Initialize from localStorage ──
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('myapp_notifications');
    if (stored) {
      try { return JSON.parse(stored); } catch { return []; }
    }
    return [];
  });

  // ── Persist to localStorage on every change ──
  useEffect(() => {
    localStorage.setItem('myapp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // ── Layer 2: Hydrate from Supabase on mount ──
  useEffect(() => {
    void (async () => {
      try {
        const remote = await getNotificationsFromSupabase();
        if (remote && remote.length > 0) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newItems = remote
              .filter(r => !existingIds.has(r.id))
              .map(r => ({ /* map remote fields to local shape */ }));
            return [...newItems, ...prev]; // Prepend new items
          });
        }
      } catch (err) {
        console.warn('Unable to hydrate from Supabase', err);
      }
    })();
  }, []);

  // ── Write: Instant local + background remote ──
  const addNotification = (title: string, message: string) => {
    const newItem = { id: `notif-${Date.now()}`, title, message, read: false };

    setNotifications(prev => [newItem, ...prev]);           // Layer 1: instant
    void saveNotificationToSupabase(newItem);                // Layer 2: background
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

---

## Supabase Schema Setup

### Example Table (SQL)

```sql
-- Run this in Supabase SQL Editor for each data store

CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to do everything (adjust for your auth model)
CREATE POLICY "Allow all for authenticated users"
  ON public.items FOR ALL
  USING (true)
  WITH CHECK (true);

-- IMPORTANT: Enable Realtime on the table
-- Go to: Supabase Dashboard → Database → Replication → Enable for this table
```

### Notifications Table

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  type TEXT DEFAULT 'system' CHECK (type IN ('request', 'payment', 'workout', 'system', 'client')),
  recipient_role TEXT DEFAULT 'all' CHECK (recipient_role IN ('coach', 'client', 'all')),
  read BOOLEAN DEFAULT FALSE,
  date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON public.notifications FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## Error Handling & Offline Support

### Key Principles

1. **Never block the UI on a network call.** Every Supabase call is wrapped in `try/catch` with `console.warn` — never `throw`.

2. **Use `void` for fire-and-forget.** The `void` keyword explicitly discards the Promise:
   ```typescript
   void syncToSupabase(data);  // Runs in background, errors are swallowed
   ```

3. **Fallback to localStorage on any remote failure:**
   ```typescript
   export const fetchFromSupabase = async () => {
     try {
       const remote = await loadSupabaseItems();
       // ... merge logic
     } catch (error) {
       console.error('Remote fetch failed', error);
     }
     return getStoredItems();  // ← Always returns local data as fallback
   };
   ```

4. **Re-sync on reconnection.** The global orchestrator listens for `online`, `focus`, and `visibilitychange` events to automatically push any offline changes.

### Offline Write → Online Sync Timeline

```
[OFFLINE] User creates record
    └── localStorage.setItem()    ✅ Saved locally
    └── void syncToSupabase()     ❌ Fails silently (no network)

[ONLINE] Network restored → 'online' event fires
    └── syncAllStores()
        └── syncToSupabase(getStoredItems())  ✅ Pushes offline record to Supabase
        └── fetchFromSupabase()               ✅ Pulls any changes from other devices
```

---

## Gotchas & Best Practices

### ⚠️ Common Pitfalls

1. **Don't use `await` on sync calls in event handlers.**
   Use `void syncToSupabase()` — if you `await` it, the UI freezes until the network call resolves (or times out).

2. **Always provide a localStorage fallback in fetch functions.**
   End every `fetchFromSupabase()` with `return getStoredItems()` so the app works even if Supabase is unreachable.

3. **Use `onConflict: 'id'` in upserts.**
   Without this, duplicate records are created every time the same data is pushed:
   ```typescript
   await supabase.from('items').upsert(payload, { onConflict: 'id' });
   ```

4. **Deduplicate by ID during merge.**
   Use a `Map<string, Item>` keyed by `id` to prevent duplicates when combining local and remote data.

5. **Don't purge default/seed data.**
   Only delete local records that are `isCustom` and missing from the remote set. Default records should survive even if they don't exist in Supabase.

6. **Use custom events for cross-component sync.**
   `window.dispatchEvent(new Event('myapp_items_updated'))` lets any component listen for changes without prop drilling or context re-renders:
   ```typescript
   useEffect(() => {
     const handler = () => setItems(getStoredItems());
     window.addEventListener('myapp_items_updated', handler);
     return () => window.removeEventListener('myapp_items_updated', handler);
   }, []);
   ```

### ✅ Checklist for Adding a New Data Store

- [ ] Create the TypeScript interface for your entity
- [ ] Define `STORAGE_KEY`, `SUPABASE_TABLE`, `UPDATE_EVENT` constants
- [ ] Implement `getStoredEntities()` — reads from localStorage
- [ ] Implement `saveEntitiesToStorage()` — writes to localStorage + fires event + `void sync()`
- [ ] Implement `saveSupabaseEntity()` — upserts a single record
- [ ] Implement `loadSupabaseEntities()` — fetches all from Supabase
- [ ] Implement `syncEntitiesToSupabase()` — batch push all records
- [ ] Implement `fetchEntitiesFromSupabase()` — pull + merge + persist
- [ ] Create the Supabase table with RLS policies
- [ ] Enable Realtime replication on the table
- [ ] Add `fetchEntitiesFromSupabase()` and `syncEntitiesToSupabase()` to `BackendSyncInit`
- [ ] Test offline create → go online → verify record appears in Supabase

---

## Summary

The Dual-Layer Sync pattern gives you the best of both worlds: **instant local-first UI** with **persistent cross-device cloud storage**. The pattern is intentionally simple — no complex state machines, no conflict resolution timestamps, no saga orchestration. It trades absolute consistency for pragmatic responsiveness, which is the right tradeoff for most client-side apps.

```
User types → UI updates in 0ms → Background sync happens whenever it can
```

That's the entire philosophy in one line.
