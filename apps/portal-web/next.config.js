/* esslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require("next-compose-plugins");
const withSvgr = require('@newhighsco/next-plugin-svgr')

const analyze = process.env.ANALYZE === 'true';

const { buildRuntimeConfig } = require("./config.js");

module.exports = async (phase, { defaultConfig }) => {

  /**
   * @type {import("next").NextConfig}
   */
  const config = {
    ...await buildRuntimeConfig(phase),
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    compiler: {
      styledComponents: true,
    }
  };

  return withPlugins([
    [withSvgr, {
      svgrOptions: {
        // babel: false,
        icon: true,
      }
    }],
    analyze ? [require("@next/bundle-analyzer")()] : undefined,
  ].filter((x) => x), config)(phase, { defaultConfig });
};
