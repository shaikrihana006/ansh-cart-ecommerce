# ANSH CART — GitHub Pages Deployment Guide

If you see a blank white page on GitHub Pages, it is because GitHub Pages by default tries to serve the uncompiled source code (`main` branch root with `/src/main.tsx`), which browsers cannot execute.

To display the built application on GitHub Pages, use either **Method 1 (Automatic via GitHub Actions)** or **Method 2 (Command Line via gh-pages)**.

---

## Method 1: GitHub Actions (Recommended — Zero Command Line)

This repository includes `.github/workflows/deploy.yml` which automatically builds and publishes the production bundle.

1. Push your code to GitHub on the `main` branch.
2. In your GitHub repository, click **Settings** (top menu bar).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - Change **Source** from `Deploy from a branch` to **`GitHub Actions`**.
5. Click **Save**.
6. Go to the **Actions** tab at the top of your repository to watch the deployment run.
7. Once finished (about 1 minute), your website will be live at:
   `https://<your-username>.github.io/<repo-name>/`

---

## Method 2: Command Line (Using gh-pages)

If you prefer deploying via your terminal:

1. In your local project terminal, run:
   ```bash
   npm run deploy
   ```
   *(This builds `dist/` and pushes the compiled files to a new branch named `gh-pages`)*.

2. In your GitHub repository, navigate to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: select **`gh-pages`** (NOT `main`!)
   - Folder: **`/ (root)`**
4. Click **Save**.

---

## Why does a blank white page happen on Vite projects?

1. **Uncompiled TypeScript / JSX**: The source `index.html` file references `<script type="module" src="/src/main.tsx"></script>`. Browsers cannot run `.tsx` files directly without building them into JavaScript first (`dist/assets/*.js`).
2. **Missing `dist/`**: The `dist/` folder is in `.gitignore`, so it is not in the `main` branch. GitHub Pages must build `dist/` using GitHub Actions or serve from the `gh-pages` branch.
3. **Subfolder Paths**: GitHub repositories are hosted at `https://<username>.github.io/<repo-name>/`. We have already configured `base: './'` in `vite.config.ts` so all assets load correctly regardless of repository name.
