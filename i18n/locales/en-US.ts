import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    name: 'Everglow',
    description:
      'Welcome to Everglow no Sekai! The Everglow Mod is a vast content mod with stunning visuals that creates a new and refreshing experience for Terrarians!',
  },
  'meta': {
    'team': 'Dream Chaser Group',
  },
  'head': {
    fulltitle: 'Everglow - Terraria Mod',
    fulltitle2: 'Official Website',
    title: 'Everglow',
    descriptions: {
      news: 'Read Everglow development logs, release news, and content previews for the latest updates from Dream Chaser Group.',
      docs: 'Explore installation guides, development documentation, and code examples for the Everglow mod.',
      playground: 'Explore real-time 3D scenes and experiment with shaders and graphics development tools in the Everglow Playground.',
      about: 'Meet Dream Chaser Group, the team behind Everglow, and find contact details, community links, and ways to contribute.',
    },
    subtitles: {
      news: 'News',
      wiki: 'Wiki',
      docs: 'Docs',
      playground: 'Playground',
      about: 'About',
    },
  },
  'body': {
    footer: {
      introduction: 'The official website of the Everglow Mod for {game}.',
      gameCopyright: 'Terraria and all its content is copyrighted by Re-Logic.',
      copyright: '© {year} Dream Chaser Group',
    },
    header: {
      name: 'Everglow',
      home: 'Home',
      news: 'News',
      wiki: 'Wiki',
      docs: 'Docs',
      playground: 'Playground',
      about: 'About',
      settings: {
        languages: {
          'zh-cn': '简体中文',
          'en-us': 'English',
          'zh-hk': '繁体中文',
        },
      },
    },
  },
  'common': {
    'toc': {
      'title': 'Table of Contents',
    },
  },
  'news': {
    'chevron-text': 'Read More',
  },
  'home': {
    hero: {
      getMod: 'Get the mod',
      getModDescription: 'Open the install guide and subscribe in tModLoader',
      github: 'GitHub',
      githubDescription: 'Source code, dev builds, and how to contribute',
      tmodloader: 'tModLoader',
    },
    community: {
      discord: 'Discord',
      bilibili: 'Bilibili',
      qq: 'QQ group',
    },
    news: {
      more: 'More news',
      placeholderTitle: 'Semiannual report · Coming soon',
      placeholderDescription: 'A new report is being prepared.',
    },
    lore: {
      eyebrow: 'Lore',
      title: 'The world',
      comingSoon: 'Coming soon',
    },
  },
  'docs': {
    'label': {
      'Getting Started': 'Get-Started',
      'Guide': 'Guide',
      'Netcode': 'Netcode',
      'Mechanics': 'Mechanics',
      'Drawcode': 'Drawcode',
      'Templates': 'Templates',
      'Weapons': 'Weapons',
    },
    'empty': {
      'title': 'Unknown Field',
      'description': 'Here\'s nothing...',
    },
  },
} satisfies I18nLocale
