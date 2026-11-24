import {articleHref, slugOf, type Credit} from './format.ts';
import * as bordoclima from './articles/bordoclima.ts';
import * as breit from './articles/breit.ts';
import * as dam from './articles/dam.ts';
import * as desal from './articles/desal.ts';
import * as editorial00 from './articles/editorial00.ts';
import * as editorial01 from './articles/editorial01.ts';
import * as embroidered from './articles/embroidered.ts';
import * as feminist from './articles/feminist.ts';
import * as liquid from './articles/liquid.ts';
import * as melting from './articles/melting.ts';
import * as mentalk from './articles/mentalk.ts';
import * as navel from './articles/navel.ts';
import * as redoute from './articles/redoute.ts';
import * as rivers from './articles/rivers.ts';
import * as salted from './articles/salted.ts';
import * as speculative from './articles/speculative.ts';
import * as thirst from './articles/thirst.ts';
import * as trap from './articles/trap.ts';

// The issues. `date` is how the issue is dated in print (season and year).
// The abstracts are the publisher's and the editors' texts (Marco, 24 Nov).
// `publication`: the Publication fields of the CMS — the standard colophon
// of every issue (Marco, 15 Nov): editors, the credits of the printed
// issue as in its colophon, publisher, date, pages, format, language,
// ISBN, PDF. ISBNs, Hatje Cantz links and the open-access PDF are real
// (from the holding page); the credits and pages of Issues 00 and 01 are
// from their printed colophons (Marco), Issue 01's format too; the rest
// are placeholders (Issue 02: no credits yet).
const placeholder = {pages: '000', format: '000 × 000 mm'};
// A line of the colophon: a name, or a name with its site's address
export type CreditLine = string | {text: string; href: string};
const editors = 'Sara Frikech, Johanna Just';
// The text of a contribution, as Sanity's rich text: blocks of inline
// pieces — plain text, italics (Sanity: the Italic decorator) and note
// references (the Footnote annotation; the notes themselves are kept on
// the contribution) and links (the Link annotation: the words that carry
// it and its address — within the site written from the root, as
// "/issues/01-chasing-water/liquid-shadows/"). Line breaks typed in a
// block are kept.
export type Inline = string | {em: string} | {link: string; href: string} | {note: number};
// A figure of an article: its letter, as the text refers to it (FIG. A)
// — none when the text doesn't refer to its figures (an editors' note,
// a visual essay) —,
// its proportions (width / height; Sanity knows them from the image) and
// its caption. No image yet: the site shows an empty box.
// An image file: its address and its size in pixels (Sanity: an image's
// asset; drawn by #lib/image/Picture.svelte, inside its box)
export type Img = {url: string; width: number; height: number};
// (`image`: none until the figure has its file — its box is drawn all the same)
export type Figure = {label?: string; ratio: number; caption: Inline[]; image?: Img};
// A block: a paragraph (a plain string, or inline pieces), a quote
// (Sanity: the Quote style), a chapter title (Sanity: the Heading style)
// or a figure (Sanity: an image between two paragraphs), placed after the
// paragraph that refers to it.
export type Block =
  | string
  | Inline[]
  | {quote: string | Inline[]}
  | {heading: string}
  | {figure: Figure};

// One entry of an issue's table of contents (Sanity's contribution):
// its title, its URL name (`slug`, made from the title as the CMS does:
// the article is at /issues/<issue>/<slug>/), its people (slugs of `people`, below), its first page, its
// abstract (Sanity: `abstract`; from the printed issues), its text
// (`body`; Sanity: the contribution's `text` — two essays of Issue 01 have it, the others
// show title and abstract only) and its notes (`notes[0]` = note 1).
// `kind`: a photo essay — images first — has a layout of its own (the
// images large, in the column; see the article's page). Anything else
// is an essay (Sanity: the contribution's Type).
export type Contribution = {
  title: string;
  slug: string;
  people: string[];
  kind?: 'photoEssay';
  page?: number;
  pdf?: string; // the address of the article's PDF (Sanity: a file; none yet)
  pdfSize?: number; // its size in bytes (Sanity: the file's size)
  doi?: string; // as registered by the publisher, without https://doi.org/ (shown under Cite)
  abstract?: string | Inline[]; // plain, or pieces when it has italics
  body?: Block[];
  notes?: Inline[][];
};


