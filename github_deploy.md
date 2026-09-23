# Deploying Rensdle to GitHub Pages

Rensdle is a Vite + React single-page app. A GitHub Actions workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) builds it and publishes it to GitHub Pages on every push to `main`.

Final URL: `https://<your-github-username>.github.io/Rensdle/`

## 1. Create the repository

1. On GitHub, click **New repository**.
2. Name it exactly **`Rensdle`**. The name must match `base` in [vite.config.ts](vite.config.ts); see step 5 if you choose another name.
3. Leave "Add a README", ".gitignore" and "license" unticked, since the project already has them.
4. Choose Public. GitHub Pages on a private repo needs a paid plan.

## 2. Push the code

From the project folder:

```bash
git init            # skip if the folder is already a git repo
git add .
git commit -m "Eerste versie van Rensdle"
git branch -M main
git remote add origin https://github.com/<your-github-username>/Rensdle.git
git push -u origin main
```

`package-lock.json` must be committed, because the workflow runs `npm ci`. `node_modules/`, `dist/` and `inspiration.htm` are excluded via `.gitignore`.

## 3. Enable GitHub Pages

1. In the repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's all. You don't need to pick a branch or folder.

## 4. Deploy and check

1. Open the **Actions** tab. The run "Deploy naar GitHub Pages" should start because of your push. If it doesn't, open the workflow and click **Run workflow**, or push again.
2. When both jobs (`build`, `deploy`) are green, open the URL shown in the `deploy` job, or go back to **Settings → Pages**.
3. Check these routes:
   - `https://<user>.github.io/Rensdle/` opens the first puzzle.
   - `https://<user>.github.io/Rensdle/game/0` opens a puzzle by id.
   - `https://<user>.github.io/Rensdle/game/rens` opens a puzzle by name.

   Deep links work because the build copies `index.html` to `404.html`. GitHub Pages serves that page for unknown paths, and the app's router takes over from there. The browser dev tools will show a 404 status for deep links; that is expected and harmless.

Each later push to `main` redeploys automatically, usually within 1–2 minutes.

## 5. Using a different repo name or a custom domain

- **Other repo name** (e.g. `woordladder`): set `base: '/woordladder/'` in [vite.config.ts](vite.config.ts).
- **User site** (repo named `<user>.github.io`) or **custom domain** (e.g. `rensdle.nl`): set `base: '/'`.
  - For a custom domain, add a file `public/CNAME` whose only content is the domain, e.g. `rensdle.nl`.
  - At your DNS provider, add a `CNAME` record for `www` pointing to `<user>.github.io`. For the apex domain, add `A` records to GitHub's Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
  - Then enter the domain under **Settings → Pages → Custom domain** and tick **Enforce HTTPS** once it's available.

## 6. Adding a puzzle

1. Add a file `puzzles/<name>.json` with the hints. `id` sets the order in the chain: the hint with the lowest `id` goes from the start word to the first answer, and the answer of the hint with the highest `id` is the end word. Gaps are allowed (e.g. `99` for the last hint, so you can insert hints later without renumbering); ids only need to be unique whole numbers ≥ 0. `$prev$` is the word before, `$answer$` is the word you're looking for.
   ```json
   [
     { "id": 0, "hint": "Tegen de $prev$ steek je een $answer$ op", "answer": "PARAPLU" }
   ]
   ```
2. Add an entry to [puzzles.json](puzzles.json) in the repo root (not inside `puzzles/`). Use a new unique `id`, and make `name` match the file name. `about` and `theme` are optional (`null`, or leave them out).
   ```json
   { "id": 1, "start": "WOORD", "name": "mijnpuzzel", "about": null, "theme": null }
   ```
3. Commit and push. The order of the hints is shuffled automatically, the same way every time, based on the puzzle `id`.

If a puzzle file has a mistake (missing file, duplicate ids, empty answer), that puzzle is skipped. The reason is logged in the browser console as `[rensdle] …`.

## 7. Running locally

Requires Node.js 20.19+ or 22.12+ (the CI uses Node 24).

```bash
npm install
npm run dev       # http://localhost:5173/Rensdle/
npm run build     # production build in dist/
npm run preview   # serve the built dist/ locally
```
