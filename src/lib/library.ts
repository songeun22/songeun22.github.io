import { getCollection, type CollectionEntry } from 'astro:content';

const isProd = import.meta.env.PROD;

/**
 * One entry in a book's outline: a top-level page plus whatever
 * sub-pages live under it. A page's own headings never show up here,
 * only the folder structure does.
 */
export interface OutlineNode {
  page: CollectionEntry<'library'>;
  subpages: CollectionEntry<'library'>[];
}

/**
 * A book's full outline, top-level pages in reading order, each with its
 * sub-pages (if any) in their own reading order.
 *
 * Encoded by folder depth: `book/chapter` is a top-level page,
 * `book/chapter/subpage` is a sub-page of it. Drafts are visible while
 * developing and dropped from the build.
 */
export async function getBookOutline(bookId: string): Promise<OutlineNode[]> {
  const all = await getCollection('library', ({ id, data }) => {
    if (!id.startsWith(`${bookId}/`)) return false;
    return isProd ? !data.draft : true;
  });

  const rest = (id: string) => id.slice(bookId.length + 1);

  const pages = all
    .filter((e) => !rest(e.id).includes('/'))
    .sort((a, b) => a.data.order - b.data.order);

  return pages.map((page) => {
    const slug = rest(page.id);
    const subpages = all
      .filter((e) => {
        const r = rest(e.id);
        return r.startsWith(`${slug}/`) && r.slice(slug.length + 1).split('/').length === 1;
      })
      .sort((a, b) => a.data.order - b.data.order);
    return { page, subpages };
  });
}

/** Every page in the book, flattened to reading order: each top-level page immediately followed by its sub-pages. */
export async function getBookPages(bookId: string) {
  const outline = await getBookOutline(bookId);
  return outline.flatMap((node) => [node.page, ...node.subpages]);
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
 * Every book, shelf order, with its pages and derived display data.
 * Thickness recomputes on each build, so spines fatten as you write.
 */
export async function getShelf() {
  const books = await getCollection('books');
  const sorted = books.sort((a, b) => a.data.order - b.data.order);

  return Promise.all(
    sorted.map(async (book) => {
      const chapters = await getBookPages(book.id);
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
