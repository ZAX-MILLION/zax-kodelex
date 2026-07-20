import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { hasSupabaseCredentials, resolveSupabaseConfig } from './config';

const config = resolveSupabaseConfig();

export const isSupabaseConfigured = hasSupabaseCredentials();

type AnyFn = (...args: unknown[]) => unknown;

/**
 * Offline stub used when Supabase credentials are unavailable (public demo,
 * misconfigured local). Must NEVER call createClient — that opens Realtime WS
 * to placeholder.supabase.co even after disconnect().
 */
function createOfflineDemoClient(): SupabaseClient {
  const closed = { status: 'CLOSED' as const };

  const thenable = (payload: { data: null; error: { message: string; code: string } | null }) => ({
    then(onFulfilled?: (v: typeof payload) => unknown, onRejected?: (e: unknown) => unknown) {
      try {
        return Promise.resolve(payload).then(onFulfilled, onRejected);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    catch(onRejected?: (e: unknown) => unknown) {
      return Promise.resolve(payload).catch(onRejected);
    },
    finally(onFinally?: () => void) {
      return Promise.resolve(payload).finally(onFinally);
    },
  });

  const queryBuilder = (): Record<string, AnyFn> => {
    const self: Record<string, AnyFn> = {};
    const chain = () => self;
    const methods = [
      'select',
      'insert',
      'update',
      'upsert',
      'delete',
      'eq',
      'neq',
      'gt',
      'gte',
      'lt',
      'lte',
      'like',
      'ilike',
      'is',
      'in',
      'contains',
      'containedBy',
      'range',
      'overlaps',
      'filter',
      'match',
      'not',
      'or',
      'order',
      'limit',
      'offset',
      'abortSignal',
      'csv',
      'geojson',
      'explain',
      'returns',
    ];
    for (const m of methods) self[m] = chain;
    self.single = () =>
      thenable({ data: null, error: { message: 'Supabase offline (demo)', code: 'PGRST116' } });
    self.maybeSingle = () => thenable({ data: null, error: null });
    self.throwOnError = chain;
    Object.assign(self, thenable({ data: null, error: null }));
    return self;
  };

  const channelStub = () => {
    const ch: Record<string, AnyFn> = {};
    ch.on = () => ch;
    ch.subscribe = () => closed;
    ch.unsubscribe = () => undefined;
    ch.send = async () => 'ok';
    ch.track = async () => 'ok';
    ch.untrack = async () => 'ok';
    return ch;
  };

  const auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => undefined, id: 'offline', callback: () => undefined } },
    }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: { message: 'Authentication is disabled in this environment', name: 'AuthError', status: 0 },
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: { message: 'Authentication is disabled in this environment', name: 'AuthError', status: 0 },
    }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({
      data: {},
      error: { message: 'Authentication is disabled in this environment', name: 'AuthError', status: 0 },
    }),
    exchangeCodeForSession: async () => ({
      data: { user: null, session: null },
      error: { message: 'Authentication is disabled in this environment', name: 'AuthError', status: 0 },
    }),
  };

  const client = {
    from: () => queryBuilder(),
    rpc: () => queryBuilder(),
    channel: () => channelStub(),
    removeChannel: () => undefined,
    removeAllChannels: () => undefined,
    getChannels: () => [],
    auth,
    realtime: {
      connect: () => undefined,
      disconnect: () => undefined,
      channel: () => channelStub(),
      removeChannel: () => undefined,
      removeAllChannels: () => undefined,
      getChannels: () => [],
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Storage offline (demo)' } }),
        download: async () => ({ data: null, error: { message: 'Storage offline (demo)' } }),
        list: async () => ({ data: [], error: null }),
        remove: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    functions: {
      invoke: async () => ({ data: null, error: { message: 'Functions offline (demo)' } }),
    },
  };

  return client as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(config.url, config.anonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createOfflineDemoClient();

export function createSupabaseClient(url: string, anonKey: string) {
  return createClient(url, anonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/** True when the module exports a live network client (not the offline stub). */
export function isLiveSupabaseClient() {
  return isSupabaseConfigured;
}
