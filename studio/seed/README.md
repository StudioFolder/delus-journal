# Seed content

Content prepared as files, to load into the CMS with one command each.

## People

`people.ndjson` — the 29 contributors of Issues 0, 1 and 2, as Person entries.

    cd studio
    npx sanity dataset import seed/people.ndjson production --replace

`--replace` overwrites these same entries if they already exist (they have
fixed ids, `person-…`); it does not touch anything else.

## Imprint and Privacy

`pages.ndjson` — the two single pages, written by `make-issues.mjs` (below)
from the site's data, with the issues:

    cd studio
    node seed/make-issues.mjs
    npx sanity dataset import seed/pages.ndjson production --replace

`--replace` overwrites the two pages (edits made in the Studio since would be
lost); it does not touch anything else.

## Issues

`issues.ndjson` — the three issues (`issue-00-delus`, `issue-01-chasing-water`,
`issue-02-season-creep`) with their tables of contents, the abstracts of the
contributions and the full texts of two essays of Issue 01 with their
footnotes. It is generated from the site's data (`site/src/lib/data`), where
this content is kept until the site reads from the CMS:

    cd studio
    node seed/make-issues.mjs          # writes seed/issues.ndjson again, from the site's data
    npx sanity dataset import seed/issues.ndjson production --replace

- Load the people first: the contributions refer to them.
- Generate the file again before importing, so it has the latest texts.
- **`--replace` replaces these three issues entirely** — covers, images and
  anything edited in the Studio since would be lost. Use it only while the
  site's data is the master copy, before the editors start working on the
  issues in the Studio.
- Not in the file: covers and images (the figures of the essays included:
  they are added in the Studio, with their image files), page counts, binding and format
  (still placeholders on the site), the editorial, the abstracts of Issues
  00 and 01 themselves (placeholders on the site). A contribution's
  "Pages" holds its first page only.
