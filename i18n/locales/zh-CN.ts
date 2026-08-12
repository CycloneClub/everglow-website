import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    'name': '流光无际',
    'description':
      '欢迎来到流光无际的世界！流光无际是一个内容丰富的模组，拥有绝妙的视觉表现，为泰拉人们带来令人耳目一新的体验！',
  },
  'meta': {
    'team': '逐梦孤舟制作组',
  },
  'head': {
    'fulltitle': '流光无际 - 泰拉瑞亚模组',
    'fulltitle2': '官方网站',
    'title': '流光无际',
    'subtitles': {
      'news': '新闻',
      'wiki': '百科',
      'docs': '文档',
      'playground': 'Playground',
      'about': '关于',
    },
  },
  'body': {
    'header': {
      'name': '流光无际',
      'home': '主页',
      'news': '新闻',
      'wiki': '百科',
      'docs': '文档',
      'playground': 'Playground',
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
  'docs': {
    'label': {
      'Getting Started': '入门',
      'Guide': '指南',
      'Netcode': '网络同步',
      'Mechanics': '游戏机制',
      'Drawcode': '图形绘制',
      'Templates': '内容模板',
      'Weapons': '武器',
    },
    'empty': {
      'title': '未知领域',
      'description': '你来到了一片未知的地带',
    },
  },
} satisfies I18nLocale
