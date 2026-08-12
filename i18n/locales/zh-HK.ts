import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    'name': '流光無際',
    'description':
      '歡迎來到流光無際的世界！ 流光無際係一個內容豐富嘅模組，擁有絕妙嘅視覺表現，為泰拉人們帶來令人耳目一新的體驗！',
  },
  'meta': {
    'team': '逐夢孤舟製作組',
  },
  'head': {
    'fulltitle': '流光無際 - 泰拉瑞亚模組',
    'fulltitle2': '官方網站',
    'title': '流光無際',
    'subtitles': {
      'news': '新聞',
      'wiki': '百科',
      'docs': '文檔',
      'playground': 'Playground',
      'about': '關於',
    },
  },
  'body': {
    'header': {
      'name': '流光無際',
      'home': '主頁',
      'news': '新聞',
      'wiki': '百科',
      'docs': '文檔',
      'playground': 'Playground',
      'about': '關於',
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
      'Getting Started': '新手入門',
      'Guide': '使用指南',
      'Netcode': '網絡同步',
      'Mechanics': '遊戲機制',
      'Drawcode': '圖形繪製',
      'Templates': '内容模板',
      'Weapons': '武器',
    },
    'empty': {
      'title': '未知領域',
      'description': '此處暫無內容',
    },
  },
} satisfies I18nLocale
