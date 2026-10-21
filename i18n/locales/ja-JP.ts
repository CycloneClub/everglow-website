import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    'name': 'Everglow',
    'description': 'Terrariaに美しいビジュアルと新たな冒険をもたらす大型Mod、Everglowをダウンロード。',
  },
  'meta': {
    'team': 'Dream Chaser Group',
  },
  'head': {
    'fulltitle': 'Everglow - Terraria Mod',
    'fulltitle2': '公式サイト',
    'title': 'Everglow',
    'descriptions': {
      'news': 'Everglowの開発日誌、リリース情報、新コンテンツのプレビューなど、Dream Chaser Groupの最新情報をお届けします。',
      'docs': 'Everglow Modのインストールガイド、開発ドキュメント、コード例をご覧いただけます。',
      'about': 'Everglowを制作するDream Chaser Groupの紹介、連絡先、コミュニティ、開発への参加方法をご案内します。',
    },
    'subtitles': {
      'news': 'ニュース',
      'wiki': 'Wiki',
      'docs': 'ドキュメント',
      'about': 'チーム紹介',
    },
  },
  'body': {
    'footer': {
      'introduction': '{game}向けMod「Everglow」の公式サイトです。',
      'gameCopyright': 'Terrariaおよびそのすべてのコンテンツの著作権はRe-Logicに帰属します。',
      'copyright': '© {year} Dream Chaser Group',
    },
    'header': {
      'openMenu': 'メニューを開く',
      'closeMenu': 'メニューを閉じる',
      'backToMenu': 'メインメニューに戻る',
      'name': 'Everglow',
      'home': 'ホーム',
      'news': 'ニュース',
      'wiki': 'Wiki',
      'docs': 'ドキュメント',
      'about': 'チーム紹介',
      'settings': {
        'languages': {
          'zh-cn': '简体中文',
          'en-us': 'English',
          'zh-hk': '繁体中文',
          'ja-jp': '日本語',
          'ko-kr': '한국어',
        },
      },
    },
  },
  'common': {
    'toc': {
      'title': '目次',
    },
  },
  'news': {
    'chevron-text': '続きを読む',
  },
  'home': {
    'hero': {
      'description': 'Everglowの世界へようこそ！美しいビジュアルと豊富なコンテンツで、テラリアンの皆さんに新鮮な冒険をお届けする大型Modです。',
      'getMod': 'Modを入手',
      'getModDescription': 'インストールガイドを開き、tModLoaderでサブスクライブ',
      'github': 'GitHub',
      'githubDescription': 'ソースコード、開発版、開発への参加方法',
      'tmodloader': 'tModLoader',
    },
    'community': {
      'discord': 'Discord',
      'bilibili': 'Bilibili',
      'qq': 'QQグループ',
    },
    'news': {
      'more': 'ニュース一覧',
      'placeholderTitle': '半年間の活動報告 · 近日公開',
      'placeholderDescription': '新しい活動報告を準備しています。',
    },
    'lore': {
      'eyebrow': '世界観',
      'title': '世界',
      'comingSoon': '近日公開',
    },
  },
  'docs': {
    'label': {
      'Getting Started': 'はじめに',
      'Netcode': 'ネットワーク',
      'Mechanics': 'ゲームシステム',
      'Drawcode': '描画',
      'Game Content': 'ゲームコンテンツ',
      'Weapons': '武器',
    },
    'empty': {
      'title': 'コンテンツが見つかりません',
      'description': 'ここにはまだコンテンツがありません。',
    },
  },
} satisfies I18nLocale
