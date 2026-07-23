# Rollback — Seamless V2

**Baseline tag:** `pre-seamless-v2-b8c42a0` (commit `b8c42a0` on `main`)

## Restore the pre-upgrade application state

```bash
git checkout main
git reset --hard pre-seamless-v2-b8c42a0
```

Or inspect without moving `main`:

```bash
git checkout pre-seamless-v2-b8c42a0
```

## Notes

- Do not force-push `main` unless you intentionally want to rewrite the default branch.
- GitHub Pages deploys from `main`; restoring the baseline and pushing `main` republishes the previous demo.
- Keep tag `pre-seamless-v2-b8c42a0` for rollback.
