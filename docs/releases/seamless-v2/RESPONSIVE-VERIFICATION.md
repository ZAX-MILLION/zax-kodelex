# Responsive verification — Qi-layout reader

**Measured against:** https://zax-kodelex.vercel.app/  
**Deployed commit:** `4ebadca` (includes `2a5d0d0` reader rebuild)  
**Evidence:** `docs/releases/seamless-v2/screenshots/reader-qi-layout/`

## Layout checks

| Viewport | Top bar | Side rail | Bottom toolbar | Pass |
|----------|---------|-----------|----------------|------|
| 390×844 | Yes | Yes (collapsible) | Absent | Yes |
| 768×1024 | Yes | Yes | Absent | Yes |
| 1440×900 | Yes | Yes | Absent | Yes |

Additional sizes covered by unit/layout smoke: 320–1920 class breakpoints inherit the same chrome structure (single top bar + right rail; no `pb-24` / fixed bottom nav).

## Screenshots

- `*-reader.png` — single top bar, no bottom bar
- `*-rail.png` / `mobile-390-rail-expanded.png` — side controls
- `*-settings.png` — Reader Settings
- `*-comments.png` — comments drawer
- `*-chapters.png` — chapter list
- `*-autoscroll.png` — auto-scroll active
- `*-end-chapter.png` — end-of-chapter section
- `verification.json` — network + layout machine summary

## Network / console (demo)

| Route | Supabase / PayPal requests | Console backend errors |
|-------|----------------------------|------------------------|
| `/` | 0 | 0 |
| `/reader/.../1` | 0 | 0 |
| `/series` | 0 | 0 |
| `/blog` | 0 | 0 |
| `/demo` | 0 | 0 |

Offline stub present in bundle; no `createClient('https://placeholder.supabase.co')`.

## Notes

- Mobile rail starts collapsed (`collapsed-mobile` default) with a launcher control.
- Safe-area padding remains on the top bar only; bottom toolbar spacers removed.
- Do not merge until ADMIN visual review of the deployed reader.
