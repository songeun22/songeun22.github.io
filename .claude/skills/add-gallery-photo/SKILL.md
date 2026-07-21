---
name: add-gallery-photo
description: Add one or more photos or drawings to the /gallery page. Use when the user has dropped new image file(s) into public/ or src/images/gallery/ and wants them published to the gallery with a title, date, and description, or asks to "add to gallery" / "upload to gallery" / "올려놨어, 갤러리에 넣어줘" style requests.
---

# Add a gallery photo

Publishes one or more images to the Gallery page (`src/pages/gallery.astro`), backed by `src/content/gallery.json` and image files in `src/images/gallery/`.

## 1. Find the new file(s)

Users often drop the file in `public/` (wrong spot) instead of `src/images/gallery/` (correct spot, required by the `gallery` content collection schema). Check both:

```bash
find public src/images/gallery -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.heic" -o -iname "*.heif" \) -newer .git
```

Or just ask the user for the filename if it's not obvious.

## 2. Check the real format, not just the extension

Phones frequently save HEIC data under a `.jpg` extension. `gallery.astro` globs literal `jpg|jpeg|png|webp|avif` files and Astro's image pipeline will choke on a mislabeled file, so always verify:

```bash
sips -g format path/to/file.jpg
```

If `format` isn't one of `jpeg png webp` (heic/heif especially), re-encode to a real JPEG:

```bash
sips -s format jpeg path/to/file.jpg --out src/images/gallery/final-name.jpg
```

If the file was already correctly named/formatted, just move/copy it into `src/images/gallery/` with a descriptive kebab-case filename (not the original `IMG_1234` name).

If the source lives in `public/`, remove it from there once the converted copy is safely in `src/images/gallery/` — check `git status` / `git log -- public/<file>` first; if it was never committed there's nothing to clean up on the git side, just delete the loose file.

## 3. Mind EXIF privacy before writing captions

```bash
sips -g all path/to/file.jpg | head -20
mdls -name kMDItemContentCreationDate -name kMDItemLatitude -name kMDItemLongitude path/to/file.jpg
```

Creation date is useful for filling in the `year` field if the user doesn't give one. **Never** put raw GPS coordinates into a public caption. If the shot is somewhere identifiable and the user wants that context, use a place name they'd be fine making public (city, park, neighborhood), not coordinates, and don't volunteer exact location unless asked.

## 4. Collect per-photo fields

For each image, get:

- **title** — can be an empty string `""` if the user wants no title (the caption UI handles that fine, date still right-aligns).
- **description** — the hover-caption text. Keep it short, sentence case.
- **year** — a free-form display string, not a real date type. Match whatever format the user asks for verbatim (e.g. `"2025"`, `"Feb 23, 2025"`, `"Oct, 2024"`). Don't "fix" their formatting choice unless asked.
- **kind** — must be exactly `"photo"` or `"drawing"` (the content schema is a strict enum, anything else fails the build). This is what the gallery page's All / Photos / Drawings filter toggle actually keys off (`data-kind` on each tile), so get it from the user, don't infer it from the file itself.

If the user gives you a batch of images with per-image details in one message, just work through them in order, matching each image to whichever kind they told you for it. If any field is missing for an image, ask rather than inventing content (title/description are creative choices, not something to guess) — but if only `kind` is ambiguous for a specific image in a batch, that's worth a quick confirm too, since photo vs. drawing is exactly the thing this skill needs to get right per the user's own categorization, not a guess from image content.

## 5. Add entries to `src/content/gallery.json`

Append one object per photo, following the existing shape:

```json
{
  "id": "gNN",
  "image": "final-name.jpg",
  "title": "...",
  "description": "...",
  "year": "...",
  "kind": "photo"
}
```

`id` = next unused `gNN` in the file (check the current max, don't reuse or renumber existing entries).

## 6. Verify before committing

```bash
npm run build
```

`gallery.astro` throws a hard build error if `gallery.json` references an image that isn't in `src/images/gallery/`, so a clean build is the real correctness check here. If a dev server is already running, spot check `/gallery` in the browser too (hover the new tile to confirm the caption reads right, especially the empty-title case).

## 7. Commit and push

Only commit when the user asks. When they do, stage the changed `gallery.json` plus the new image file(s) specifically (not `-A` blindly, in case something else is mid-edit), write a short commit message, and push. If `origin/main` has moved (someone edits content directly on GitHub sometimes), `git fetch` and rebase before pushing rather than force-pushing.

## Known gotcha

If the user says they deleted old placeholder/gallery images themselves, always check `gallery.json` still doesn't reference the deleted files — `git status` will show the images as deleted but json cleanup is a separate manual step people forget, and it silently breaks the next build.
