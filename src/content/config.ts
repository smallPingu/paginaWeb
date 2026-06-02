import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    image: z.string().optional(),
    author: z.string().default('Profesor'),
    draft: z.boolean().default(false),
    locale: z.enum(['es', 'en', 'uk']).default('es'),
  }),
});

const obras = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    technique: z.string().optional(),
    image: z.string(),
    category: z.enum(['alumno', 'profesor']).default('alumno'),
  }),
});

export const collections = { blog, obras };
