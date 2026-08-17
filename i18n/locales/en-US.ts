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
    showcase: {
      label: 'Content',
      boss: {
        title: 'Bosses',
        caption: 'The mod’s bosses and major foes',
      },
      weapons: {
        title: 'Weapons',
        caption: 'Magic, ranged, and melee arms',
      },
      scenes: {
        title: 'Biomes',
        caption: 'Places to explore',
      },
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
