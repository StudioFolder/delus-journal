// Puts the figures of the texts into the CMS, with their image files:
// each image is uploaded and its figure placed in the text of its
// contribution (or editors' note), after the paragraph it follows on the
// site, with its letter and caption. Nothing else is touched.
//
// It reads seed/figures.json (written by make-issues.mjs from the site's
// data) and the images folder (its _manifest.json and the files named as
// its checklists say: DELUS01_redoute_A.jpg …):
//
//   cd studio
//   node seed/make-issues.mjs
//   npx sanity exec seed/update-figures.mjs --with-user-token -- <what> [--dry-run] [--force] [--images=<folder>]
//
// what:        an issue (01-chasing-water) or one piece of it
//              (01-chasing-water/the-draining-of-the-fens-…; …/editorial).
//              Several can be given. Nothing = everything.
// --dry-run:   only says what it would do (nothing is uploaded).
// --force:     also replaces the image, letter and caption of a figure
//              that is already in the CMS (without it, such a figure is
//              left as it is — so what was changed in the Studio is kept;
//              only a figure still without an image gets its file).
// --images:    the images folder, if it is not where it was made.
//
// A figure is known in the CMS by its key (fig0, fig1 … in the order of
// the site's text), so the script can be run again as more files arrive:
// it adds what is missing. A figure whose file isn't in the folder yet is
// skipped and reported. A figure whose paragraph is no longer in the CMS
// (the text was rearranged in the Studio) is reported, to be placed by hand.
// An image already uploaded is not uploaded twice (the CMS knows a file
// it has).
//
// A piece's cover image (the one that stands for it in the issue's
// contents): <prefix>_entry.<jpg…> in its folder, if there is one, goes into
// its Cover image field — only when that field is empty (or with --force).
// Without such a file the field is left alone: to use one of the piece's
// figures, pick it in the Studio (Select → Browse).
import {createReadStream, existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {getCliClient} from 'sanity/cli';

const args = process.argv.slice(2);
const force = args.includes('--force');
const dry = args.includes('--dry-run');
const ROOT =
  args.find((a) => a.startsWith('--images='))?.slice(9) ??
  process.env.DELUS_IMAGES ??
  '/Users/marcoferrari/Folder/Folder_WORKS/2026_ETH_Delus Website/00_Materials/images';
const wanted = args.filter((a) => !a.startsWith('--')).map((a) => a.replace(/^\/|\/$/g, '').split('/'));
// (an issue is wanted when it, or one of its pieces, was asked for)
const wants = (issue, slug) => !wanted.length || wanted.some(([i, s]) => i === issue && (!s || !slug || s === slug));

if (!existsSync(join(ROOT, '_manifest.json'))) {
  console.error(`No images folder at ${ROOT} (give it with --images=…)`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(join(ROOT, '_manifest.json'), 'utf8'));
const figures = JSON.parse(readFileSync(new URL('figures.json', import.meta.url), 'utf8'));
const client = getCliClient({apiVersion: '2025-01-01'});

// The file of a figure: <folder of the piece>/<prefix>_<letter or number>.<jpg…>
const KINDS = /\.(jpe?g|png|tiff?|webp|svg)$/i; // (an SVG: a drawing exported from the print PDF)
function fileOf(issue, slug, end) {
  const piece = manifest.issues.find((x) => x.slug === issue)?.pieces.find((x) => x.slug === slug);
  if (!piece) return {};
  const dir = join(ROOT, issue, piece.folder);
  const name = `${piece.prefix}_${end}`;
  const found = existsSync(dir) && readdirSync(dir).find((f) => KINDS.test(f) && f.replace(KINDS, '') === name);
  return {name, path: found && join(dir, found), file: found};
}
const mb = (path) => `${(statSync(path).size / 1e6).toFixed(1)} MB`;
const upload = async (path, file) =>
  (await client.assets.upload('image', createReadStream(path), {filename: file}))._id;

let changes = 0;
let missing = 0;
for (const entry of figures) {
  if (!wants(entry.issue)) continue;
  const now = await client.getDocument(entry._id);
  if (!now) {
    console.log(`${entry.issue}: not in the CMS — run update-contributions.mjs first`);
    continue;
  }
  const tx = client.transaction();
  const log = [];
  let n = 0;
  for (const piece of entry.pieces) {
    if (!wants(entry.issue, piece.slug)) continue;
    const there =
      piece.slug === 'editorial' ? now.editorial : (now.contributions ?? []).find((c) => c.slug?.current === piece.slug);
    const base = piece.slug === 'editorial' ? 'editorial' : `contributions[_key=="${there?._key}"]`;
    const text = there?.text ?? [];
    if (!text.length) {
      log.push(`  ${piece.slug}: no text in the CMS yet — run update-contributions.mjs first`);
      continue;
    }
    const has = (key) => text.some((b) => b._key === key);
    // the cover image, from <prefix>_entry
    const cover = fileOf(entry.issue, piece.slug, 'entry');
    if (cover.path && (!there.cover?.asset || force)) {
      log.push(`  ${piece.slug} · cover image ${there.cover?.asset ? 'replaced' : 'set'} ← ${cover.file} (${mb(cover.path)})`);
      n++;
      if (!dry) {
        const asset = {_type: 'reference', _ref: await upload(cover.path, cover.file)};
        tx.patch(entry._id, (p) => p.set({[`${base}.cover`]: {_type: 'image', asset}}));
      }
    } else if (cover.path) log.push(`  ${piece.slug} · cover image: kept (already in the CMS)`);
    // where the last figure went, per paragraph: the next one of the same paragraph follows it
    const last = {};
    for (const f of piece.figures) {
      const key = `fig${f.n}`;
      const what = `${piece.slug} · ${f.label ? `figure ${f.label}` : `image ${f.file}`}`;
      const {name, path, file} = fileOf(entry.issue, piece.slug, f.file);
      const existing = text.find((b) => b._key === key);
      const anchor = last[f.after] ?? f.after;
      if (existing) last[f.after] = key;
      if (existing?.asset && !force) {
        log.push(`  ${what}: kept (already in the CMS)`);
        continue;
      }
      if (!path) {
        missing++;
        log.push(`  ${what}: no file yet (${name ?? 'not in the images folder\'s list'}.jpg)`);
        continue;
      }
      const fields = {...(f.label && {label: f.label}), ...(f.caption && {caption: f.caption})};
      if (existing) {
        // its image (and, forced, its letter and caption again)
        log.push(`  ${what}: ${existing.asset ? 'replaced' : 'image added'} ← ${file} (${mb(path)})`);
        n++;
        if (dry) continue;
        const asset = {_type: 'reference', _ref: await upload(path, file)};
        tx.patch(entry._id, (p) =>
          p.set({[`${base}.text[_key=="${key}"].asset`]: asset, ...(force && Object.fromEntries(Object.entries(fields).map(([k, v]) => [`${base}.text[_key=="${key}"].${k}`, v])))})
        );
        continue;
      }
      if (anchor !== null && !has(anchor) && !Object.values(last).includes(anchor)) {
        log.push(`  ${what}: its paragraph is no longer in the CMS — place it by hand (${file})`);
        continue;
      }
      log.push(`  ${what}: placed ← ${file} (${mb(path)})`);
      n++;
      last[f.after] = key;
      if (dry) continue;
      const block = {_type: 'figure', _key: key, asset: {_type: 'reference', _ref: await upload(path, file)}, ...fields};
      tx.patch(entry._id, (p) =>
        anchor === null
          ? p.insert('before', `${base}.text[0]`, [block])
          : p.insert('after', `${base}.text[_key=="${anchor}"]`, [block])
      );
    }
  }
  console.log(`${entry.issue}: ${n ? `${n} figure${n > 1 ? 's' : ''}` : 'nothing to change'}`);
  for (const line of log) console.log(line);
  changes += n;
  if (n && !dry) await tx.commit({autoGenerateArrayKeys: false});
}
console.log(
  (dry ? `\nDry run: ${changes} figure(s) would be placed or changed.` : `\nDone: ${changes} figure(s).`) +
    (missing ? ` ${missing} without a file yet.` : '')
);
