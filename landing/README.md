# Bursit Angular — Landing

Static marketing site for [bursit-angular](../README.md), built with [Astro](https://astro.build).

It ships **zero client-side JavaScript**. Every visual value comes from `bursit-ui-tokens` through CSS custom properties, so the page is a live demonstration of the design system it documents.

## Commands

Run from this directory:

| Command           | Action                         |
| :---------------- | :----------------------------- |
| `npm install`     | Install dependencies           |
| `npm run dev`     | Dev server on `localhost:4321` |
| `npm run build`   | Production build to `dist/`    |
| `npm run preview` | Preview the production build   |

## Structure

```
src/
├── components/   Section components (Nav, Hero, Philosophy, DesignTokens, ...)
├── layouts/      BaseLayout — HTML shell, SEO meta, global styles
├── pages/        index.astro — composes the sections
└── styles/       global.scss — token import, reset, shared design layer
```

## Design tokens

`src/styles/global.scss` begins with a single import:

```scss
@use 'bursit-ui-tokens' as *;
```

That import emits every token layer as CSS custom properties — colors, typography, spacing, radii, shadows, motion and the component tokens. There is no separate token build step here: updating `bursit-ui-tokens` updates this site.

**Never hardcode a visual value.** Colors, spacing, radii, shadows and durations must all come from `var(--token)`.

## Deployment

Target: **Cloudflare Pages**, as a separate project pointing at this repository with `landing` as the root directory.

| Setting       | Value           |
| :------------ | :-------------- |
| Root dir      | `landing`       |
| Build command | `npm run build` |
| Output dir    | `dist`          |

The canonical origin lives in `astro.config.mjs` as the `site` constant. It is the deployed Cloudflare Pages origin (`https://bursit-landing.pages.dev`), and it feeds the canonical tags, the generated sitemap and the Open Graph URLs, so it is the single place to update when a custom domain is attached.
