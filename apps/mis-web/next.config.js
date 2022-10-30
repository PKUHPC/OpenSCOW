/* esslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require("next-compose-plugins");

const analyze = process.env.ANALYZE === "true";

const { buildRuntimeConfig } = require("./config.js");

module.exports = async (phase) => {

  const runtimeConfig = await buildRuntimeConfig(phase);

  /**
   * @type {import("next").NextConfig}
   */
  const config = {
    ...runtimeConfig,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  };

  return withPlugins([
    analyze ? [require("@next/bundle-analyzer")()] : undefined,
  ].filter((x) => x), config)(phase, { defaultConfig: {} });
}