export type Issue = {
  slug: string;
  number: number;
  title: string;
  date: string;
  abstract: string | Inline[]; // plain text, or with italics
  // The editorial ("A Note from the Editors"): its text and notes, as a
  // contribution's (Sanity: the issue's Editorial field). Issue 01 only, so far.
  // `page`: its first page in print. `doi`: as a contribution's (Issue 00
  // has only that, so far).
  editorial?: {page?: number; doi?: string; body?: Block[]; notes?: Inline[][]};
  publication: {
    editedBy: string; // "Editors"
    designedBy: string; // "Graphic design"
    designedByUrl?: string; // its site
    publisher?: string; // the colophon's row, and the issue's citation
    publisherPlace?: string; // its city, for the citation (Chicago: "Berlin: Hatje Cantz")
    // The credits of the printed issue, as in its colophon (each a line
    // or more, a line a link where it has an address; a row only where
    // filled in)
    projectManagement?: CreditLine[];
    copyediting?: CreditLine[];
    proofreading?: CreditLine[];
    production?: CreditLine[];
    reproductions?: CreditLine[];
    printing?: CreditLine[]; // "Printing"
    pages: string;
    format: string;
    language?: string;
    isbn?: string;
    doi?: string; // of the whole issue
    buyUrl?: string;
    pdfUrl?: string;
    forthcoming: boolean;
  };
  contributions: Contribution[];
};

// The entries as written below, without their URL names, which are made
// from the titles
type Entry = Omit<Contribution, 'slug'>;
const withSlugs = (list: Entry[]): Contribution[] => list.map((c) => ({...c, slug: slugOf(c.title)}));

