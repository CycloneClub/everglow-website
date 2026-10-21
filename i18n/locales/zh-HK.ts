import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    'name': '流光無際',
    'description':
      '下載流光無際（Everglow），踏入絢麗的泰拉瑞亞新世界。',
  },
  'meta': {
    'team': '逐夢孤舟製作組',
  },
  'head': {
    'fulltitle': '流光無際 - 泰拉瑞亚模組',
    'fulltitle2': '官方網站',
    'title': '流光無際',
    'descriptions': {
      news: '閱讀流光無際模組的開發日誌、版本動態與內容預覽，了解逐夢孤舟製作組的最新進展。',
      docs: '查閱流光無際模組的安裝指南、開發文件與程式碼範例，開始探索與創作。',
      about: '了解流光無際背後的逐夢孤舟製作組，查看團隊介紹、聯絡方式、社群入口與參與方式。',
    },
    'subtitles': {
      'news': '新聞',
      'wiki': '百科',
      'docs': '文檔',
      'about': '關於',
    },
  },
  'body': {
    'footer': {
      introduction: '流光無際是 {game} 的擴展模組，本網站為其官方網站。',
      gameCopyright: 'Terraria 及其所有內容的版權歸 Re-Logic 所有。',
      copyright: '© {year} 逐夢孤舟製作組',
    },
    'header': {
      'openMenu': '開啟選單',
      'closeMenu': '關閉選單',
      'backToMenu': '返回主選單',
      'name': '流光無際',
      'home': '主頁',
      'news': '新聞',
      'wiki': '百科',
      'docs': '文檔',
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
  'home': {
    'hero': {
      'description': '歡迎來到流光無際的世界！ 流光無際係一個內容豐富嘅模組，擁有絕妙嘅視覺表現，為泰拉人們帶來令人耳目一新的體驗！',
      'getMod': '獲取模組',
      'getModDescription': '打開安裝教程，喺 tModLoader 訂閱遊玩',
      'github': 'GitHub',
      'githubDescription': '查看源碼、開發版同貢獻方式',
      'tmodloader': 'tModLoader',
    },
    'community': {
      'discord': 'Discord',
      'bilibili': '嗶哩嗶哩',
      'qq': 'QQ 群',
    },
    'news': {
      'more': '更多新聞',
      'placeholderTitle': '半年報 · 即將發布',
      'placeholderDescription': '新嘅半年報正在整理中。',
    },
    'lore': {
      'eyebrow': '設定',
      'title': '世界觀',
      'comingSoon': '即將公開',
    },
  },
  'docs': {
    'label': {
      'Getting Started': '新手入門',
      'Netcode': '網絡同步',
      'Mechanics': '遊戲機制',
      'Drawcode': '圖形繪製',
      'Game Content': '遊戲內容',
      'Weapons': '武器',
    },
    'empty': {
      'title': '未知領域',
      'description': '此處暫無內容',
    },
  },
} satisfies I18nLocale
