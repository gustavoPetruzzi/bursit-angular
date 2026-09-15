// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Canonical production URL.
 *
 * This is a placeholder until the final domain is registered. It feeds the
 * canonical tags, the sitemap and the Open Graph URLs, so it must be a single
 * source of truth — update it here and nowhere else.
 */
const SITE = 'https://bursit.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  compressHTML: true,
});
