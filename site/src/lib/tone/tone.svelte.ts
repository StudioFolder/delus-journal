/**
 * TONE — the dark or light version of the site
 *
 * The visitor chooses it with the dot at the bottom right of the screen
 * (ToneDot.svelte); it does not depend on the URL.
 * The colours of each tone, and how the change looks, are in styles.css (TONES).
 *
 * The site opens in the tone of the visitor's computer (its light or
 * dark appearance; dark when it says nothing): app.html reads it before
 * the first paint and writes it on <html>, where it is read here.
 *
 * CONTRAST — each tone also has a high-contrast version (desktop only:
 * CONTRAST in styles.css), switched with the dot that appears above the
 * tone's (ContrastDot.svelte). It opens on if the computer asks for
 * more contrast.
 */
export const tones = ['dark', 'light'] as const;
export type Tone = (typeof tones)[number];

// What app.html found on the visitor's computer (nothing while the pages are built)
const start = typeof document === 'undefined' ? undefined : document.documentElement.dataset;

let now = $state<Tone>(start?.tone === 'light' ? 'light' : 'dark'); // the tone the site opens in
let high = $state(start?.contrast === 'high');

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

export const contrast = {
  get high() {
    return high;
  },
  toggle() {
    high = !high;
  }
};
