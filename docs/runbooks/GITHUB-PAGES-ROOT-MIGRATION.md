# GitHub Pages root URL migration

**Goal public URL:** `https://zax-million.github.io/`  
**Current project URL:** `https://zax-million.github.io/zax-kodelex/`

## Recommendation

**Preferred: Option 2 — keep `zax-kodelex` as the source repository and create a separate user-site repo `ZAX-MILLION.github.io`.**

Why:

- Preserves this repository name, PR history, and branding as the product codebase
- Avoids renaming mid-PR and breaking clone URLs already shared
- Lets you publish the root site only when you approve
- Keeps rollback of the project-site demo independent

**Option 1 (rename `zax-kodelex` → `ZAX-MILLION.github.io`)** is simpler operationally but renames the public source repo and can confuse existing links. Use only if you want one repository for both code and the user site.

## Do not do yet

Repository create/rename/transfer requires **explicit ADMIN approval**. This document only prepares the app and explains the switch.

## App support already in place

Vite uses `process.env.VITE_BASE || '/'`.

| Hosting style | Build env |
|---------------|-----------|
| User site root `https://zax-million.github.io/` | `VITE_BASE=/` |
| Project site `…/zax-kodelex/` | `VITE_BASE=/zax-kodelex/` |

## Owner steps for Option 2 (when approved)

1. Create empty public repository `ZAX-MILLION.github.io`
2. Push the built site (or wire the same workflow with `VITE_BASE=/`)
3. Enable GitHub Pages from that repository (workflow or `main` / docs)
4. Keep `zax-kodelex` Pages as-is until you confirm the root URL
5. Update README demo link to `https://zax-million.github.io/`
6. Optionally retire the project-site Pages deployment later

## Owner steps for Option 1 (when approved)

1. Rename repository to `ZAX-MILLION.github.io` in GitHub Settings
2. Set workflow `VITE_BASE=/`
3. Confirm Pages publishes at the account root
4. Update remotes and README clone URL

## Expected note

`https://zax-million.github.io/` returns 404 until a **user/organization site** repository exists and publishes. That is normal for a project-only Pages setup.
