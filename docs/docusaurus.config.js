// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const { join } = require("path");
const { plugin, variables } = require("./plugins/var");


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "SCOW",
  tagline: "Super Computing On Web",
  url: variables.DOCS_URL,
  baseUrl: variables.BASE_PATH,
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: variables.ORGANIZATION_NAME,
  projectName: variables.PROJECT_NAME,
  trailingSlash: false,

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: join(variables.REPO_URL, "/edit/main/website/"),
          beforeDefaultRemarkPlugins: [plugin],
        },
        blog: {
          showReadingTime: true,
          editUrl: join(variables.REPO_URL, "/edit/main/website/blog/"),
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "",
        logo: {
          alt: "SCOW Logo",
          src: "img/logo.svg",
          srcDark: "img/logo_dark.svg",
        },
        items: [
          {
            type: "doc",
            docId: "info/index",
            position: "left",
            sidebarId: "info",
            label: "功能介绍",
          },
          {
            type: "doc",
            docId: "deploy/index",
            position: "left",
            sidebarId: "deploy",
            label: "部署和配置",
          },
          {
            type: "doc",
            docId: "integration/index",
            position: "left",
            sidebarId: "deploy",
            label: "与SCOW集成",
          },
          {
            type: "doc",
            docId: "hpccluster/index",
            position: "left",
            sidebarId: "hpccluster",
            label: "slurm集群部署实践",
          },
          {
            type: "doc",
            docId: "guide/index",
            position: "left",
            sidebarId: "guide",
            label: "使用文档",
          },
          {
            type: "doc",
            docId: "contribution/index",
            position: "left",
            sidebarId: "contribution",
            label: "贡献指南",
          },
          {
            type: "doc",
            docId: "refs/index",
            position: "left",
            sidebarId: "refs",
            label: "配置参考",
          },
          {
            to: "blog",
            label: "博客",
            position: "left",
          },
          {
            href: variables.REPO_URL,
            label: "Repo",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Intro",
                to: `docs/info`,
              },
            ],
          },
          {
            title: "Community",
            items: [],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: `blog`,
              },
              {
                label: "Repo",
                href: variables.REPO_URL,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 北京大学计算与数字经济研究院. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
