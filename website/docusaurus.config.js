// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';
import npmToYarn from 'npm-to-yarn';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OpenAPI Qraft',
  tagline: 'Generate a Strictly-typed typed OpenAPI client for your React app, powered by TanStack Query.',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/OpenAPI-Qraft/openapi-qraft/website/',
          remarkPlugins: [
            [
              require('@docusaurus/remark-plugin-npm2yarn'),
              {
                sync: true,
                converters: [
                  [
                    'yarn',
                    (code) => {
                      if (code.match(getNpxWithYarnRegExp())) return code.replace(getNpxWithYarnRegExp(), 'yarn exec');
                      if (code.match(getNpmExecRegExp())) return code.replace(getNpmExecRegExp(), 'yarn exec');
                      return npmToYarn(code, 'yarn');
                    },
                  ],
                  [
                    'pnpm',
                    (code) => {
                      if (code.match(getNpxWithYarnRegExp())) return code.replace(getNpxWithYarnRegExp(), 'pnpm exec');
                      if (code.match(getNpmExecRegExp())) return code.replace(getNpmExecRegExp(), 'pnpm exec');
                      return npmToYarn(code, 'pnpm');
                    },
                  ],
                ],
              },
            ],
          ],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      navbar: {
        title: 'OpenAPI Qraft',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          {
            href: 'https://github.com/OpenAPI-Qraft/openapi-qraft',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `© ${new Date().getFullYear()} Alexandr Batalov`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

function getNpxWithYarnRegExp() {
  return /\bnpx\b/g;
}

function getNpmExecRegExp() {
  return /\bnpm exec (?:-c|--call)\b/g;
}

export default config;
