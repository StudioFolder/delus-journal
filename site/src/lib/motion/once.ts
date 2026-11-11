/**
 * ONCE — for things that happen only the first time in a visit
 * (e.g. the home intro). The memory lasts until the site is reloaded.
 */
const played = new Set<string>();

export const hasPlayed = (name: string) => played.has(name);
export const markPlayed = (name: string) => void played.add(name);