// The tables of contents, from the printed issues (Issue 02: order as
// given by the editors, no page numbers yet)
const contents0: Entry[] = [
  {
    title: 'Salted Waters: Cooking, Land and Resistance',
    people: ['luiza-prado-de-o-martins'],
    page: 10,
    doi: '10.61608/9783775756372-001',
    ...salted // the whole text, from the printed issue
  },
  {
    title: 'Rivers, Sturgeons and Dragons',
    people: ['christina-gruber'],
    page: 16,
    doi: '10.61608/9783775756372-002',
    ...rivers // the whole text, from the printed issue
  },
  {
    title: 'Feminist Responses to the Prolonged Colonialities of Exploited Landscapes',
    people: ['karin-reisinger'],
    page: 34,
    doi: '10.61608/9783775756372-003',
    ...feminist // the whole text, from the printed issue
  },
  {
    title: 'Melting Ecologies',
    people: ['institute-for-postnatural-studies'],
    page: 46,
    doi: '10.61608/9783775756372-004',
    kind: 'photoEssay',
    ...melting // the whole piece, from the printed issue
  },
  {
    title: 'Speculative Ecologies: The Future of Urban Wastelands',
    people: ['sandra-jasper'],
    page: 56,
    doi: '10.61608/9783775756372-005',
    ...speculative // the whole text, from the printed issue
  },
  {
    title: 'The Trap of Time: Prototyping a Summer School',
    people: ['federico-perez-villoro'],
    page: 66,
    doi: '10.61608/9783775756372-006',
    ...trap // the whole text, from the printed issue
  }
];
const contents1: Entry[] = [
  {
    title: 'Navel Gazing',
    people: ['yumna-al-arashi'],
    page: 8,
    doi: '10.61608/9783775758758-navel',
    kind: 'photoEssay',
    ...navel // the whole piece, from the printed issue
  },
  {
    title: 'The Draining of the Fens: Enclosures, Resistance and Wilderness',
    people: ['mathilde-redoute'],
    page: 14,
    doi: '10.61608/9783775758758-001',
    pdfSize: 3_100_000, // a placeholder: no PDF yet
    ...redoute // the whole text, from the printed issue
  },
  {
    title: 'Embroidered Waterscapes: Unpacking Relationships Through Artisanal Map-making',
    people: ['akshar-gajjar', 'bhavya-jain'],
    page: 24,
    doi: '10.61608/9783775758758-002',
    ...embroidered // the whole text, from the printed issue
  },
  {
    title: 'Liquid Shadows',
    people: ['valentina-noce'],
    page: 32,
    doi: '10.61608/9783775758758-003',
    kind: 'photoEssay',
    ...liquid // the whole piece, from the printed issue
  },
  {
    title: 'Not a Drop Is Lost',
    people: ['stefan-breit', 'insa-jelena-streit'],
    page: 38,
    doi: '10.61608/9783775758758-004',
    pdfSize: 4_600_000, // a placeholder: no PDF yet
    ...breit // the whole text, from the printed issue
  },
  {
    title: 'On Thirst: Anecdotes on Chasing the Waters',
    people: ['elnaz-najar-najafi', 'negar-sanaan-bensi'],
    page: 50,
    doi: '10.61608/9783775758758-005',
    ...thirst // the whole text, from the printed issue
  },
  {
    title: 'Men Talk but the Women Fetch the Water',
    people: ['stavroula-michael'],
    page: 58,
    doi: '10.61608/9783775758758-006',
    ...mentalk // the whole text, from the printed issue
  },
  {
    title: 'Bordoclima: New Calligraphies of Fluid Borders',
    people: ['lucia-rebolino', 'federica-pessotto'],
    page: 66,
    doi: '10.61608/9783775758758-007',
    kind: 'photoEssay',
    ...bordoclima // the whole piece, from the printed issue
  },
  {
    title: 'Desalination and a New Environmental Public',
    people: ['linda-schilling-cuellar'],
    page: 74,
    doi: '10.61608/9783775758758-008',
    ...desal // the whole text, from the printed issue
  },
  {
    title: 'Dam Circumsonic',
    people: ['oskar-frederick-johanson'],
    page: 82,
    doi: '10.61608/9783775758758-009',
    ...dam // the whole text, from the printed issue
  }
];
const contents2: Entry[] = [
  {title: 'Grounds of Delay', people: ['salome-katamadze']},
  {title: 'Ecological Double Exposure and the Failure of Synthetic Time', people: ['sina-hensel']},
  {title: 'Portrait of Trees', people: ['mattias-josefsson']},
  {title: 'Is Façade Landscape?', people: ['andreas-korner']},
  {title: 'Regardless of Weather', people: ['yosuke-nakamoto']},
  {title: 'False Autumns', people: ['tom-budd']},
  {title: 'Shifting Hues of Palash', people: ['viral-mehta', 'priyanka-awatramani']},
  {title: 'Fields of Gold', people: ['emily-schlickman']}
];

