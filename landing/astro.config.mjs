// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Canonical production origin.
 *
 * This is the current canonical origin: the landing is deployed to Cloudflare
 * Pages at this host. It feeds the canonical tags, the sitemap and the Open
 * Graph URLs, so it must be a single source of truth — update it here and
 * nowhere else when a custom domain is attached.
 */
const SITE = 'https://bursit-landing.pages.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  compressHTML: true,
});
