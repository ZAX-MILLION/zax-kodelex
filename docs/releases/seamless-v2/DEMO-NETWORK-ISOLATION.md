# Demo network isolation

Public demo builds (`VITE_APP_ENV=demo` / `VITE_DEMO_MODE=true`) must make **zero** calls to Supabase, PayPal, or production APIs.

## Environment behavior

| Mode | Auth UI | Backend clients |
|------|---------|-----------------|
| Public demo | Try Demo / Role Lab only | Offline stub — no `createClient`, no Realtime |
| Local + real Supabase env | Real Sign In | Live Supabase client |
| Local without credentials | Config message + Try Demo | Offline stub |
| Staging / production | Real Sign In | Live Supabase (+ PayPal when enabled) |

## Providers / hooks disabled in demo

| Surface | Guard |
|---------|--------|
| `src/integrations/supabase/client.ts` | Offline stub when `!isSupabaseConfigured` (never constructs placeholder client) |
| `src/hooks/useColorScheme.ts` | Early return — no query / channel |
| `src/hooks/useChildTheme.ts` | Realtime subscription skipped |
| `src/hooks/useInstallationStatus.ts` | Demo treated as installed |
| `src/hooks/useAnalyticsTracking.ts` | `sendBeacon` blocked in demo |
| `src/contexts/AuthContext.tsx` | Skips session restore when offline |
| `src/features/demo/demoAuthPolicy.ts` | Real auth off when `appConfig.isDemo` |

## Local demo data (no network)

- Series / chapters: `src/utils/demoLibraryData.ts`
- Comments: `src/features/demo/data/demoComments.ts` + sessionStorage
- Roles / coins / unlocks: `DemoRoleContext` session state
- Reader settings: `localStorage` key `zax-reader-settings-v2`

## Routes tested (demo)

Homepage, Series, Browse, Series detail, Reader (+ settings / chapter list / comments drawer), Blog, Role Lab, Member / Paid / Buyer / Uploader / Admin sims, Reset Demo.

## Expected Network / Console

- **Allowed:** static assets, Vercel/hosting, same-origin app shell
- **Forbidden:** `*.supabase.co`, PayPal SDK/API, Edge Function payment hosts, Realtime websockets
- **Console:** no `Failed to fetch`, no `placeholder.supabase.co` websocket errors

## Remaining external limitations

- Third-party font CDNs (if any) may still load — unrelated to backend isolation
- Browser extensions can inject noise; verify in a clean profile when auditing