export const issues: Issue[] = [
  {
    slug: '00-delus',
    number: 0,
    title: 'DELUS',
    date: 'Autumn 2023',
    editorial: {page: 4, doi: '10.61608/9783775756372-fm002', ...editorial00}, // the whole text, from the printed issue
    // (the publisher's text, without its sentence naming the contributors)
    abstract:
      'The pilot issue of DELUS offers a range of diverse insights into landscape and urban questions. It introduces new methods to unpack multiple worlds and narrate manifold stories. As a collection, these contributions address the complex relations between humans, non-humans and their environment across time and space.',
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      designedByUrl: 'https://studiofolder.it/',
      publisher: 'Hatje Cantz',
      publisherPlace: 'Berlin',
      projectManagement: ['Dorothee Hahn'],
      copyediting: ['Liana Simmons'],
      proofreading: ['Irene Schaudies'],
      production: ['Alise Ausmane'],
      reproductions: ['ReproMayer Medienproduktion GmbH, Reutlingen'],
      printing: [{text: 'Livonia Print, Riga', href: 'https://www.livoniaprint.lv/'}],
      ...placeholder,
      pages: '80',
      format: '210 × 240 mm',
      language: 'English',
      isbn: '978-3-7757-5636-5',
      doi: '10.61608/9783775756372',
      buyUrl: 'https://www.hatjecantz.com/products/66089-delus-the-journal-of-the-institute-of-landscape-and-urban-studies',
      pdfUrl: 'https://library.oapen.org/handle/20.500.12657/97869',
      forthcoming: false
    },
    contributions: withSlugs(contents0)
  },
  {
    slug: '01-chasing-water',
    number: 1,
    title: 'Chasing Water',
    date: 'Autumn 2024',
    editorial: {page: 4, doi: '10.61608/9783775758758-note', ...editorial01}, // the whole text, from the printed issue
    // (the publisher's text; the issue's title in italics)
    abstract: [
      {em: 'Chasing Water'},
      ' invites us to explore different manifestations of water. The term “chasing” highlights the role of water in shaping and sustaining landscapes and urban environments, and the ongoing efforts to direct its course. From the transformation of English moorland and marshland to intricate irrigation systems in the Mediterranean and to the ecological impact of water harvesting schemes in Chile and Australia, each contribution explores how water is tracked, obstructed, or contained. “Chasing Water” reflects the contradictory challenge of capturing, storing, and distributing the element in a world where it is theoretically abundant, but in many places inaccessible.'
    ],
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      designedByUrl: 'https://studiofolder.it/',
      publisher: 'Hatje Cantz',
      publisherPlace: 'Berlin',
      projectManagement: ['Dorothee Hahn'],
      copyediting: ['Irene Schaudies', 'Liana Simmons'],
      production: ['Alise Ausmane'],
      reproductions: [{text: 'LONGO AG, Italy', href: 'https://www.longo.media/'}],
      printing: [{text: 'Livonia Print, Riga', href: 'https://www.livoniaprint.lv/'}],
      pages: '96',
      format: '210 × 240 mm',
      language: 'English',
      isbn: '978-3-7757-5874-1',
      doi: '10.61608/9783775758758',
      buyUrl: 'https://www.hatjecantz.com/products/77075-delus-journal-for-landscape-and-urban-studies',
      // the open-access edition through its DOI (its OAPEN record's address not found yet)
      pdfUrl: 'https://doi.org/10.61608/9783775758758',
      forthcoming: false
    },
    contributions: withSlugs(contents1)
  },
  {
    slug: '02-season-creep',
    number: 2,
    title: 'Season Creep',
    date: 'Spring 2027',
    // (the editors' text; the issue's title in italics)
    abstract: [
      'As climate change reshapes seasonal rhythms, the temporal structures that once structured landscapes, bodies, and built environments begin to destabilize. ',
      {em: 'Season Creep'},
      ' brings together reflections on phenological change, ecological precarity, and the uneven pace of transformation. Through writing, drawing, and documentation, the issue explores how seasonal knowledge—once rooted in cycles of cultivation, migration, and celebration—is being reconfigured, and traces what it means to inhabit a world where seasons no longer arrive as expected.'
    ],
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      designedByUrl: 'https://studiofolder.it/',
      publisher: 'Hatje Cantz',
      publisherPlace: 'Berlin',
      ...placeholder,
      language: 'English',
      forthcoming: true
    },
    contributions: withSlugs(contents2)
  }
];

// The issues, newest first: the order of every list of them
export const newestFirst = issues.toSorted((a, b) => b.number - a.number);

