/**
 * How things are written out, in one place.
 */
import type {Contribution, Issue} from './fixtures.ts';

/** A row of credits or details: a label, and one or more lines (some links) */
export type Credit = {label: string; value: {text: string; href?: string}[]};

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

/** Issue numbers always have two digits: 0 → "00", 1 → "01", 12 → "12" */
export const issueNumber = (n: number) => String(n).padStart(2, '0');

/** The label of an issue: "Issue 02" */
export const issueLabel = (n: number) => `Issue ${issueNumber(n)}`;

/** A full date: '2026-11-12' → "12.11.2026" */
export const fullDate = (date: string) => date.split('-').reverse().join('.');

/** Month and year, as in the news list: '2026-11-12' → "11.2026" */
export const monthYear = (date: string) => fullDate(date.slice(0, 7));

/** An issue's publication details, as rows (empty fields are left out) */
export function issueDetails(issue: Issue): Credit[] {
  const p = issue.publication;
  const rows: Credit[] = [
    {label: 'Edited by', value: p.editedBy.split(', ').map((text) => ({text}))},
    {label: 'Designed by', value: [{text: p.designedBy}]},
    {label: 'Publisher', value: [{text: 'Hatje Cantz', href: p.buyUrl}]},
    {label: 'Published', value: [{text: p.forthcoming ? `Forthcoming, ${issue.date}` : issue.date}]},
    {label: 'Pages', value: [{text: p.pages}]},
    {label: 'Binding', value: [{text: p.binding}]},
    {label: 'Format', value: [{text: p.format}]}
  ];
  if (p.isbn) rows.push({label: 'ISBN', value: [{text: p.isbn}]});
  if (p.pdfUrl) rows.push({label: 'PDF', value: [{text: 'Open access', href: p.pdfUrl}]});
  return rows;
}

/**
 * How to cite an article (the text "Cite" copies), after the Chicago
 * style of the printed notes: the first author surname first, the title
 * in quotes, the journal with the issue's number, title and season, the
 * pages.
 *   Breit, Stefan, and Insa Jelena Streit. “Not a Drop Is Lost.” DELUS:
 *   Journal for Landscape and Urban Studies 01, Chasing Water (Autumn
 *   2024): 38–49.
 * `authors`: the people in their order, with their name and their name
 * for sorting (surname first). The pages run to the page before the next
 * contribution's first one (the last contribution: its first page only)
 * — until the CMS gives the real ones ("Pages").
 */
export function citationOf(
  issue: Issue,
  contribution: Contribution,
  authors: {name: string; sortName: string}[],
  journal: string
): string {
  const names = authors.map((a, i) => (i ? a.name : a.sortName));
  const by =
    names.length > 2
      ? `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
      : names.join(names[0]?.includes(',') ? ', and ' : ' and ');
  const title = /[?!]$/.test(contribution.title) ? contribution.title : `${contribution.title}.`;
  const next = issue.contributions[issue.contributions.indexOf(contribution) + 1]?.page;
  const pages = contribution.page
    ? `: ${contribution.page}${next && next - 1 > contribution.page ? `–${next - 1}` : ''}`
    : '';
  const named = issue.title === 'DELUS' ? '' : `, ${issue.title}`;
  return `${by}. “${title}” ${journal} ${issueNumber(issue.number)}${named} (${issue.date})${pages}.`;
}

/**
 * How to cite a whole issue (the text "Cite" copies on the issue's
 * page), in the same style: the editors, the first surname first, the
 * journal with the issue's number, title and season.
 *   Frikech, Sara, and Johanna Just, eds. DELUS: Journal for Landscape
 *   and Urban Studies 01, Chasing Water (Autumn 2024).
 */
export function issueCitationOf(issue: Issue, journal: string): string {
  const editors = issue.publication.editedBy.split(', ');
  const names = editors.map((name, i) => (i ? name : name.replace(/^(.*) (\S+)$/, '$2, $1')));
  const by =
    names.length > 2
      ? `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
      : names.join(', and ');
  const named = issue.title === 'DELUS' ? '' : `, ${issue.title}`;
  return `${by}, ${editors.length > 1 ? 'eds' : 'ed'}. ${journal} ${issueNumber(issue.number)}${named} (${issue.date}).`;
}
