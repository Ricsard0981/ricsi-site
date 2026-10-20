# Ricsi — portfolio

Static site (HTML/CSS/JS), Y2K x Win98 x Minecraft look. Deployed with GitHub Pages.

## Setup
1. Edit `data/config.json` with your handles, YouTube channel ID, Discord invite.
2. Instagram: paste the latest post URL into `data/instagram.json`.
3. Projects: edit `data/projects.json`. About copy: edit `about.html`.
4. Repo Settings → Pages → Source: **GitHub Actions**.
5. The `Update latest content` workflow refreshes `data/latest.json` every 4 hours.

Note: Pages from a *private* repo needs GitHub Pro/Team/Enterprise. The published site is public either way.

## Local preview
`npx serve .`
