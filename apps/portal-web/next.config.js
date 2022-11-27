/* esslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require("next-compose-plugins");

const analyze = process.env.ANALYZE === 'true';

const { buildRuntimeConfig } = require("./config.js");

module.exports = async (phase) => {

  /**
   * @type {import("next").NextConfig}
   */
  const config = {
    ...await buildRuntimeConfig(phase),
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    compiler: {
      styledComponents: true,
    },
    experimental: {
      skipTrailingSlashRedirect: true,
    },
  };

  return withPlugins([
    analyze ? [require("@next/bundle-analyzer")()] : undefined,
  ].filter((x) => x), config)(phase, { defaultConfig: {} });
};
