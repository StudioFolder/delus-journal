// Writes seed/issues.ndjson from the site's data (site/src/lib/data):
// the three issues with their tables of contents, the abstracts and the
// full texts of the essays, with their notes — in the shape of the CMS.
// And seed/pages.ndjson: the Imprint and Privacy pages.
//
//   cd studio && node seed/make-issues.mjs
//
// Run it again whenever the site's data changes, before importing
// (see README.md). Needs Node 22.18 or later (it reads the .ts files).
import {writeFileSync} from 'node:fs';

const {issues, legal} = await import(new URL('../../site/src/lib/data/fixtures.ts', import.meta.url));

// An address of the site that is an issue, its editors' note or one of
// its contributions → the CMS's link to it (the "Article of the journal"
// of a Link: the issue and the contribution's key)
function articleLink(href) {
  for (const issue of issues) {
    const base = `/issues/${issue.slug}/`;
    if (!href.startsWith(base)) continue;
    const to = {_type: 'articleLink', issue: {_type: 'reference', _ref: `issue-${issue.slug}`, _weak: true}};
    if (href === base) return to;
    if (href === `${base}editorial/`) return {...to, key: 'editorial'};
    const i = issue.contributions.findIndex((c) => href === `${base}${c.slug}/`);
    if (i >= 0) return {...to, key: `c${i}`};
  }
}

// Text pieces → the spans of a block. `em` → Italic. `link` → a Link on
// its words (to an article of the journal when its address is one). A
// note reference →
// a Footnote on the last word before it (as an editor would set it).
function spans(parts, notes, defs, id) {
  const out = [];
  const push = (text, marks) => out.push({_type: 'span', _key: `${id}s${out.length}`, text, marks});
  for (const part of typeof parts === 'string' ? [parts] : parts) {
    if (typeof part === 'string') push(part, []);
    else if ('em' in part) push(part.em, ['em']);
    else if ('link' in part) {
      const key = `${id}link${defs.length}`;
      const article = articleLink(part.href);
      defs.push({_key: key, _type: 'link', ...(article ? {article} : {href: part.href})});
      push(part.link, [key]);
    }
    else {
      const key = `note${part.note}`;
      defs.push({_key: key, _type: 'footnote', text: simple(notes[part.note - 1], `${key}-`)});
      const last = out.pop() ?? {text: '', marks: []};
      const at = last.text.trimEnd().lastIndexOf(' ') + 1; // where its last word starts
      if (at > 0) push(last.text.slice(0, at), last.marks);
      push(last.text.slice(at), [...last.marks, key]);
    }
  }
  return out;
}
const block = (style, parts, id, notes = []) => {
  const markDefs = [];
  const children = spans(parts, notes, markDefs, id);
  return {_type: 'block', _key: id, style, markDefs, children};
};
// Short text (abstracts, footnotes): one paragraph
const simple = (parts, id = '') => [block('normal', parts, `${id}p0`)];
// Long text: paragraphs, quotes (Quote), chapter titles (Heading)
// (figures are left out: they need their image files, loaded by hand)
const rich = (body, notes) =>
  body
    .filter((b) => typeof b === 'string' || Array.isArray(b) || !('figure' in b))
    .map((b, i) =>
    typeof b === 'string' || Array.isArray(b)
      ? block('normal', b, `b${i}`, notes)
      : 'quote' in b
        ? block('blockquote', b.quote, `b${i}`, notes)
        : block('h3', b.heading, `b${i}`)
  );

// (an abstract is plain text or a list of pieces: look at its first words)
const real = (text) => text && !String(typeof text === 'string' ? text : text[0]).startsWith('Placeholder');
const docs = issues.map((issue) => {
  const p = issue.publication;
  return {
    _id: `issue-${issue.slug}`,
    _type: 'issue',
    number: issue.number,
    title: issue.title,
    slug: {_type: 'slug', current: issue.slug},
    season: issue.date,
    ...(real(issue.abstract) && {abstract: simple(issue.abstract)}),
    editedBy: p.editedBy,
    designedBy: p.designedBy,
    contributions: issue.contributions.map((c, i) => ({
      _key: `c${i}`,
      _type: 'contribution',
      title: c.title,
      slug: {_type: 'slug', current: c.slug},
      people: c.people.map((slug) => ({_key: slug, _type: 'reference', _ref: `person-${slug}`})),
      ...(c.page && {pages: String(c.page)}), // the first page only, for now
      ...(c.doi && {doi: c.doi}),
      kind: c.kind ?? 'essay',
      ...(c.abstract && {abstract: simple(c.abstract)}),
      ...(c.body && {text: rich(c.body, c.notes ?? [])})
    })),
    ...(issue.editorial && {
      editorial: {
        ...(issue.editorial.doi && {doi: issue.editorial.doi}),
        ...(issue.editorial.body && {text: rich(issue.editorial.body, issue.editorial.notes ?? [])})
      }
    }),
    ...(p.isbn && {isbn: p.isbn}),
    ...(p.doi && {doi: p.doi}),
    ...(p.buyUrl && {buyUrl: p.buyUrl}),
    ...(p.pdfUrl && {pdfUrl: p.pdfUrl}),
    availability: p.forthcoming ? 'forthcoming' : 'available'
  };
});

// Imprint and Privacy (single pages: their id is their type)
// (Privacy's "Last updated" is not in its text: the site takes the day it was last published)
const pages = legal.map((page) => ({_id: page.slug, _type: page.slug, title: page.title, text: rich(page.body, [])}));
writeFileSync(new URL('pages.ndjson', import.meta.url), pages.map((d) => JSON.stringify(d)).join('\n') + '\n');
for (const d of pages) console.log(`${d._id}: ${d.text.length} blocks`);

const file = new URL('issues.ndjson', import.meta.url);
writeFileSync(file, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
for (const d of docs) {
  const texts = d.contributions.filter((c) => c.text);
  const notes = texts.flatMap((c) => c.text.flatMap((b) => b.markDefs)).length;
  console.log(
    `${d._id}: ${d.contributions.length} contributions, ` +
      `${d.contributions.filter((c) => c.abstract).length} abstracts, ${texts.length} full texts, ${notes} notes`
  );
}
