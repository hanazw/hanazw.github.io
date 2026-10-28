# hana-site

A bilingual personal website built with Astro, TypeScript, Tailwind CSS, and native WebGL2.

## Local development

Use Node.js 24 for local development, matching the GitHub Actions build.

```sh
npm ci
npm run dev
```

The default development URL is `http://localhost:4321`. The English homepage is at `/en/`, and the Chinese homepage is at `/zh/`.

| Command           | Purpose                                           |
|-------------------|---------------------------------------------------|
| `npm run check`   | Run Astro and TypeScript checks                   |
| `npm run build`   | Run checks and build the static site into `dist/` |
| `npm run preview` | Preview the production build locally              |

## Deployment (GitHub Pages)

The site is configured for [https://hanazw.github.io](https://hanazw.github.io), using the `hanazw/hanazw.github.io` repository. Deployment uses the domain root, so no repository-name `base` prefix is needed in `astro.config.mjs`.

When ready to publish:

1. Prepare the GitHub repository and connect this local repository to it.
2. In the repository's **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. Commit the source, `package-lock.json`, and `.github/workflows/deploy.yml`, then push to `main`.
4. Check the **Deploy to GitHub Pages** run in the **Actions** tab for the build and deployment result.

The workflow runs on pushes to `main` and can also be started manually with **Run workflow**. It uses Node.js 24, installs dependencies with `npm ci`, runs `npm run build` (including Astro and TypeScript checks), and uploads `dist/` as the Pages artifact. Deployment runs only after the build succeeds.

Build output stays out of Git; no separate branch of generated files is needed. The workflow uses GitHub's built-in token, with Pages deployment permissions limited to the deploy job. This setup does not require a custom domain or a `CNAME` file.

The root URL opens the English homepage at `/en/`; the Chinese homepage is at `/zh/`. Resume links continue to open the language-specific PDFs hosted on COS.

Official references: [Astro on GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) and [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Source and content

- `src/pages/`: Pages and bilingual routes.
- `src/components/`, `src/layouts/`: Shared components, page layouts, and reading layouts.
- `src/content/blog/`, `src/content/projects/`: Markdown content, with field validation defined in `src/content/schema.ts`.
- `src/lib/content.ts`: Content queries, translation matching, featured selections, and project ordering.
- `src/i18n/`: Language configuration, interface copy, and tag translations. English and Chinese copy are maintained separately.
- `src/styles/`: Global, font, and article styles. Self-hosted fonts and their licenses are in `public/fonts/`.
- `src/scripts/`, `src/shaders/`: Navigation, reading interactions, and the Hero WebGL effect.

Translations are explicitly linked through a shared `translation_key`. Detail pages are generated only for published language versions.
