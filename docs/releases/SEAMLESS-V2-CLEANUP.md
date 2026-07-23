# Seamless V2 cleanup notes

## Removed from the public upgrade branch

- Pre-upgrade investigation worksheets and command logs under `docs/audits/`
- Internal phase scratch reports that duplicated the release notes
- Build log scratch files

## Kept

- Release notes, verification JSON, security evidence, screenshots
- Payment, Supabase, rollback, and GitHub Pages runbooks
- Legal policies and architecture overview

## Why mass deletion of application code was avoided

Dynamic imports and theme overrides make “unused file” guesses risky without staging coverage. Application cleanup remains incremental.
