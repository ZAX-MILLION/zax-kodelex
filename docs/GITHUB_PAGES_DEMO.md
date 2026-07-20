# Public demo on GitHub Pages

Yes — people can try a **demo website** for free using GitHub Pages (a free hosting feature on GitHub).

## What you get

A public link like:

`https://zax-million.github.io/zax-kodelex/`

It runs in **demo mode** (library UI + covers, no chapter page artwork).

## One-time setup (you do this in GitHub)

1. Open the repo → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Wait for the workflow **Deploy demo to GitHub Pages** to finish (Actions tab)

After that, every push to `main` refreshes the demo.

## Notes

- This is a **front-end demo**, not a full live product with your real database/payments.
- For a real production site, use a host like Vercel/Netlify + Supabase.
- MIT license covers the code; people still must not use it for piracy.
