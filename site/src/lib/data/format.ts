/**
 * How things are written out, in one place.
 */

/** Issue numbers always have two digits: 0 → "00", 1 → "01", 12 → "12" */
export const issueNumber = (n: number) => String(n).padStart(2, '0');

/** The label of an issue: "Issue 02" */
export const issueLabel = (n: number) => `Issue ${issueNumber(n)}`;
