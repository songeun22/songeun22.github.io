import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/**
 * A book = one subject, e.g. "Hypothesis Testing".
 * One JSON file per book in src/content/books/. The filename is the id,
 * and it must match the chapter folder name in src/content/library/.
 */
const books = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    /** Position on the shelf, low to high. */
    order: z.number().default(99),
    /** Spine colour. Ignored for `planned` books, which are always grey. */
    color: z.string().default('#2f5ea8'),
    /** `planned` = nothing written yet: greyed out and not clickable. */
    status: z.enum(['planned', 'draft', 'in-progress', 'complete']).default('in-progress'),
    updated: z.coerce.date().optional(),
  }),
});

/**
 * A chapter inside a book. Lives at
 * src/content/library/<book-id>/<chapter-slug>.mdx
 * which produces the URL /library/<book-id>/<chapter-slug>.
 */
const library = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/library' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    /** Position within the book, low to high. */
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
});

/** Photos and drawings. Files live in src/images/gallery/. */
const gallery = defineCollection({
  loader: file('./src/content/gallery.json'),
  schema: z.object({
    id: z.string(),
    /** Filename inside src/images/gallery/ */
    image: z.string(),
    title: z.string(),
    description: z.string().optional(),
    year: z.string().optional(),
    kind: z.enum(['photo', 'drawing']).default('photo'),
  }),
});

/** Experience entries for the About page timeline. */
const timeline = defineCollection({
  loader: file('./src/content/timeline.json'),
  schema: z.object({
    id: z.string(),
    /** e.g. "2024" or "2022–2024". Displayed verbatim. */
    period: z.string(),
    /** Sorts the timeline, newest first. */
    start: z.number(),
    title: z.string(),
    org: z.string(),
    description: z.string().optional(),
    kind: z.enum(['education', 'research', 'work']).default('research'),
  }),
});

export const collections = { books, library, gallery, timeline };