// The contributors of Issues 0, 1 and 2 (the same entries as studio/seed/people.ndjson).
// `sortName` gives the alphabetical order; `issues` the issues they appear in.
export const people = [
  {slug: 'yumna-al-arashi', name: 'Yumna Al-Arashi', sortName: 'Al-Arashi, Yumna', issues: [1]},
  {slug: 'stefan-breit', name: 'Stefan Breit', sortName: 'Breit, Stefan', issues: [1]},
  {slug: 'akshar-gajjar', name: 'Akshar Gajjar', sortName: 'Gajjar, Akshar', issues: [1]},
  {slug: 'christina-gruber', name: 'Christina Gruber', sortName: 'Gruber, Christina', issues: [0]},
  {slug: 'institute-for-postnatural-studies', name: 'Institute for Postnatural Studies', sortName: 'Institute for Postnatural Studies', issues: [0]},
  {slug: 'bhavya-jain', name: 'Bhavya Jain', sortName: 'Jain, Bhavya', issues: [1]},
  {slug: 'sandra-jasper', name: 'Sandra Jasper', sortName: 'Jasper, Sandra', issues: [0]},
  {slug: 'oskar-frederick-johanson', name: 'Oskar Frederick Johanson', sortName: 'Johanson, Oskar Frederick', issues: [1]},
  {slug: 'stavroula-michael', name: 'Stavroula Michael', sortName: 'Michael, Stavroula', issues: [1]},
  {slug: 'elnaz-najar-najafi', name: 'Elnaz Najar Najafi', sortName: 'Najar Najafi, Elnaz', issues: [1]},
  {slug: 'valentina-noce', name: 'Valentina Noce', sortName: 'Noce, Valentina', issues: [1]},
  {slug: 'federico-perez-villoro', name: 'Federico Pérez Villoro', sortName: 'Pérez Villoro, Federico', issues: [0]},
  {slug: 'federica-pessotto', name: 'Federica Pessotto', sortName: 'Pessotto, Federica', issues: [1]},
  {slug: 'luiza-prado-de-o-martins', name: 'Luiza Prado de O. Martins', sortName: 'Prado de O. Martins, Luiza', issues: [0]},
  {slug: 'lucia-rebolino', name: 'Lucia Rebolino', sortName: 'Rebolino, Lucia', issues: [1]},
  {slug: 'mathilde-redoute', name: 'Mathilde Redouté', sortName: 'Redouté, Mathilde', issues: [1]},
  {slug: 'karin-reisinger', name: 'Karin Reisinger', sortName: 'Reisinger, Karin', issues: [0]},
  {slug: 'negar-sanaan-bensi', name: 'Negar Sanaan Bensi', sortName: 'Sanaan Bensi, Negar', issues: [1]},
  {slug: 'linda-schilling-cuellar', name: 'Linda Schilling Cuellar', sortName: 'Schilling Cuellar, Linda', issues: [1]},
  {slug: 'insa-jelena-streit', name: 'Insa Jelena Streit', sortName: 'Streit, Insa Jelena', issues: [1]},
  // Issue 2
  {slug: 'priyanka-awatramani', name: 'Priyanka Awatramani', sortName: 'Awatramani, Priyanka', issues: [2]},
  {slug: 'tom-budd', name: 'Tom Budd', sortName: 'Budd, Tom', issues: [2]},
  {slug: 'sina-hensel', name: 'Sina Hensel', sortName: 'Hensel, Sina', issues: [2]},
  {slug: 'mattias-josefsson', name: 'Mattias Josefsson', sortName: 'Josefsson, Mattias', issues: [2]},
  {slug: 'salome-katamadze', name: 'Salome Katamadze', sortName: 'Katamadze, Salome', issues: [2]},
  {slug: 'andreas-korner', name: 'Andreas Körner', sortName: 'Körner, Andreas', issues: [2]},
  {slug: 'viral-mehta', name: 'Viral Mehta', sortName: 'Mehta, Viral', issues: [2]},
  {slug: 'yosuke-nakamoto', name: 'Yosuke Nakamoto', sortName: 'Nakamoto, Yosuke', issues: [2]},
  {slug: 'emily-schlickman', name: 'Emily Schlickman', sortName: 'Schlickman, Emily', issues: [2]}
];

// A highlight of the home page, shaped as in the CMS: a reference to an
// issue or to a post (here their slugs), or an article picked inside its
// issue (`article`: the contribution — its slug here, its key in the CMS
// — or 'editorial' for the editors' note)
export type Highlight =
  | {_type: 'issueHighlight'; issue: string}
  | {_type: 'newsHighlight'; post: string}
  | {_type: 'articleHighlight'; issue: string; article: string};

// A block of a news text (and of the About text), shaped as Sanity's rich
// text — drawn by lib/type/Blocks.svelte: a paragraph
// (italics and links possible), a quote (style Quote), a heading (style
// Heading), a list
export type NewsBlock =
  | string
  | Inline[]
  | {quote: string | Inline[]}
  | {heading: string}
  | {list: (string | Inline[])[]};

export type Post = {
  slug: string;
  kind: string;
  date: string;
  title: string | Inline[]; // italics possible (a title of an issue in it)
  body?: NewsBlock[];
  images?: {width: number; height: number}[];
};

