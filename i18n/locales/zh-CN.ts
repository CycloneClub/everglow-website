import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    'name': '流光无际',
    'description':
      '下载流光无际（Everglow），踏入绚丽的泰拉瑞亚新世界。',
  },
  'meta': {
    'team': '逐梦孤舟制作组',
  },
  'head': {
    'fulltitle': '流光无际 - 泰拉瑞亚模组',
    'fulltitle2': '官方网站',
    'title': '流光无际',
    'descriptions': {
      news: '阅读流光无际模组的开发日志、版本动态和内容预览，了解逐梦孤舟制作组的最新进展。',
      docs: '查阅流光无际模组的安装指南、开发文档和代码示例，开始探索与创作。',
      about: '了解流光无际背后的逐梦孤舟制作组，查看团队介绍、联系方式、社区入口和参与方式。',
    },
    'subtitles': {
      'news': '新闻',
      'wiki': '百科',
      'docs': '文档',
      'about': '关于',
    },
  },
  'body': {
    'footer': {
      introduction: '流光无际是 {game} 的扩展模组，本网站为其官方网站。',
      gameCopyright: 'Terraria 及其所有内容的版权归 Re-Logic 所有。',
      copyright: '© {year} 逐梦孤舟制作组',
    },
    'header': {
      'openMenu': '打开菜单',
      'closeMenu': '关闭菜单',
      'backToMenu': '返回主菜单',
      'name': '流光无际',
      'home': '主页',
      'news': '新闻',
      'wiki': '百科',
      'docs': '文档',
      'about': '关于',
      'settings': {
        'languages': {
          'zh-cn': '简体中文',
          'en-us': 'English',
          'zh-hk': '繁体中文',
        },
      },
    },
  },
  'common': {
    'toc': {
      'title': '目录',
    },
  },
  'news': {
    'chevron-text': '更多',
  },
  'home': {
    'hero': {
      'description': '欢迎来到流光无际的世界！流光无际是一个内容丰富的模组，拥有绝妙的视觉表现，为泰拉人们带来令人耳目一新的体验！',
      'getMod': '获取模组',
      'getModDescription': '打开安装教程，在 tModLoader 中订阅游玩',
      'github': 'GitHub',
      'githubDescription': '查看源码、开发版与贡献方式',
      'tmodloader': 'tModLoader',
    },
    'community': {
      'discord': 'Discord',
      'bilibili': '哔哩哔哩',
      'qq': 'QQ 群',
    },
    'news': {
      'more': '更多新闻',
      'placeholderTitle': '半年报 · 即将发布',
      'placeholderDescription': '新的半年报正在整理中。',
    },
    'lore': {
      'eyebrow': '设定',
      'title': '世界观',
      'comingSoon': '即将公开',
    },
  },
  'docs': {
    'label': {
      'Getting Started': '入门',
      'Netcode': '网络同步',
      'Mechanics': '游戏机制',
      'Drawcode': '图形绘制',
      'Game Content': '游戏内容',
      'Weapons': '武器',
    },
    'empty': {
      'title': '未知领域',
      'description': '你来到了一片未知的地带',
    },
  },
} satisfies I18nLocale
