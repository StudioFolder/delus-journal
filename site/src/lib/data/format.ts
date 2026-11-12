/**
 * How things are written out, in one place.
 */
import type {Issue} from './fixtures.ts';

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
