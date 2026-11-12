/**
 * "Navel Gazing" by Yumna Al-Arashi — DELUS Issue 01, pp. 8–11. A photo
 * essay: the artist's own short text (the whole of it, from the printed
 * PDF) and her five photographs, in the order of the pages, in their
 * printed proportions. The text doesn't refer to them, so they have no
 * letters; they have no captions either (the one line the print sets
 * for all of them, "All images by the author, 2023.", is left out).
 * Shaped as Sanity's rich text will be (see Block in fixtures.ts).
 */
import type {Block} from '../fixtures.ts';

export const body: Block[] = [
  'A glacier, a dam, a navel. I gaze into my own navel, which expands to the infinite loops of life and death, both natural and human-made. Navel-gazing, deriving from the Greek words ὀμφᾰλός [navel] and σκέψῐς [speculation], refers to the act of using one’s own navel to contemplate the cosmos. However, if viewed in excess, the gazing can lead to self-absorbed, narcissistic pursuits. Like the building of a reservoir, navel-gazing involves considering the source of life – a glacier, the navel – and treads a fragile balance between renewal and destruction. I use the dying glacier, the artificial lake and the rivers that flow out of them to contemplate our future co-existence with nature, constantly teetering on the edge between life and death, good and bad, past and future. These opposites are manifested through the visual tension between concrete and earth.',
  {figure: {ratio: 1.77, caption: []}},
  {figure: {ratio: 0.762, caption: []}},
  {figure: {ratio: 0.744, caption: []}},
  {figure: {ratio: 0.757, caption: []}},
  {figure: {ratio: 1.792, caption: []}}
];
