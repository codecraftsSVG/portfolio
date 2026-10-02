# S. Vamshidhar Goud — Portfolio

A static Next.js portfolio highlighting GenAI and agentic AI engineering work.

## Local development

```powershell
npm ci
npm run dev
```

Open http://localhost:3000.

## GitHub Pages

The repository is configured to publish at `https://codecraftsSVG.github.io/portfolio/` using GitHub Actions. Push to `main`, then enable **Settings → Pages → Build and deployment → GitHub Actions** in the repository if it is not already enabled.

The deployment workflow builds a static export with the `/portfolio` base path. To test the production export locally in PowerShell:

```powershell
$env:GITHUB_PAGES = "true"
npm run build
```

