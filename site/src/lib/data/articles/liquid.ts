/**
 * "Liquid Shadows" by Valentina Noce — DELUS Issue 01, pp. 32–37. A
 * photo essay. The whole text, from the printed PDF: 2 paragraphs,
 * italics, note references and the 1 note.
 * Its five images in the order of the pages, in their printed
 * proportions (no image yet). The text doesn't refer to them, so they
 * have no letter; each carries the one caption the print sets for all of
 * them ("All images: …"). The print has note 1 in the margin but no
 * number in the text: here it stands after the first sentence, which it
 * documents.
 * Shaped as Sanity's rich text will be (see Block in fixtures.ts).
 */
import type {Block, Inline} from '../fixtures.ts';

export const abstract =
  'Valentina Noce ventures into the eerie realm of water, drawing parallels to Pascal’s abyss. Through ‘Liquid Shadows,’ she creates a digital odyssey, exploring water’s unsettling essence, mysterious allure and haunting ambiguity.';

export const body: Block[] = [
  ['The anecdote of ‘Pascal’s abyss’ traces a discourse around the construction of fear and anxiety in a critical space.', {note: 1}, ' Allegedly, after an accident in 1654, French mathematician, inventor and philosopher Blaise Pascal (1623–1662) was haunted by a horrific void at his side. From this obsession, reflection on the void evolved into a theoretical examination of the ambiguity of blank space and shadow. Amplifying the compendium on the discourse on void and fear, ', {em: 'water'}, ' – as a spatial stage of unease – assimilates and recalls the grammar of Pascal’s abyss.'],
  {figure: {ratio: 0.61, caption: ['Collage. Sabotage Practice / Valentina Noce, 2024.']}},
  {figure: {ratio: 0.61, caption: ['Collage. Sabotage Practice / Valentina Noce, 2024.']}},
  {figure: {ratio: 0.61, caption: ['Collage. Sabotage Practice / Valentina Noce, 2024.']}},
  {figure: {ratio: 0.61, caption: ['Collage. Sabotage Practice / Valentina Noce, 2024.']}},
  {figure: {ratio: 0.61, caption: ['Collage. Sabotage Practice / Valentina Noce, 2024.']}},
  ['The narrative of the unsettling and uncanny qualities of water unfolds spaces made up of flowing ghosts, foggy mermaids, wet ', {em: 'doppelgängers'}, '. Observing a reflection in the water that fails to mirror its source, the project ‘Liquid Shadows’ reports the unforeseen, moving void within it. Running a digital homeopathic operation, the images accumulate into a visual realm created through repetition, scanning, layering, stretching and edulcorating – portraying water as an unsettling and unhomely space. These visuals suggest the inherent ambiguity of water. Closely observing water generates an archive of uncertain, disguised, liquid shadows. •']
];

// The notes, in order: notes[0] is note 1
export const notes: Inline[][] = [
  ['Anthony Vidler, ', {em: 'Warped Space'}, ' (Cambridge, MA: MIT Press, 2002).']
];
