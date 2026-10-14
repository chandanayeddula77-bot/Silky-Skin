# Silky Beauty Enterprise

A mobile-responsive skincare guidance website prototype with a premium champagne-gold, rose-pink and ivory design.

## Quick start

This is a static website: no Node.js, package install, build command or API key is needed.

- Open `index.html` in a browser, **or**
- Run a local server from this folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish on GitHub Pages

1. Create a new public GitHub repository, for example `silky-beauty-enterprise`.
2. Extract the ZIP file and upload the **contents** of the `silky-beauty-github` folder to the repository root. The root must contain `index.html`, `styles.css`, `app.js`, `assets/`, and `.github/`.
3. Commit the files to the `main` branch.
4. Open **Settings → Pages** in the repository.
5. Under **Build and deployment**, choose **GitHub Actions** as the source. The included workflow publishes the static site.
6. Open the **Actions** tab and wait for the “Deploy static site to GitHub Pages” workflow to finish successfully.
7. Open the Pages URL shown in Settings → Pages. It usually looks like `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

If using a repository named `YOUR-USERNAME.github.io`, the URL is `https://YOUR-USERNAME.github.io/`.

## Included features

- Responsive landing page, skin-type guide, hydration guide, FAQ and sample product catalogue
- Multi-step assessment with progress, draft save, optional consent-gated image preview and client-side image compression
- Rule-based skincare suggestions and AM/PM routine
- Browser-local customer dashboard, assessment history, favourites, notes and task management
- Share/copy summary fallback and downloadable text report
- Contact form saved locally in the browser
- Demo admin console with product add/edit/archive, landing copy editor, enquiry review, analytics and CSV export
- Local demo data export and reset

## Prototype limitations — read before production

- Data is stored in the current browser's `localStorage`; it does not sync across devices.
- Demo login is not secure authentication. The admin view is not protected by server-side role-based authorization.
- Photo selection is optional and uses a temporary browser preview only. No image is uploaded to cloud storage.
- Report downloads as TXT, not PDF.
- Contact form submissions stay in browser storage; no email is sent.
- Catalogue details and prices are illustrative demo data. Product packaging imagery is CSS-generated placeholder art, not product photography. Verify products, pricing, ingredients, links and image usage rights before launch.
- No database, Supabase, payment gateway, AI API, real email service or production authentication is connected.

## Production checklist

Before accepting real customers or sensitive data, add secure authentication, server-side authorization, database persistence, private object storage with access policies, privacy and consent flows, real verified catalogue data and authorized imagery, true PDF generation, email delivery, backups, monitoring and security testing. Never rely on client-side demo roles for admin security.

## Brand

**Silky Beauty Enterprise**  
Regards: **Chandana Sree Yeddula**  
Currency: INR (₹) · Market: India
