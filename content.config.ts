import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const newsSchema = z.object({
  date: z.string(),
  author: z.string().optional(),
  image: z.string().optional(),
})

const docsSchema = z.object({
  date: z.string(),
  author: z.string().optional(),
  icon: z.string().optional(),
})

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['**/news/**', '**/docs/**'],
      },
      schema: z.object({
        date: z.string(),
        author: z.string(),
        icon: z.string(),
        image: z.string(),
      }),
    }),

    news: defineCollection({
      type: 'page',
      source: 'news/**/*.md',
      schema: newsSchema,
    }),
    news_en: defineCollection({
      type: 'page',
      source: 'en-US/news/**/*.md',
      schema: newsSchema,
    }),
    news_hk: defineCollection({
      type: 'page',
      source: 'zh-HK/news/**/*.md',
      schema: newsSchema,
    }),

    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: docsSchema,
    }),
    docs_en: defineCollection({
      type: 'page',
      source: 'en-US/docs/**/*.md',
      schema: docsSchema,
    }),
    docs_hk: defineCollection({
      type: 'page',
      source: 'zh-HK/docs/**/*.md',
      schema: docsSchema,
    }),
  },
})
