// Writes seed/issues.ndjson from the site's data (site/src/lib/data):
// the three issues with their tables of contents, the abstracts and the
// full texts of the essays, with their notes — in the shape of the CMS.
//
//   cd studio && node seed/make-issues.mjs
//
// Run it again whenever the site's data changes, before importing
// (see README.md). Needs Node 22.18 or later (it reads the .ts files).
import {writeFileSync} from 'node:fs';

const {issues} = await import(new URL('../../site/src/lib/data/fixtures.ts', import.meta.url));

// Text pieces → the spans of a block. `em` → Italic. A note reference →
// a Footnote on the last word before it (as an editor would set it).
function spans(parts, notes, defs, id) {
  const out = [];
  const push = (text, marks) => out.push({_type: 'span', _key: `${id}s${out.length}`, text, marks});
  for (const part of typeof parts === 'string' ? [parts] : parts) {
    if (typeof part === 'string') push(part, []);
    else if ('em' in part) push(part.em, ['em']);
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

const real = (text) => text && !text.startsWith('Placeholder');
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
      ...(c.abstract && {abstract: simple(c.abstract)}),
      ...(c.body && {text: rich(c.body, c.notes ?? [])})
    })),
    ...(p.isbn && {isbn: p.isbn}),
    ...(p.buyUrl && {buyUrl: p.buyUrl}),
    ...(p.pdfUrl && {pdfUrl: p.pdfUrl}),
    availability: p.forthcoming ? 'forthcoming' : 'available'
  };
});

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
