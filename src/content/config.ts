import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    company: z.string(),
    year: z.string(),
    description: z.string(),
    external: z.string().optional(),
    order: z.number().default(99),
    category: z.enum(['case-study', 'personal']).default('case-study'),
    spotlight: z.boolean().optional(),
    github: z.string().optional(),
    availableOnRequest: z.boolean().optional(),
    thumbnail: z.string().optional(),
  }),
});

export const collections = { work };
