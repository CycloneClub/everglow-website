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
    subtitles: {
      news: 'News',
      wiki: 'Wiki',
      docs: 'Docs',
      playground: 'Playground',
      about: 'About',
    },
  },
  'body': {
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
