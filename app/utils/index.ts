import type { ContentNavigationItem } from '@nuxt/content'
import type {
  DocsContentKey,
  Langs,
  NavigationTree,
  NewsContentKey,
} from '#shared/types'

export const mapContentNavigation = (
  navigation: ContentNavigationItem[],
): NavigationTree[] => {
  const navMap = {
    'title': 'label',
    'path': 'to',
  }

  return navigation.map((navLink: ContentNavigationItem) => {
    const link = {} as NavigationTree
    for (const key in navLink) {
      if (key === 'children') {
        link.children = navLink.children?.length
          ? mapContentNavigation(navLink.children)
          : undefined
        continue
      }
      if (navLink[key]) {
        link[navMap[key] || key] = navLink[key]
      }
    }
    return link
  })
}

export const mapLocaleDocsNavigation = (
  navigation: ContentNavigationItem[],
  locale: Langs,
): ContentNavigationItem[] => {
  if (locale === 'zh-cn') {
    return navigation.find(item => item.path === '/docs')?.children ?? []
  } else {
    const l1 = navigation.find(item => item.path === '/' + locale)
    if (!l1 || !l1.children) {
      return []
    }
    const l2 = l1.children.find(item => item.path === '/' + locale + '/docs')
    if (!l2 || !l2.children) {
      return []
    }
    return l2.children
  }
}

export const newsCollectionKey = (locale: Langs): NewsContentKey => {
  switch (locale) {
    case 'zh-cn':
      return 'news'
    case 'en-us':
      return 'news_en'
    case 'zh-hk':
      return 'news_hk'
    default:
      return 'news'
  }
}

export const docsCollectionKey = (locale: Langs): DocsContentKey => {
  switch (locale) {
    case 'zh-cn':
      return 'docs'
    case 'en-us':
      return 'docs_en'
    case 'zh-hk':
      return 'docs_hk'
    default:
      return 'docs'
  }
}