// The news, newest first. `slug` is what the CMS generates from the title
// ("Open call: Season Creep" → open-call-season-creep), so the URLs are
// already the real ones. `date` is the full date (YYYY-MM-DD).
// `images`: the post's images (Sanity's figures) — for now only their
// proportions, shown as empty frames.
// The first three are real texts (Marco, 15 Nov: the open call of Issue
// 02 from its draft, the exhibition at Microscope; their dates before 15
// Nov are guesses); D to H stay placeholders, titles only, all News, dated
// before them.
export const posts: Post[] = [
  {
    slug: 'the-open-call-for-issue-02-is-closed',
    kind: 'News',
    date: '2026-06-02',
    title: 'The open call for Issue 02 is closed',
    body: [
      ['The open call for ', {em: 'Season Creep'}, ', Issue 02 of DELUS, closed on 1 June 2026. Thank you to everyone who sent a proposal.'],
      'The editorial team is now reading the submissions and will write to the authors whose contributions have been selected.',
      ['Issue 02, ', {em: 'Season Creep'}, ', will be published in spring 2027.']
    ]
  },
  {
    slug: 'open-call-season-creep',
    kind: 'Open call',
    date: '2026-03-02',
    title: ['Open call: ', {em: 'Season Creep'}],
    body: [
      {
        quote: [
          {em: 'The gradual changing in the length of the seasons, as demonstrated by earlier flowering of plants, … thought by many to be caused by climate change.'},
          ' — Collins English Dictionary'
        ]
      },
      ['As seasons shift in response to climate change, the rhythms that once structured landscapes, bodies, and built environments begin to destabilize. ', {em: 'Season Creep'}, ' invites reflections on phenological change, ecological precarity, and the uneven, often imperceptible pace of irreversible transformation.'],
      'This issue brings together researchers and practitioners across architecture, urban design, landscape architecture, and the arts to examine how seasonal knowledge—once grounded in cycles of cultivation, migration, and celebration—is being reconfigured across disciplines and geographies. Through writing, drawing, and documentation, contributors are invited to trace what it means to inhabit a world in which seasons no longer arrive as expected.',
      {heading: 'Submission guidelines'},
      ['Please send submissions to ', {link: 'delus@arch.ethz.ch', href: 'mailto:delus@arch.ethz.ch'}, '. Texts must be submitted as Word files (.docx). Images should be high-resolution JPEGs. Authors are responsible for securing all necessary copyright permissions.'],
      {heading: 'For a 3000-word article'},
      {list: ['Proposed title', 'Abstract (max. 250 words)', 'Name and contact information', '50-word bio', 'Up to 3 images', '1 writing sample']},
      {heading: 'For a visual essay'},
      {list: ['Proposed title', 'Abstract (max. 200 words)', 'Name and contact information', '50-word bio', 'Up to 10 images', '1 visual work sample']},
      ['All submissions must clearly state their relation to the theme of this issue of ', {em: 'DELUS'}, '. Contributions will be selected by the editorial team.'],
      {heading: 'Deadline'},
      '1 June 2026'
    ]
  },
  {
    slug: 'chasing-water-in-london',
    kind: 'Event',
    date: '2025-07-21',
    title: [{em: 'Chasing Water'}, ' in London'],
    body: [
      [
        {em: 'Chasing Water'},
        ', Issue 01 of ETH Zurich’s DELUS, was launched in London with an exhibition at ',
        {link: 'Microscope', href: 'https://www.micro-scope.uk/'},
        ', a non-profit art-and-ecology space in Dalston.'
      ],
      {list: ['Opening: 3 July 2025, 18:00–21:00', 'Exhibition: 3–19 July 2025']},
      'Microscope, 2–4 Tottenham Road, London E9 7BL.'
    ],
    images: [{width: 3, height: 2}] // horizontal
  },
  {slug: 'news-title-d', kind: 'News', date: '2025-06-15', title: 'News title D'},
  {slug: 'news-title-e', kind: 'News', date: '2025-04-03', title: 'News title E'},
  {slug: 'news-title-f', kind: 'News', date: '2025-02-19', title: 'News title F'},
  {slug: 'news-title-g', kind: 'News', date: '2024-11-21', title: 'News title G'},
  {slug: 'news-title-h', kind: 'News', date: '2024-09-30', title: 'News title H'}
];

