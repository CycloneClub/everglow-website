export type Langs = 'zh-cn' | 'zh-hk' | 'en-us'
export type NewsContentKey = 'news' | 'news_en' | 'news_hk'
export type DocsContentKey = 'docs' | 'docs_en' | 'docs_hk'

export type I18nLocale = {
  nuxtSiteConfig: {
    name: string
    description: string
  }
  meta: {
    team: string
  }
  head: {
    fulltitle: string
    fulltitle2: string
    title: string
    descriptions: {
      news: string
      docs: string
      about: string
    }
    subtitles: {
      news: string
      wiki: string
      docs: string
      about: string
    }
  }
  body: {
    footer: {
      introduction: string
      gameCopyright: string
      copyright: string
    }
    header: {
      openMenu: string
      closeMenu: string
      backToMenu: string
      toggleTheme: string
      name: string
      home: string
      news: string
      wiki: string
      docs: string
      about: string
      settings: {
        languages: {
          'zh-cn': string
          'en-us': string
          'zh-hk': string
        }
      }
    }
  }
  common: {
    toc: {
      title: string
    }
  }
  news: {
    'chevron-text': string
  }
  home: {
    hero: {
      description: string
      getMod: string
      getModDescription: string
      github: string
      githubDescription: string
      tmodloader: string
    }
    community: {
      discord: string
      bilibili: string
      qq: string
    }
    news: {
      more: string
      placeholderTitle: string
      placeholderDescription: string
    }
    lore: {
      eyebrow: string
      title: string
      comingSoon: string
    }
  }
  docs: {
    label: {
      'Getting Started': string
      'Netcode': string
      'Mechanics': string
      'Drawcode': string
      'Game Content': string
      'Weapons': string
    }
    empty: {
      title: string
      description: string
    }
  }
}
