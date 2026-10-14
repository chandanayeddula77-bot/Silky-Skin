# Silky Beauty Enterprise — Glass UI Website

A responsive React + Vite prototype for an India-focused skincare education brand. The visual style is inspired by macOS glassmorphism: translucent frosted panels, soft gradients, gentle borders, and a premium blush / pearl / lilac palette.

## Features in this demo

- Login screen appears first; demo sign-in works with the sample credentials below.
- Interactive skin profile questionnaire with skin type, concern, hydration, environment, skin tone, and fragrance preference.
- Different rule-based routines for dry, oily, combination, sensitive, dehydrated, and selected concern profiles.
- Optional JPG, PNG, or WebP image preview; images are compressed locally in the browser and never uploaded.
- Sample product catalogue with search and filters. Product art is generated locally with CSS to avoid broken image URLs.
- Morning/evening routine, ingredient notes, printable routine (use browser Print → Save as PDF), TXT download, share/copy fallback.
- Temporary notes and routine checklist.
- Contact demo form with no fake sending claim.
- Clear My Data and logout controls.
- Responsive mobile navigation and GitHub Pages workflow.

## Demo login

- **Email:** `demo@silkybeauty.in`
- **Password:** `SilkyDemo123`

This is a front-end demo gate, not real authentication. Do not use real passwords.

## Run locally

1. Install Node.js 20 or later.
2. Open this folder in a terminal.
3. Install packages:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the local URL printed in the terminal.
6. Test the production build:
   ```bash
   npm run build
   npm run preview
   ```

## Publish with GitHub Desktop and GitHub Pages

1. Copy the **contents** of this project folder into your GitHub repository root (the `package.json`, `index.html`, `src/`, `public/`, `.github/`, etc.).
2. Open GitHub Desktop and commit the changed files to your default branch (`main` or `master`).
3. Click **Push origin**.
4. On GitHub, open your repository → **Settings → Pages**.
5. Under **Build and deployment**, choose **GitHub Actions** as the source.
6. Open the **Actions** tab and wait for `Deploy Silky Beauty to GitHub Pages` to finish with a green check.
7. Open Settings → Pages → **Visit site**.

The Vite config detects the repository name from `GITHUB_REPOSITORY` in GitHub Actions and sets the correct `/repository-name/` base path for project sites. For a repository named `username.github.io`, it uses `/`.

## Privacy and demo limitations

- Answers, notes, tasks, and the optional photo preview are held in in-page state only; no questionnaire data or image is uploaded to a server or saved to a database/localStorage. Logging out or refreshing clears the temporary page state.
- The sample login is not secure authentication and must not be used for real customer accounts.
- Product brands are independent third parties. This prototype does not claim to stock, manufacture, or have partnerships with them. Product images are illustrative CSS artwork, not actual pack photography. Prices are not invented; the UI says to check current price.
- The contact form is a demo-only submission and does not send or store messages because GitHub Pages is static hosting.
- Routine suggestions are cosmetic education, not diagnosis or medical advice. Patch-test new products. Seek a qualified dermatologist for persistent irritation, severe acne, rashes, or other medical concerns.
- Google Fonts are requested from Google when network access is available; system font fallbacks are provided.

## Project structure

```text
silky-beauty-final/
├── .github/workflows/pages.yml
├── public/assets/favicon.svg
├── src/App.jsx
├── src/main.jsx
├── src/styles.css
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```
