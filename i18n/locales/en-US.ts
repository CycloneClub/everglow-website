import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    name: 'Everglow',
    description:
      'Download Everglow, a visually stunning new adventure for Terraria.',
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
      about: 'Meet Dream Chaser Group, the team behind Everglow, and find contact details, community links, and ways to contribute.',
    },
    subtitles: {
      news: 'News',
      wiki: 'Wiki',
      docs: 'Docs',
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
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      backToMenu: 'Back to main menu',
      name: 'Everglow',
      home: 'Home',
      news: 'News',
      wiki: 'Wiki',
      docs: 'Docs',
      about: 'About',
      settings: {
        languages: {
          'zh-cn': '简体中文',
          'en-us': 'English',
          'zh-hk': '繁体中文',
          'ja-jp': '日本語',
          'ko-kr': '한국어',
          'ru-ru': 'Русский',
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
      description: 'Welcome to Everglow no Sekai! The Everglow Mod is a vast content mod with stunning visuals that creates a new and refreshing experience for Terrarians!',
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
      'Netcode': 'Netcode',
      'Mechanics': 'Mechanics',
      'Drawcode': 'Drawcode',
      'Game Content': 'Game Content',
      'Weapons': 'Weapons',
    },
    'empty': {
      'title': 'Unknown Field',
      'description': 'Here\'s nothing...',
    },
  },
} satisfies I18nLocale
