// Writes the extracted contents into the CMS without replacing the issues:
// a contribution's text (with its footnotes), abstract, DOI, pages and type,
// an editors' note's text and DOI, and the issue's own abstract. Everything else is left as it is —
// covers, images, people, titles and anything edited in the Studio.
//
// It reads seed/issues.ndjson, so generate that first:
//
//   cd studio
//   node seed/make-issues.mjs
//   npx sanity exec seed/update-contributions.mjs --with-user-token -- [what] [--force] [--dry-run]
//
// what:        nothing = everything; an issue (01-chasing-water); one article
//              (01-chasing-water/not-a-drop-is-lost; …/editorial for the editors' note).
//              Several can be given.
// --dry-run:   only says what it would do.
// --force:     also overwrites fields that already have something in the CMS
//              (without it, only empty fields are filled — so a text corrected
//              in the Studio, or with figures added there, is never lost).
//
// A contribution that isn't in the CMS yet is added at the end of its issue
// (its people must already be in the CMS: see people.ndjson). An issue that
// isn't in the CMS yet is created whole.
import {readFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

const FIELDS = ['text', 'abstract', 'doi', 'pages', 'kind'];
const EDITORIAL = ['text', 'doi'];

const args = process.argv.slice(2);
const force = args.includes('--force');
const dry = args.includes('--dry-run');
const wanted = args.filter((a) => !a.startsWith('--')).map((a) => a.replace(/^\/|\/$/g, '').split('/'));
const wants = (issue, slug) =>
  !wanted.length || wanted.some(([i, s]) => i === issue && (!s || !slug || s === slug));

const docs = readFileSync(new URL('issues.ndjson', import.meta.url), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const client = getCliClient({apiVersion: '2025-01-01'});
const empty = (v) => v == null || (Array.isArray(v) && !v.length) || v === '';
// The same content, whatever the order of its fields and the keys of its pieces
const canon = (v) =>
  Array.isArray(v)
    ? v.map(canon)
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).filter((k) => k !== '_key').sort().map((k) => [k, canon(v[k])]))
      : v;
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
// The words of a text field (or the value itself), to show where two differ
const words = (v) =>
  Array.isArray(v) ? v.map((b) => (b.children ?? []).map((c) => c.text).join('')).join('\n') : String(v);
function where(a, b) {
  const [x, y] = [words(a), words(b)];
  if (x === y) return 'same words, different formatting (italics, links or notes)';
  let i = 0;
  while (x[i] === y[i]) i++;
  const cut = (s) => JSON.stringify(s.slice(Math.max(0, i - 20), i + 30));
  return `here ${cut(x)} · CMS ${cut(y)}`;
}
let changes = 0;

for (const doc of docs) {
  const issue = doc.slug.current;
  if (!wants(issue)) continue;
  const now = await client.getDocument(doc._id);
  if (!now) {
    console.log(`${issue}: not in the CMS — created whole`);
    changes++;
    if (!dry) await client.createIfNotExists(doc);
    continue;
  }

  const tx = client.transaction();
  const log = [];
  const fill = (path, here, there, label) => {
    if (empty(here) || same(here, there)) return;
    if (!empty(there) && !force) return log.push(`  ${label}: kept, differs — ${where(here, there)}`);
    log.push(`  ${label}: ${empty(there) ? 'filled' : 'overwritten'}`);
    tx.patch(doc._id, (p) => p.set({[path]: here}));
  };

  fill('abstract', doc.abstract, now.abstract, 'issue abstract');

  const keys = new Set((now.contributions ?? []).map((c) => c._key));
  for (const c of doc.contributions) {
    if (!wants(issue, c.slug.current)) continue;
    const there = (now.contributions ?? []).find((x) => x.slug?.current === c.slug.current);
    if (!there) {
      // a fresh key, should this one be taken by another contribution
      let key = c._key;
      for (let n = 0; keys.has(key); n++) key = `${c._key}-${n}`;
      keys.add(key);
      log.push(`  ${c.slug.current}: added`);
      tx.patch(doc._id, (p) =>
        p.setIfMissing({contributions: []}).insert('after', 'contributions[-1]', [{...c, _key: key}])
      );
      continue;
    }
    for (const f of FIELDS)
      fill(`contributions[_key=="${there._key}"].${f}`, c[f], there[f], `${c.slug.current} · ${f}`);
  }

  if (doc.editorial && wants(issue, 'editorial')) {
    if (empty(now.editorial)) {
      log.push('  editorial: filled');
      tx.patch(doc._id, (p) => p.set({editorial: doc.editorial}));
    } else for (const f of EDITORIAL) fill(`editorial.${f}`, doc.editorial[f], now.editorial[f], `editorial · ${f}`);
  }

  const n = tx.toJSON().length;
  console.log(`${issue}: ${n ? `${n} change${n > 1 ? 's' : ''}` : 'nothing to change'}`);
  for (const line of log) console.log(line);
  changes += n;
  if (n && !dry) await tx.commit({autoGenerateArrayKeys: false});
}

console.log(dry ? `\nDry run: ${changes} change(s) would be made.` : `\nDone: ${changes} change(s).`);
