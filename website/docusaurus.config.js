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
  tagline: 'Generate a type-safe TanStack Query client for React from an OpenAPI Document.',

  // Set the production url of your site here
  url: 'https://openapi-qraft.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/openapi-qraft/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'OpenAPI-Qraft', // Usually your GitHub org/user name.
  projectName: 'openapi-qraft.github.io', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          sidebarPath: './sidebars.js',
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);

            return removeSidebarDocItems(sidebarItems, new Set(['codegen/CLI/openapi']));
          },
          lastVersion: 'current',
          versions: {
            current: {
              label: '2.x',
            },
            '2.14.0': {
              label: '2.14.0',
            },
            '1.x': {
              label: '1.x',
            },
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/OpenAPI-Qraft/openapi-qraft/edit/main/website/',
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
            type: 'docsVersionDropdown',
            position: 'right',
          },
          {
            type: 'docSidebar',
            sidebarId: 'mainDocsSidebar',
            position: 'left',
            label: 'Docs',
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
        copyright: `© ${new Date().getFullYear()} Alex Batalov`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      algolia: {
        appId: 'B42903JOPT',
        apiKey: '68a397ed6b627ba01e722c54228bd79f',
        indexName: 'openapi-qraftio',
      },
    }),
};

function getNpxWithYarnRegExp() {
  return /\bnpx\b/g;
}

function getNpmExecRegExp() {
  return /\bnpm exec (?:-c|--call)\b/g;
}

function removeSidebarDocItems(items, removedDocIds) {
  return items
    .filter((item) => !(item.type === 'doc' && removedDocIds.has(item.id)))
    .map((item) => {
      if (item.type !== 'category') return item;

      return {
        ...item,
        items: removeSidebarDocItems(item.items, removedDocIds),
      };
    });
}

export default config;
