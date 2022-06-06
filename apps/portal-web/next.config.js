/* esslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require("next-compose-plugins");
const withSvgr = require('@newhighsco/next-plugin-svgr')

const analyze = process.env.ANALYZE === 'true';

const { publicRuntimeConfig, serverRuntimeConfig } = require("./config");

/**
 * @type {import("next").NextConfig}
 */
const config = {
  serverRuntimeConfig,
  publicRuntimeConfig,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  compiler: {
    styledComponents: true,
  }
};

module.exports = withPlugins([
  [withSvgr, {
    svgrOptions: {
      // babel: false,
      icon: true,
    }
  }],
  analyze ? [require("@next/bundle-analyzer")()] : undefined,
].filter((x) => x), config);

