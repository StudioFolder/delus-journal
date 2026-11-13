/**
 * How things are written out, in one place.
 */
import type {Contribution, Inline, Issue} from './fixtures.ts';

/** A row of credits or details: a label, and one or more lines (some links) */
export type Credit = {label: string; value: {text: string; href?: string; em?: boolean}[]};

/**
 * The URL name made from a title, as the CMS makes it for a contribution
 * (studio: contribution.ts, the same rule): lower case, accents dropped,
 * anything that is not a letter or a figure becomes one hyphen.
 * "Is Façade Landscape?" → "is-facade-landscape"
 */
export const slugOf = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** "Sara Frikech" → "Frikech, Sara" (the last word is taken as the surname) */
export const surnameFirst = (name: string) => name.replace(/^(.*) (\S+)$/, '$2, $1');

/**
 * Names in a row, the first one surname first, as a citation starts:
 * "Breit, Stefan, and Insa Jelena Streit"; three or more: "A, B, and C".
 */
export function nameList(names: string[]): string {
  return names.length > 2
    ? `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
    : names.join(names[0]?.includes(',') ? ', and ' : ' and ');
}

/** The editors of an issue, by name ("Edited by" lists them, comma separated) */
export const editorsOf = (issue: Issue) => issue.publication.editedBy.split(', ');

/** The title of every issue's editorial (CMS: the issue's Editorial field has its own) */
export const editorialTitle = 'A Note from the Editors';

/** Where an article lives: under its issue */
export const articleHref = (issue: Issue, contribution: Contribution) =>
  `/issues/${issue.slug}/${contribution.slug}/`;

/** Where an issue's editorial lives */
export const editorialHref = (issue: Issue) => `/issues/${issue.slug}/editorial/`;

/** Issue numbers always have two digits: 0 → "00", 1 → "01", 12 → "12" */
export const issueNumber = (n: number) => String(n).padStart(2, '0');

/** The label of an issue: "Issue 02" */
export const issueLabel = (n: number) => `Issue ${issueNumber(n)}`;

/** A full date: '2026-11-12' → "12.11.2026" */
export const fullDate = (date: string) => date.split('-').reverse().join('.');

/** A date in words: '2026-11-13' → "November 13, 2026" (Privacy's "Last updated") */
export const longDate = (date: string) =>
  new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });

/** Month and year, as in the news list: '2026-11-12' → "11.2026" */
export const monthYear = (date: string) => fullDate(date.slice(0, 7));

/** An issue's publication details, as rows (empty fields are left out) */
export function issueDetails(issue: Issue): Credit[] {
  const p = issue.publication;
  const rows: Credit[] = [
    {label: 'Edited by', value: editorsOf(issue).map((text) => ({text}))},
    {label: 'Designed by', value: [{text: p.designedBy}]},
    {label: 'Publisher', value: [{text: 'Hatje Cantz', href: p.buyUrl}]},
    // a forthcoming issue: no date yet, the word in italics (as wherever its date would be)
    {label: 'Published', value: [p.forthcoming ? {text: 'forthcoming', em: true} : {text: issue.date}]},
    {label: 'Pages', value: [{text: p.pages}]},
    {label: 'Binding', value: [{text: p.binding}]},
    {label: 'Format', value: [{text: p.format}]}
  ];
  if (p.isbn) rows.push({label: 'ISBN', value: [{text: p.isbn}]});
  if (p.pdfUrl) rows.push({label: 'PDF', value: [{text: 'Open access', href: p.pdfUrl}]});
  return rows;
}

/**
 * How to cite an article (shown under "Cite" while the pointer is on the
 * band, and copied by it), in the Chicago style (bibliography): the first
 * author surname first, the title in quotes, the journal in italics with
 * the issue's number and season, the pages, the DOI as an address.
 *   Breit, Stefan, and Insa Jelena Streit. “Not a Drop Is Lost.” DELUS:
 *   Journal for Landscape and Urban Studies, no. 1 (Autumn 2024): 38–49.
 *   https://doi.org/10.61608/9783775758758-004.
 * As inline pieces (the journal: `em`); `plain()` gives the text to copy.
 * `authors`: the people in their order, with their name and their name
 * for sorting (surname first). The pages run to the page before the next
 * contribution's first one (the last contribution: its first page only)
 * — until the CMS gives the real ones ("Pages"). The editorial is not
 * among the contributions: it comes before the first of them.
 */
export function citationOf(
  issue: Issue,
  contribution: Contribution,
  authors: {name: string; sortName: string}[],
  journal: string
): Inline[] {
  const by = nameList(authors.map((a, i) => (i ? a.name : a.sortName)));
  const title = /[?!]$/.test(contribution.title) ? contribution.title : `${contribution.title}.`;
  const place = issue.contributions.indexOf(contribution); // -1: the editorial, before them all
  const next = issue.contributions[place + 1]?.page;
  const pages = contribution.page
    ? `: ${contribution.page}${next && next - 1 > contribution.page ? `–${next - 1}` : ''}`
    : '';
  const doi = contribution.doi ? ` ${doiUrl(contribution.doi)}.` : '';
  return [`${by}. “${title}” `, {em: journal}, `, no. ${issue.number} (${issue.date})${pages}.${doi}`];
}

/** Inline pieces as plain text (what is copied to the clipboard) */
export const plain = (parts: Inline[]) =>
  parts.map((x) => (typeof x === 'string' ? x : 'em' in x ? x.em : 'link' in x ? x.link : '')).join('');

/** A DOI as an address: '10.61608/…' → "https://doi.org/10.61608/…" */
export const doiUrl = (doi: string) => `https://doi.org/${doi}`;

/** A file's size, as "3.1 MB" (Sanity gives it in bytes) */
export const megabytes = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

/**
 * How to cite a whole issue (the text "Cite" copies on the issue's
 * page), in the same style: the editors, the first surname first, the
 * journal with the issue's number, title and season.
 *   Frikech, Sara, and Johanna Just, eds. DELUS: Journal for Landscape
 *   and Urban Studies 01, Chasing Water (Autumn 2024).
 */
export function issueCitationOf(issue: Issue, journal: string): string {
  const editors = editorsOf(issue);
  const by = nameList(editors.map((name, i) => (i ? name : surnameFirst(name))));
  const named = issue.title === 'DELUS' ? '' : `, ${issue.title}`;
  return `${by}, ${editors.length > 1 ? 'eds' : 'ed'}. ${journal} ${issueNumber(issue.number)}${named} (${issue.date}).`;
}
