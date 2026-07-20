# Rollback — Seamless V2 Phase 2

**Created:** 2026-07-20  
**Baseline commit:** `b8c42a02135a4890cf83ba88280349f2e60da307`  
**Branch before upgrade:** `main`

## Quick rollback (local)

```bash
git checkout main
git branch -D upgrade/zax-seamless-v2   # optional — only if abandoning work
git reset --hard b8c42a0
```

## Tag (if created locally)

```bash
git tag pre-seamless-v2-b8c42a0 b8c42a0
git checkout pre-seamless-v2-b8c42a0   # detached HEAD at baseline
```

## Pre-existing untracked at upgrade start

These existed before Phase 2 and were committed with audit docs:

- `docs/RESPONSIVE_FIX_PLAN.md`
- `docs/audits/pre-upgrade/*`

## Do not

- Push `upgrade/zax-seamless-v2` to `main` without review
- Connect GitHub Pages demo to production Supabase
- Enable live payments without owner sign-off
