/**
 * STILL — the visitor has asked for reduced motion: what would travel
 * or slide changes at once instead. Asked each time (it can change
 * while the site is open).
 *
 *   if (still()) …            scrollTo({behavior: still() ? 'auto' : 'smooth'})
 */
export const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
