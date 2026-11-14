/**
 * SEARCH — finding
 *
 * find(entries, 'water fens') gives the entries that have every word of
 * the query, the best first. A word is found where a word of the entry
 * begins with it ("wat" finds "water", not "freshwater"); capitals and
 * accents don't count ("redoute" finds "Redouté").
 *
 * Order: a word found in the title counts most, then in the people,
 * then in the text; equal entries keep the order of the list (the
 * newest issue first). The label over a result ("Issue 01", "Event")
 * is not looked through: it says where the result is, it is not found.
 *
 * A result comes with its title and its people in pieces, the words
 * found marked (`hit`). One whose words are not all in its title and
 * people also comes with a passage of its text around the first word
 * found there, cut at whole words, marked in the same way.
 * `count`: how many times the words are found in it — title, people
 * and text together.
 */
import type {Entry} from './index.ts';

export type Piece = {text: string; hit?: boolean};
export type Result = Entry & {titled: Piece[]; named: Piece[]; passage?: Piece[]; count: number};

// How much of the text is shown before and after the word found
const BEFORE = 50;
const AFTER = 110;

// A text without capitals and accents, and for each of its letters
// where it stands in the original
function fold(s: string) {
  let out = '';
  const at: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const letters = s[i].normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    for (const letter of letters) {
      out += letter;
      at.push(i);
    }
  }
  at.push(s.length);
  return {out, at};
}

const plainOf = (s: string) => fold(s).out;

/** The words of a query */
export const wordsOf = (query: string) => plainOf(query).match(/[\p{L}\p{N}]+/gu) ?? [];

// A word, where a word begins — and that whole word, to its end
// ("wat" finds, and marks, "waterlogged")
const starting = (word: string) => new RegExp(`(?<![\\p{L}\\p{N}])${word}[\\p{L}\\p{N}]*`, 'gu');

type Ready = {entry: Entry; title: string; by: string; text: ReturnType<typeof fold>};
const ready = new WeakMap<Entry[], Ready[]>();

// The entries, folded once
function prepare(entries: Entry[]) {
  let list = ready.get(entries);
  if (!list) {
    list = entries.map((entry) => ({
      entry,
      title: plainOf(entry.title),
      by: plainOf(entry.by),
      text: fold(entry.text)
    }));
    ready.set(entries, list);
  }
  return list;
}

export function find(entries: Entry[], query: string): Result[] {
  const words = wordsOf(query);
  if (!words.length) return [];
  const found: {result: Result; score: number; place: number}[] = [];

  prepare(entries).forEach((x, place) => {
    let score = 0;
    let named = true; // every word is in the title or the people
    for (const word of words) {
      const re = starting(word);
      const inTitle = re.test(x.title);
      const inBy = ((re.lastIndex = 0), re.test(x.by));
      const inText = ((re.lastIndex = 0), re.test(x.text.out));
      if (!(inTitle || inBy || inText)) return;
      score += (inTitle ? 8 : 0) + (inBy ? 6 : 0) + (inText ? 1 : 0);
      if (!(inTitle || inBy)) named = false;
    }
    const passage = named ? undefined : passageOf(x.entry.text, x.text, words);
    const titled = marked(x.entry.title, words);
    const by = marked(x.entry.by, words);
    const count =
      [...titled, ...by].filter((piece) => piece.hit).length + placesOf(x.entry.text, words).length;
    found.push({result: {...x.entry, titled, named: by, passage, count}, score, place});
  });

  return found.sort((a, b) => b.score - a.score || a.place - b.place).map((x) => x.result);
}

/**
 * Every word of a text that begins with a word of the query: [from, to],
 * in the text as it is written, in their order
 */
export function placesOf(text: string, words: string[]) {
  const {out, at} = fold(text);
  const places: [from: number, to: number][] = [];
  for (const word of words)
    for (const m of out.matchAll(starting(word)))
      places.push([at[m.index], at[m.index + m[0].length - 1] + 1]);
  return places.sort((a, b) => a[0] - b[0]);
}

/** A text in pieces, the words of the query marked */
export function marked(text: string, words: string[]): Piece[] {
  const pieces: Piece[] = [];
  let i = 0;
  for (const [from, to] of placesOf(text, words)) {
    if (from < i) continue;
    if (from > i) pieces.push({text: text.slice(i, from)});
    pieces.push({text: text.slice(from, to), hit: true});
    i = to;
  }
  if (i < text.length) pieces.push({text: text.slice(i)});
  return pieces;
}

// The text around the first word found in it, with the words marked
function passageOf(text: string, folded: ReturnType<typeof fold>, words: string[]) {
  const {out, at} = folded;
  // Every place where a word of the query begins, in the original text
  const hits: [from: number, to: number][] = [];
  for (const word of words)
    for (const m of out.matchAll(starting(word)))
      hits.push([at[m.index], at[m.index + m[0].length - 1] + 1]);
  if (!hits.length) return;
  hits.sort((a, b) => a[0] - b[0]);

  // Within the paragraph of the first one, from a word's start to a word's end
  const [first] = hits[0];
  const paragraphStart = text.lastIndexOf('\n', first) + 1;
  const paragraphEnd = (text.indexOf('\n', first) + 1 || text.length + 1) - 1;
  let from = Math.max(paragraphStart, first - BEFORE);
  let to = Math.min(paragraphEnd, first + AFTER);
  if (from > paragraphStart) from = text.indexOf(' ', from) + 1 || from;
  if (to < paragraphEnd) to = text.lastIndexOf(' ', to) > first ? text.lastIndexOf(' ', to) : to;

  const pieces: Piece[] = [];
  let i = from;
  if (from > paragraphStart) pieces.push({text: '… '});
  for (const [a, b] of hits) {
    if (a < i || b > to) continue;
    if (a > i) pieces.push({text: text.slice(i, a)});
    pieces.push({text: text.slice(a, b), hit: true});
    i = b;
  }
  if (i < to) pieces.push({text: text.slice(i, to)});
  if (to < paragraphEnd) pieces.push({text: ' …'});
  return pieces;
}