// The site's tagline (Site settings → Footer text in the CMS): in the
// footer, and the measure of the newsletter's line.
// `url`: the site's own address, without a slash at its end (the
// addresses in the page's head, the sitemap).
export const site = {
  tagline: 'Journal for Landscape and Urban Studies',
  url: 'https://delusjournal.com'
};

// The journal's full name, as citations write it
export const journal = `DELUS: ${site.tagline}`;

// About: the text from the Figma About page.
export const about = {
  // Blocks as a news text (Sanity's rich text): the description (the
  // institute's name links to its site), then further chapters, each
  // opening with a heading — for now the sponsorship program (Marco)
  text: [
    [
      'DELUS began in 2021, initiated by former LUS doctoral fellows Sara Frikech and Johanna Just as a platform to engage with pressing questions in landscape and urban studies. Emerging from the ',
      {link: 'Institute for Landscape and Urban Studies', href: 'https://lus.arch.ethz.ch/'},
      ' (LUS) at ETH Zürich, DELUS is a research-driven journal fostering dialogue across disciplines and institutions. Situated at the intersection of architecture, landscape, and urban studies, it gives visibility to new topics, concepts, and perspectives shaping contemporary discourse.'
    ],
    {heading: 'Sponsorship program'},
    'In order to foster a closer relationship with landscape architectural practitioners, the magazine has established a sponsorship program with landscape offices.',
    'A sponsorship is a way to gain more visibility among students of the Landscape Architecture Master Programme and the Department of Architecture at ETH Zurich and its broader network. Sponsors are mentioned by name on the back of the upcoming issue and receive 2 copies of the issue after the publication, or 4 copies for offices with more than 10 employees. We offer two sponsorship tiers:',
    {list: ['Offices with less than 10 employees: 500 CHF', 'Offices with more than 10 employees: 1000 CHF']}
  ] as NewsBlock[],
  // The colophon: Sanity's `credits` (label + value). Here each value is
  // a list of lines, some of them links.
  credits: [
    {label: 'Editors-in-Chief', value: [{text: 'Sara Frikech'}, {text: 'Johanna Just'}]},
    {label: 'Art Direction', value: [{text: 'Studio Folder', href: 'https://studiofolder.it/'}]},
    {label: 'Publisher', value: [{text: 'Hatje Cantz', href: 'https://www.hatjecantz.com/'}]},
    {label: 'Contact', value: [{text: 'delus@arch.ethz.ch', href: 'mailto:delus@arch.ethz.ch'}]},
    {label: 'Follow', value: [{text: '@delusjournal', href: 'https://www.instagram.com/delusjournal/'}]}
  ] as Credit[]
};

// Imprint and Privacy: reached from the footer (the tagline gives way to
// their links under the pointer). Drafts: what is in [brackets] is still
// to be confirmed or filled in. `body` is shaped as Sanity's rich text: a
// paragraph is a string or a list of inline pieces; `{heading}` a heading
// (style Heading in the CMS), which opens a section.
// `updated`: the day the page was last published in the CMS (Sanity's
// `_updatedAt`), shown at its end as "Last updated" — Privacy only.
export type LegalPage = {
  slug: string;
  title: string;
  body: (string | Inline[] | {heading: string})[];
  updated?: string;
};

const contact: Inline = {link: 'delus@arch.ethz.ch', href: 'mailto:delus@arch.ethz.ch'};
const lus: Inline = {link: 'Institute of Landscape and Urban Studies (LUS)', href: 'https://lus.arch.ethz.ch/'};
// The Department of Architecture's address (lus.arch.ethz.ch gives none)
const address = ', Department of Architecture, ETH Zürich, Stefano-Franscini-Platz 5, 8093 Zürich, Switzerland.';

