import { defineCollection, z } from 'astro:content';

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(['en', 'lv']),
    pageType: z.enum(['main', 'open-edoc-file', 'asice-reader', 'what-is-edoc', 'compare-viewers']),
    alternates: z.object({
      en: z.string().optional(),
      lv: z.string().optional(),
    }),
    defaultViewerLocale: z.enum(['en', 'lv']).default('en'),
    image: z.string().optional(), // OG/Twitter image path relative to public/, e.g. "/screenshots/screen-1200-630x.png"
    countryMentions: z.array(z.string()).optional(), // ['eParaksts', 'Latvijas.lv'] for LV
  }),
});

export const collections = {
  pages: pagesCollection,
};
