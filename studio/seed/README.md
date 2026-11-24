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

## Updating the contributions (once the issues are in the CMS)

`update-contributions.mjs` writes the extracted contents into the CMS without
replacing the issues: a contribution's text (with its footnotes), abstract,
DOI, pages and type, an editors' note's text and DOI, and the issue's own
abstract. Covers, images,
people, titles and anything else edited in the Studio stay as they are. Use
it instead of the `--replace` import from now on.

    cd studio
    node seed/make-issues.mjs
    npx sanity exec seed/update-contributions.mjs --with-user-token -- --dry-run
    npx sanity exec seed/update-contributions.mjs --with-user-token -- 01-chasing-water/liquid-shadows

- Without a name it does everything; with an issue's or an article's address
  (`01-chasing-water`, `01-chasing-water/liquid-shadows`, `…/editorial`) only that.
- `--dry-run` says what it would do, and changes nothing.
- Only **empty** fields are filled: a field the CMS already has different is
  kept and listed. `--force` overwrites it (careful: a text overwritten loses
  the figures added to it in the Studio).
- A contribution not in the CMS yet is added at the end of its issue (its
  people must be in the CMS already: `people.ndjson`); an issue not in the
  CMS yet is created whole.

## The figures and their images (once the texts are in the CMS)

`update-figures.mjs` uploads the images and places each figure in the text
of its contribution, after the paragraph it follows on the site, with its
letter and caption. It reads `figures.json` (written by `make-issues.mjs`)
and the images folder (`00_Materials/images`: files named as its
checklists say).

    cd studio
    node seed/make-issues.mjs
    npx sanity exec seed/update-figures.mjs --with-user-token -- 01-chasing-water/the-draining-of-the-fens-enclosures-resistance-and-wilderness --dry-run
    npx sanity exec seed/update-figures.mjs --with-user-token -- 01-chasing-water/the-draining-of-the-fens-enclosures-resistance-and-wilderness

- One piece, one issue (`01-chasing-water`) or nothing (everything).
- It can be run again as more files arrive: it adds what is missing and
  leaves a figure already in the CMS as it is (`--force` replaces its image,
  letter and caption).
- The site shows an image once it has been built again after this (any
  push; its build asks the CMS which figures have an image).
