# Contributor history cleanup (cursoragent)

**Status:** Informational only. Do **not** rewrite `main` without explicit ADMIN approval.

## Why `cursoragent` appears on GitHub

GitHub’s Contributors graph includes anyone listed as:

- commit **author**
- commit **committer**
- `Co-authored-by:` trailer

### Findings on `main` (do not rewrite yet)

| Kind | Detail |
|------|--------|
| Author + committer | Commit `bdd7482` — *Zax Million v1.0.0 — premium manga reading platform* — Author/Committer: `Cursor Agent <cursoragent@cursor.com>` (also co-authored DEVMAX01) |
| Co-author trailers | At least **7** commits on `main` include `Co-authored-by: Cursor <cursoragent@cursor.com>` while the primary author is ZAX-MILLION |
| Emails seen on `main` | `cursoragent@cursor.com`, `ZAXMIllion@proton.me`, `ZAX-MILLION@users.noreply.github.com` |

Feature-branch work on `upgrade/zax-seamless-v2` is authored as **ZAX-MILLION \<ZAXMIllion@proton.me\>** and does **not** remove historical `main` attribution. Cleaning files and future commits alone will **not** remove `cursoragent` from the public Contributors list while those `main` commits remain.

GitHub may also **cache** contributor stats for hours or days after history changes.

### Lovable note

A historical commit on `main` (*Switch to MIT, replace Lovable favicon…*) documents removal of Lovable branding from the product. Current branch files were searched; no active Lovable product attribution remains in source/docs for this presentation upgrade.

---

## Options (ADMIN chooses)

### Option A — Leave historical contributors (recommended default)

- Keep `main` history as-is.
- Continue shipping as ZAX-MILLION only going forward.
- Accept that `cursoragent` remains visible on the Contributors graph.

**Risk:** Low.  
**Effort:** None.

### Option B — Rewrite affected public commits and force-push `main`

Use an interactive history rewrite (filter-repo / rebase) to:

1. Re-author `bdd7482` as ZAX-MILLION.
2. Strip `Co-authored-by: Cursor …` trailers from listed commits.
3. Force-push `main` (and recreate any tags that pointed at old SHAs).

**Risks:**

- All commit hashes on rewritten history change.
- Open PR links, issue commit references, and CI caches break or confuse.
- Every local clone must reset/re-clone.
- Tags and release assets tied to old SHAs must be recreated.
- Deployment “last commit” references change.
- GitHub contributor UI may lag after the rewrite.

**Requires:** Explicit ADMIN written approval before any force-push to `main`.

### Option C — New clean root repository later

Create a fresh public repo with a squashed import of the intended tree under ZAX-MILLION only, then migrate Pages/domain.

**Risks:** New URL or transfer work; stars/issues/history do not carry over cleanly unless migrated carefully.

**Requires:** ADMIN planning for redirects, Pages, and communication.

---

## Safe process if ADMIN picks Option B

1. Freeze merges to `main`.
2. Backup: `git clone --mirror` the remote.
3. Rewrite on a throwaway branch; verify build + demo.
4. Force-push `main` only after ADMIN sign-off.
5. Recreate tags/releases pointing at new SHAs.
6. Notify any collaborators to re-clone or hard-reset.
7. Wait for GitHub contributor cache to refresh; re-check the Contributors tab.

Until then: **no main-history rewrite.**
