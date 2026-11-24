/**
 * "Bordoclima: New Calligraphies of Fluid Borders" by Lucia Rebolino and
 * Federica Pessotto — DELUS Issue 01, pp. 66–73. A photo essay: the whole text, from
 * the printed PDF: 5 paragraphs, italics, note references and the 1
 * note. Shaped as Sanity's rich text will be (see Block in fixtures.ts).
 */
import type {Block, Inline} from '../fixtures.ts';

export const abstract =
  'Lucia Rebolino and Federica Pessotto challenge the notion of fixed borders within contemporary geopolitics by conceptualizing them as dynamic entities. Their approach advocates the sovereignty of water in shaping borders and proposes a fluid understanding characterized by constant change and permeability.';

export const body: Block[] = [
  'Bordoclima experiments with the concept of borders in modern geopolitics and environmental dynamics. Using new methods and cartographic expressions, it focuses on the idea of moving borders, recognizing the sovereignty of water and air in shaping these boundaries. By applying principles from fluid dynamics, Bordoclima transforms static borders into dynamic entities composed of fluid elements in continuous motion. These borders are categorized as two types: the liquid type, which include water bodies such as rivers, glaciers and oceans; and the gaseous type, encompassing air and the atmosphere.',
  {figure: {ratio: 1.01, caption: ['Land that sleeps underwater. The liquid layer of the globe, subject to flooding and bathymetry, serves as the locus of the helix and a territorial palimpsest of human traces that decompose while breaking down into liquid.']}},
  'In this framework, borders acquire a three-dimensional aspect characterized by dynamism, permeability and indivisibility. This approach recognizes the constant state of change and movement inherent in physical borders, akin to natural processes of water erosion and decomposition. The interaction between humans and fluid borders, especially rivers, evolves over time, reflecting the interplay of natural and artificial territorial demarcations.',
  'These new dynamic models of borders involve the use of a new ‘calligraphic’ language capable of generating new aesthetic and performative forms of landscape. Ecology is seen as a science of possibilities, not as a discipline that defines definitive spatial outcomes. The tools and methods of landscape ecology are used and tested to map and simulate the movement of borders through complex software and data analysis. These critical tools can trace global and local phenomena, considering the outcome of an ecological project as a probabilistic and non-deterministic scenario.',
  'The borders of the Balkans, as they mostly overlap with fluid bodies, become a territory of experimentation where interference and disturbance take the form of holograms representing conflict – both political and ecological.',
  ['In the “New Climatic Regime,”', {note: 1}, ' Bordoclima challenges the traditional architectural perspective of borders as static and rigid. It proposes a paradigm in which ecological and geopolitical boundaries are in continuous fluctuation. This shift necessitates new methodological and design approaches, accommodating the fluid and ever-changing nature of borders in a world facing ecological challenges and climate crisis. •'],
  {figure: {ratio: 1.39, caption: ['The master plan of the Balkans. A mapping of ecological and social fragilities and holograms of conflict, interacting with the fluid dimension of the border. The boundary rejects linear and static logic and includes elements outside the visible geopolitical realm, such as water and air boundaries. In so doing, it introduces the concept of a fluid border on the map; related geopolitical phenomena can be traced back to graphic semiology.']}},
  {figure: {ratio: 0.69, caption: ['Cards from the atmosphere. Air borders are virtual limits in space, yet they fall under state jurisdiction and are regulated by international agreements and treaties similar to those used to govern territories. Alternative cartographies of the air can enable the modelling of its dynamics, creating future scenarios and producing alternative projects suspended in the biosphere.']}},
  {figure: {ratio: 0.61, caption: ['Albania–Montenegro fluid border']}},
  {figure: {ratio: 0.61, caption: ['Croatia–Bosnia Herzegovina fluid border']}},
  {figure: {ratio: 1.42, caption: ['Velika Kladusa – Glina River. The river acts as a moving ecological corridor used by migrants to travel along the border. This town, located in Bosnia, is marked by a severe migration crisis that has long affected the Balkan Route.']}},
  {figure: {ratio: 1.43, caption: ['Slavonski Brod – Sava River. This fragmented spot in Croatia is characterized by a hybrid fluid regime, composed of both natural liquid overflows and gas emissions from the air pollution of the old oil refinery in the Bosnian town of Bosanski Brod.']}},
  {figure: {ratio: 1.43, caption: ['A new topography of the border. This fragmented spot in Croatia exhibits a hybrid fluid regime, marked by overflows in both liquid and gas forms, caused by water flooding and the pervasive air pollution stemming from the old oil refinery in the Bosnian town of Bosanski Brod, which expands as a gradient over the border.']}}
];

// The notes, in order: notes[0] is note 1
export const notes: Inline[][] = [
  ['Bruno Latour, ', {em: 'Down to Earth: Politics in the New Climatic Regime'}, ' (Cambridge, UK: Polity Press, 2018).']
];
