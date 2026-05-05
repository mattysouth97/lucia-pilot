# public/

Static assets served from the site root by Vite.

## Required files

| File | Used by | Notes |
|---|---|---|
| `hero-solar.jpg` | `src/sections/Hero.tsx` | Solar-panel close-up photo, ~2000×1333+ recommended (the hero card crops with `center/cover`). If missing, the hero falls back to a `#1F2937` solid background — not broken, just unbranded. |

## Adding the hero photo

1. Drop the JPEG into this folder named exactly `hero-solar.jpg`.
2. Vite's HMR picks it up immediately — refresh `http://localhost:3002` to see it.
3. Commit it with `git add apps/lucia-energy/public/hero-solar.jpg` (binary asset, won't merge cleanly so prefer a single source of truth).

## Adding more photos later

For section cards (e.g. MultiAssetDER asset cards, PublicCitizen pillars), name them descriptively:
- `asset-pv.jpg`, `asset-ess.jpg`, `asset-ev.jpg` for the 6 asset types
- `case-yeonggwang.jpg` for the 영광군 햇빛연금 reference

Reference them from JSX as `/asset-pv.jpg`, etc. — Vite serves `public/` from the URL root in both dev and production.
