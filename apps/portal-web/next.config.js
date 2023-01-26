/* esslint-disable @typescript-eslint/no-var-requires */

// @ts-check

const withPlugins = require("next-compose-plugins");

const analyze = process.env.ANALYZE === "true";

const { buildRuntimeConfig } = require("./config.js");

const BASE_PATH = process.env.BASE_PATH || "/";


module.exports = async (phase) => {

  global.__CONFIG__ = {
    BASE_PATH,
  };

  const runtimeConfig = await buildRuntimeConfig(phase, BASE_PATH);

  /**
   * @type {import("next").NextConfig}
   */
  const config = {
    ...runtimeConfig,
    basePath: BASE_PATH || undefined,
    assetPrefix: BASE_PATH || undefined,
    webpack(config, options) {
      config.plugins.forEach((i) => {
        if (i instanceof options.webpack.DefinePlugin) {
          if (i.definitions['process.env.__NEXT_ROUTER_BASEPATH']) {
            i.definitions['process.env.__NEXT_ROUTER_BASEPATH'] =
              '(typeof window === "undefined" ? global : window).__CONFIG__?.BASE_PATH';
          }
        }
      });
      return config;
    },
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
}

