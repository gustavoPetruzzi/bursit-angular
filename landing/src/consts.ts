/**
 * Absolute URL of the Storybook deployment.
 *
 * Storybook runs as its own Cloudflare Pages project on a separate host, so
 * this must stay absolute — a root-relative path like `/storybook/` would
 * resolve against this site and 404.
 */
export const STORYBOOK_URL = 'https://bursit-angular.pages.dev';
