import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    name: 'Everglow',
    description: 'Скачайте Everglow — новое приключение в Terraria с впечатляющими визуальными эффектами.',
  },
  'meta': {
    'team': 'Dream Chaser Group',
  },
  'head': {
    fulltitle: 'Everglow — мод для Terraria',
    fulltitle2: 'Официальный сайт',
    title: 'Everglow',
    descriptions: {
      news: 'Читайте дневники разработки Everglow, новости о выпусках и обзоры будущего контента от Dream Chaser Group.',
      docs: 'Руководства по установке, документация для разработчиков и примеры кода мода Everglow.',
      about: 'Познакомьтесь с Dream Chaser Group — командой Everglow. Контакты, ссылки на сообщества и способы помочь проекту.',
    },
    subtitles: {
      news: 'Новости',
      wiki: 'Вики',
      docs: 'Документация',
      about: 'О проекте',
    },
  },
  'body': {
    footer: {
      introduction: 'Официальный сайт мода Everglow для {game}.',
      gameCopyright: 'Все права на Terraria и её содержимое принадлежат Re-Logic.',
      copyright: '© {year} Dream Chaser Group',
    },
    header: {
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
      backToMenu: 'Вернуться в главное меню',
      name: 'Everglow',
      home: 'Главная',
      news: 'Новости',
      wiki: 'Вики',
      docs: 'Документация',
      about: 'О проекте',
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
      'title': 'Содержание',
    },
  },
  'news': {
    'chevron-text': 'Читать далее',
  },
  'home': {
    hero: {
      description: 'Добро пожаловать в мир Everglow! Everglow — масштабный контентный мод с впечатляющими визуальными эффектами, который дарит игрокам Terraria совершенно новые впечатления!',
      getMod: 'Скачать мод',
      getModDescription: 'Откройте руководство по установке и подпишитесь на мод в tModLoader',
      github: 'GitHub',
      githubDescription: 'Исходный код, сборки для тестирования и участие в разработке',
      tmodloader: 'tModLoader',
    },
    community: {
      discord: 'Discord',
      bilibili: 'Bilibili',
      qq: 'Группа QQ',
    },
    news: {
      more: 'Все новости',
      placeholderTitle: 'Полугодовой отчёт · Скоро',
      placeholderDescription: 'Мы готовим новый отчёт.',
    },
    lore: {
      eyebrow: 'История мира',
      title: 'Мир',
      comingSoon: 'Скоро',
    },
  },
  'docs': {
    'label': {
      'Getting Started': 'Начало работы',
      'Netcode': 'Сетевой код',
      'Mechanics': 'Механики',
      'Drawcode': 'Отрисовка',
      'Game Content': 'Игровой контент',
      'Weapons': 'Оружие',
    },
    'empty': {
      'title': 'Неизведанная область',
      'description': 'Здесь пока ничего нет…',
    },
  },
} satisfies I18nLocale
