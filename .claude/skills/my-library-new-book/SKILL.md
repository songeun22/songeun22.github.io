---
name: my-library-new-book
description: Start (or re-scaffold) a book on the /library shelf. The flow is fetch origin, take the user's full chapter/subpage structure, apply it, write the intro from their draft, let them review on localhost, commit and push after approval, then merge into main. Use when the user says they're starting work on a library book, wants to set up or redo a book's scaffold/목차, or invokes /my-library-new-book.
---

# Start a new library book

The Library is an Astro content setup:

- `src/content/books/<book-id>.json` is the book's metadata. Its schema is in `src/content.config.ts`.
- `src/content/library/<book-id>/` holds the pages. Their URLs are `/library/<book-id>/...`.
- `src/lib/library.ts` builds the outline **from folder depth**:
  - `<book-id>/<slug>.mdx` is a top-level chapter.
  - `<book-id>/<slug>/<sub>.mdx` is a sub-page of that chapter. It shows up indented under the chapter in the sidebar, without a number.
  - Each level is sorted by its own `order` frontmatter.
- `src/content/library/hypothesis-testing/` is the reference example of the two-level hierarchy.

Work in `songeun22.github.io/`. The user reviews everything themselves on localhost. **Never commit, push, or merge until they explicitly approve each step.**

## 1. Fetch and report state

```bash
git fetch origin
git status -sb
git branch -vv
git rev-list --left-right --count origin/main...HEAD
ls src/content/library src/content/books
```

Report the following briefly, in Korean if the user writes in Korean:

- The current branch, and how far it is ahead of or behind its upstream and `origin/main`.
- Any local branches with unpushed commits, especially `main`. Mention them, but don't touch them.
- The books present in `src/content/library`.
  - `dist/library/` can hold books from stale builds that no longer exist in the source. Point these out, but don't treat them as real.

Then confirm two things:

1. **Which book.** It can be an existing one or a new id.
2. **Which branch.** The default is a new branch off `origin/main`, named after the book (for example `<book-id>-vol1`). If a branch for this book already exists, continue on that one.

## 2. Get the full scaffold structure from the user

The user gives the whole outline: the book title (including suffixes like a Roman numeral, e.g. "… I"), the chapters in order, what each chapter should cover, and which chapters nest under which. Don't invent chapters. If the structure is ambiguous, ask.

If they say something has been dropped from the book's scope (e.g. "no martingale posterior anymore"), grep `src/` for it and remove every mention.

## 3. Apply the scaffold

**Book JSON** (`src/content/books/<book-id>.json`):
- `title`
- `subtitle`: a short list of the main topics
- `description`: one sentence
- `order`: its position on the shelf
- `color`: the spine colour, hex
- `status`: `in-progress` while you're writing
- `updated`: today's date, `YYYY-MM-DD`

**Pages**: each page gets this frontmatter:

```mdx
---
title: "[Review 1] Learn then Test"   # quote titles containing [ ] or :
description: One sentence, shown under the page title.
order: 1
---
```

- Top-level chapters are numbered `order: 1..n` in reading order.
- Sub-pages go in a folder named exactly like their parent's slug and restart at `order: 1`.
- When moving existing pages, use `git mv` so history follows, then renumber. Afterwards, grep for links that pointed at the old URLs.
- Use kebab-case slugs.
- Each chapter that isn't written yet gets a stub. Start it with `**TODO chapter.** Rough plan:` (or `**TODO review.**` for a review page), followed by bullets taken from what the user said the chapter covers.
- Paper-review pages start with a source box (use **Papers**, plural, if there are several):

  ```mdx
  > **Paper**
  > Authors. [*Exact Paper Title*](link). *Venue* vol(issue), year. ([arXiv:XXXX.XXXXX](https://arxiv.org/abs/XXXX.XXXXX))
  ```

## 4. Write the intro from the user's draft

The user writes the intro content, often rough or mixed Korean and English. **Keep their wording and structure**, and only polish grammar and flow:

- Translate the Korean bits.
- Expand abbreviations on first use, e.g. "OOD" becomes "out-of-distribution (OOD)".
- Don't add claims, a roadmap, or extra sections they didn't ask for.

If they list sources, put them in a box after the text, in the order they gave:

```mdx
> **Primary sources**
>
> - Authors. [*Exact Title*](url). Venue/arXiv:ID, year.
```

Link the **real title** of each source, never a bare URL. Verify the titles:

- YouTube: `curl -s "https://www.youtube.com/oembed?url=<video-url>&format=json"`. This gives the title and the channel author.
- arXiv, journals: use the actual paper title and authors. Check them if you're not sure.

## 5. Serve on localhost and self-check

Start the dev server with the built-in browser's `preview_start` using `name: "site"`, which is defined in `.claude/launch.json` and runs on port 4321. Then:

- Open `/library/<book-id>/intro` and take a screenshot.
- Check the sidebar structure. On a narrow viewport the sidebar is hidden, so use JS:

  ```js
  [...document.querySelectorAll('nav a, aside a')].filter(a=>a.href.includes('<book-id>')).map(a=>a.textContent.trim().replace(/\s+/g,' ')).join('\n')
  ```

  Top-level pages should be numbered (01, 02, …) and sub-pages should be unnumbered under their parent. Also check that previous/next follows reading order.
- Check `preview_logs` for build or schema errors. A bad frontmatter field fails the content collection.

Give the user the localhost URL, summarise what changed (files and the reasoning behind any wording edits), and wait for them to review. Apply their edits and re-check until they approve.

## 6. Commit and push the branch (after approval)

```bash
git add -A src/content
git status -s          # confirm only the intended files are staged
git commit -m "<Book short name>: <what changed>

Co-Authored-By: ..."   # use the attribution line from the current system reminder
git push origin <branch>
```

Never force-push. Afterwards, report the commit hash and say how many commits the branch is ahead of `main`. Then ask whether to merge.

## 7. Merge into main (when the user asks)

```bash
git fetch origin
git checkout main
git log --oneline origin/main..main   # any unpushed local main commits? say so, they go out with this push
git merge --no-edit <branch>
npm run build                         # must pass before pushing; main deploys the live site
git push origin main
```

- If the merge conflicts or the build fails, stop and report. Don't push a broken `main`.
- Afterwards, report the merge commit and confirm that `main` matches `origin/main`.
- Leave the dev server running for the next round of writing.
