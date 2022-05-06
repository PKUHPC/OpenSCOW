// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const { join } = require("path");
const { plugin, variables } = require("./plugins/var");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SCOW',
  tagline: 'Super Computing On Web',
  url: variables.DOCS_URL,
  baseUrl: variables.BASE_PATH,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: variables.ORGANIZATION_NAME,
  projectName: variables.PROJECT_NAME,

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: join(variables.REPO_URL, "/edit/main/website/"),
          beforeDefaultRemarkPlugins: [plugin],
        },
        blog: {
          showReadingTime: true,
          editUrl:
            join(variables.REPO_URL, "/edit/main/website/blog/"),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'SCOW',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'common/intro',
            position: 'left',
            sidebarId: "common",
            label: '文档',
          },
          {
            type: 'doc',
            docId: 'portal/intro',
            position: 'left',
            sidebarId: "portal",
            label: '门户系统',
          },
          {
            type: 'doc',
            docId: 'mis/intro',
            position: 'left',
            sidebarId: "mis",
            label: '运营系统',
          },
          { to: join(variables.BASE_PATH, "blog"), label: '博客', position: 'left' },
          {
            href: variables.REPO_URL,
            label: 'Repo',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Intro',
                to: join(variables.BASE_PATH, `docs/common/intro`),
              },
            ],
          },
          {
            title: 'Community',
            items: [
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: join(variables.BASE_PATH, `blog`),
              },
              {
                label: 'Repo',
                href: variables.REPO_URL,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} SCOW, PKUHPC. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
