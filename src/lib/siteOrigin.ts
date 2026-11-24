const configuredOrigin =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);

export const siteOrigin = configuredOrigin ? new URL(configuredOrigin).origin : undefined;
