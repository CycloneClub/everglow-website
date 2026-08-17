import process from 'node:process'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@nuxt/content',
    '@nuxt/image',
    '@tresjs/nuxt',
  ],
  ssr: true,
  devtools: {
    enabled: true,
    componentInspector: false,
  },
  app: {
    baseURL: '',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'author',
          content: 'Dream Chaser Group',
        },
        {
          name: 'keywords',
          content: 'Everglow,流光无际',
        },
        {
          name: 'keywords',
          content: 'tmodloader-mod',
        },
        {
          name: 'keywords',
          content: 'Terraria,泰拉瑞亚',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.ico',
        },
        {
          rel: 'alternate',
          hreflang: 'zh-cn',
          href: 'https://everglow.cloudea.work/zh-cn/',
        },
        {
          rel: 'alternate',
          hreflang: 'en-us',
          href: 'https://everglow.cloudea.work/en-us/',
        },
        {
          rel: 'alternate',
          hreflang: 'zh-hk',
          href: 'https://everglow.cloudea.work/zh-hk/',
        },
        {
          rel: 'alternate',
          hreflang: 'x-default',
          href: 'https://everglow.cloudea.work/',
        },
      ],
      noscript: [
        {
          // children: 'JavaScript is required', // @BreakingChanges
        },
      ],
    },
    keepalive: true,
    layoutTransition: false,
    pageTransition: false,
    rootAttrs: {
      id: '__nuxt',
    },
  },
  router: {
    options: {
      hashMode: false,
    },
  },
  site: {
    name: 'Everglow',
    url: 'https://everglow.cloudea.work',
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    globalName: '__EVERGLOW_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: 'everglow-',
    classSuffix: '-mode',
    storage: 'cookie',
    storageKey: process.env.COLOR_MODE_STORAGE_KEY,
  },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 5,
        },
        remarkPlugins: {
          'remark-emoji': {
            options: {
              emoticon: true,
            },
          },
        },
        highlight: {
          theme: {
            default: 'dark-plus',
            light: 'light-plus',
            dark: 'dark-plus',
            sepia: 'monokai',
          },
          langs: [
            'json',
            'js',
            'ts',
            'html',
            'css',
            'vue',
            'shell',
            'mdc',
            'md',
            'yaml',
            'c',
            'cpp',
            'java',
            'csharp',
          ],
        },
      },
    },
    experimental: {
      sqliteConnector: 'native',
    },
  },
  runtimeConfig: {
    public: {
      colorModeStorageKey: process.env.COLOR_MODE_STORAGE_KEY,
    },
  },
  compatibilityDate: '2026-08-03',
  nitro: {
    // preset: 'node-server',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // api: 'modern', // @BreakingChanges
        },
      },
    },
  },
  typescript: {
    typeCheck: true,
    strict: false,
  },
  hooks: {
    // @nuxtjs/mdc 0.22.2 adds pnpm-specific aliases that Vite 8 cannot resolve.
    // Remove them after all modules have extended the Vite configuration.
    'vite:configResolved': (config) => {
      if (Array.isArray(config.optimizeDeps?.include)) {
        config.optimizeDeps.include = config.optimizeDeps.include.filter(
          dependency => !dependency.startsWith('@nuxtjs/mdc > '),
        )
      }
    },
  },
  eslint: {
    checker: {
      configType: 'flat',
    },
    config: {
      stylistic: {
        commaDangle: 'always-multiline',
      },
      tooling: true,
      typescript: true,
    },
  },
  fonts: {
    families: [
      {
        name: 'Abel',
        provider: 'bunny',
      },
      {
        name: 'Satoshi',
        provider: 'fontshare',
        weights: [400, 500],
      },
      {
        name: 'Kode Mono',
        provider: 'none',
      },
      {
        name: 'Oswald',
        fallbacks: ['Times New Roman'],
      },
      {
        name: 'Aleo',
        provider: 'adobe',
      },
      {
        name: 'Barlow Semi Condensed',
        provider: 'adobe',
      },
      {
        name: 'Barlow',
        preload: true,
      },
      {
        name: 'Roboto Mono',
        provider: 'fontsource',
      },
      {
        name: 'Roboto Flex',
        provider: 'fontsource',
      },
      {
        name: 'Public Sans',
        src: '/fonts/Public-Sans.woff',
      },
      {
        name: 'Noto Sans SC',
        provider: 'bunny',
        weights: [400, 500],
        subsets: ['latin', 'chinese-simplified'],
      },
      {
        name: 'Noto Sans TC',
        provider: 'bunny',
        weights: [400, 500],
        subsets: ['latin', 'chinese-traditional'],
      },
      {
        name: 'JetBrains Mono',
        src: '/fonts/JetBrains-Mono.woff2',
      },
    ],
    defaults: {
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: [
        'cyrillic-ext',
        'cyrillic',
        'greek-ext',
        'greek',
        'vietnamese',
        'latin-ext',
        'latin',
      ],
    },
    // fallbacks: { // @BreakingChanges
    //   'serif': ['Times New Roman'],
    //   'sans-serif': ['Arial'],
    //   'monospace': ['Courier New'],
    // },
    providers: {
      google: false,
      googleicons: false,
    },
    adobe: {
      id: ['sij5ufr', 'grx7wdj'],
    },
    experimental: {
      processCSSVariables: true,
    },
  },
  i18n: {
    baseUrl: process.env.BASE_URL,
    // langDir: './lang', // @BreakingChanges
    locales: [
      {
        code: 'zh-cn',
        language: 'zh-CN',
        file: 'zh-CN.ts',
      },
      {
        code: 'zh-hk',
        language: 'zh-HK',
        file: 'zh-HK.ts',
      },
      {
        code: 'en-us',
        language: 'en-US',
        file: 'en-US.ts',
      },
    ],
    defaultLocale: 'zh-cn',
    strategy: 'prefix_and_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: process.env.LANGUAGE_STORAGE_KEY,
      redirectOn: 'root',
      alwaysRedirect: false,
    },
  },
  robots: {
    allow: '/',
  },
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Dream Chaser Group',
      url: 'https://everglow.cloudea.work',
      logo: 'https://everglow.cloudea.work/logo.png',
    },
  },
  sitemap: {
    // strictNuxtContentPaths: true, // Unavailable in @nuxt/content v3 @BreakingChanges
  },
  tres: {
    devtools: true,
    glsl: true,
  },
})
