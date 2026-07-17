import { getCollection, type CollectionEntry } from 'astro:content';

const isProd = import.meta.env.PROD;

/**
 * Chapters belonging to one book, in reading order.
 * Drafts are visible while developing and dropped from the build.
 */
export async function getBookChapters(bookId: string) {
  const all = await getCollection('library', ({ id, data }) => {
    if (!id.startsWith(`${bookId}/`)) return false;
    return isProd ? !data.draft : true;
  });

  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Spine thickness in px, derived from how much is actually written. */
const MIN_THICKNESS = 26;
const MAX_THICKNESS = 68;

function thicknessFor(chars: number) {
  // Square root, not linear: a book with 10x the words should look
  // meaningfully fatter, not 10x fatter and off the shelf.
  const px = MIN_THICKNESS + Math.sqrt(chars) * 0.42;
  return Math.round(Math.min(MAX_THICKNESS, px));
}

/**
 * Every book, shelf order, with its chapters and derived display data.
 * Thickness recomputes on each build, so spines fatten as you write.
 */
export async function getShelf() {
  const books = await getCollection('books');
  const sorted = books.sort((a, b) => a.data.order - b.data.order);

  return Promise.all(
    sorted.map(async (book) => {
      const chapters = await getBookChapters(book.id);
      const chars = chapters.reduce((sum, c) => sum + (c.body?.length ?? 0), 0);
      const planned = book.data.status === 'planned' || chapters.length === 0;

      return {
        book,
        chapters,
        chars,
        planned,
        thickness: planned ? MIN_THICKNESS : thicknessFor(chars),
        /** null for planned books — there is nothing to open yet. */
        href: chapters[0] ? `/library/${chapters[0].id}` : null,
      };
    }),
  );
}

export type ShelfItem = Awaited<ReturnType<typeof getShelf>>[number];
export type Book = CollectionEntry<'books'>;
export type Chapter = CollectionEntry<'library'>;
