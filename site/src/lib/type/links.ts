/**
 * LINKS TO OTHER SITES open in a new tab (Marco's rule, for every link).
 * Spread the result on the link: <a {href} {...opens(href)}>
 * Links within the site are written from the root ("/issues/") and email
 * links start with "mailto:", so only http(s) addresses get a new tab.
 */
export function opens(href: string) {
  return /^https?:\/\//i.test(href) ? {target: '_blank', rel: 'noopener noreferrer'} : {};
}
