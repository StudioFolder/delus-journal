/**
 * TONE — the dark or light version of the site
 *
 * The visitor chooses it with the dot at the bottom right of the screen
 * (ToneDot.svelte); it does not depend on the URL.
 * The colours of each tone, and how the change looks, are in styles.css (TONES).
 */
export const tones = ['dark', 'light'] as const;
export type Tone = (typeof tones)[number];

let now = $state<Tone>('dark'); // the tone the site opens in (also on <html> in app.html, for the first paint)

export const tone = {
  get current() {
    return now;
  },
  /** The tone the dot leads to */
  get next(): Tone {
    return tones[(tones.indexOf(now) + 1) % tones.length];
  },
  toggle() {
    now = tone.next;
  }
};
