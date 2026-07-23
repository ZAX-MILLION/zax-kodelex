# Supabase dashboard settings (external)

These cannot be changed from the repo. Owner must apply in Supabase Dashboard.

## 1. Leaked-password protection

1. Open project → Authentication → Providers / Security  
2. Enable **Leaked password protection** (Have I Been Pwned check)  
3. Save

## 2. OTP expiry

1. Authentication → Email / Phone OTP  
2. Set OTP expiry to a short window (recommended ≤ 10 minutes)  
3. Save

## 3. Redirect allowlist

1. Authentication → URL Configuration  
2. Site URL = production SPA origin (e.g. `https://your-domain.com`)  
3. Redirect URLs allowlist must include only:
   - Production origin + `/reset-password`
   - Staging origin + `/reset-password`
   - Localhost for development if needed  
4. Do **not** add the public GitHub Pages demo origin for password reset if demo has no auth

## 4. Site URL

Set Site URL to the real production host powered by `VITE_SITE_URL`, not `zax-million.github.io/zax-kodelex`.