export const legal: LegalPage[] = [
  {
    slug: 'imprint',
    title: 'Imprint',
    body: [
      {heading: 'Published by'},
      ['DELUS, Journal for Landscape and Urban Studies. ', lus, address],
      {heading: 'Editors-in-Chief'},
      'Sara Frikech and Johanna Just, responsible for the content of this site.',
      {heading: 'Contact'},
      [contact],
      {heading: 'Print edition'},
      [
        'The printed issues are published by ',
        {link: 'Hatje Cantz', href: 'https://www.hatjecantz.com/'},
        '.'
      ],
      {heading: 'Design and development'},
      [{link: 'Studio Folder', href: 'https://studiofolder.it/'}, ', Milan.'],
      {heading: 'Rights'},
      [
        'All the published issues of DELUS are open access, under a ',
        {link: 'Creative Commons BY-NC-ND 4.0', href: 'https://creativecommons.org/licenses/by-nc-nd/4.0/'},
        ' licence: their contents can be shared freely, without changes, for non-commercial purposes and naming the authors and the journal. Each issue has its DOI and can be downloaded free of charge from this website, ',
        {link: 'Hatje Cantz', href: 'https://www.hatjecantz.com/collections/delus'},
        ' and the ',
        {link: 'OAPEN Library', href: 'https://library.oapen.org/'},
        '.'
      ],
      'The licence does not cover images by third parties: their rights remain with the authors named in the credits.',
      {heading: 'Links'},
      'DELUS is not responsible for the content of the other websites this site links to.'
    ]
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    body: [
      'This site collects as little as possible. It sets no cookies and does not follow visitors from one site to another. This notice says what is collected, by whom and why, under the Swiss Federal Act on Data Protection and, for visitors in the European Union, the General Data Protection Regulation.',
      {heading: 'Responsible'},
      [
        'DELUS, ',
        lus,
        address + ' ',
        contact,
        '.'
      ],
      {heading: 'Hosting'},
      'The site is hosted by Vercel Inc., in the United States. When a page is visited, its servers record technical data such as the IP address, the browser and the time of the visit, in order to deliver the site and keep it secure. [How long they are kept; the basis of the transfer to the United States, e.g. the Data Privacy Framework.]',
      {heading: 'Visit statistics'},
      'Visits are counted with Umami, hosted in the European Union (Germany). Umami sets no cookies and keeps no IP addresses: it records only anonymous data, such as the pages viewed, the site a visitor came from, the browser, the type of device and the country, which cannot be traced back to anyone.',
      {heading: 'Newsletter'},
      'Subscribers’ email addresses are kept by [the newsletter service, its country], only to send the newsletter. Every newsletter ends with a link to unsubscribe at once.',
      {heading: 'Other sites'},
      'Links to other sites, such as Instagram or the publisher’s, lead to pages with their own privacy policies.',
      {heading: 'Your rights'},
      [
        'Anyone can ask what data about them is kept, have it corrected or deleted, or object to its use, by writing to ',
        contact,
        '. A complaint can also be made to the Swiss Federal Data Protection and Information Commissioner or, in the European Union, to the data protection authority of one’s country.'
      ]
    ],
    updated: '2026-11-13' // a placeholder, until the CMS gives it
  }
];

// Placeholder texts. Replaced by Sanity later.
export const home = {
  statement:
    'Situated at the intersection of architecture, landscape, and urban studies, DELUS gives visibility to new topics, concepts, and perspectives shaping contemporary discourse.',
  // Highlights: what the home page shows, one at a time, in this order —
  // as in the CMS (Site settings → Highlights), only an issue, a news
  // item or an article; what each shows comes from it (lib/home/
  // highlights.ts). For now one of each kind, to try them (Marco, 15 Nov):
  // Issue 02, Issue 01, Breit and Streit's essay, the London launch of Issue 01.
  highlights: [
    {_type: 'issueHighlight', issue: '02-season-creep'},
    {_type: 'issueHighlight', issue: '01-chasing-water'},
    {_type: 'articleHighlight', issue: '01-chasing-water', article: 'not-a-drop-is-lost'},
    {_type: 'newsHighlight', post: 'chasing-water-in-london'}
  ] satisfies Highlight[] as Highlight[]
};

// The people of a contribution, in their order (a slug without an
// entry stands for itself)
export const peopleOf = (contribution: Contribution) =>
  contribution.people.map((slug) => people.find((x) => x.slug === slug) ?? {name: slug, sortName: slug});

// The article of a person: their (first) contribution and its issue —
// where a name in the contributors list leads, for now
export function articleOf(person: string) {
  for (const issue of issues) {
    const contribution = issue.contributions.find((c) => c.people.includes(person));
    if (contribution) return {issue, contribution, href: articleHref(issue, contribution)};
  }
}
