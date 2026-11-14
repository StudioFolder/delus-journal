import {articleHref, issueLabel, slugOf, type Credit} from './format.ts';
import * as redoute from './articles/redoute.ts';
import * as breit from './articles/breit.ts';
import * as editorial01 from './articles/editorial01.ts';
import * as navel from './articles/navel.ts';

// The issues. `date` is how the issue is dated in print (season and year).
// The abstracts are placeholders (the issue's title in italics, then
// filler text, about as long as a real abstract).
// `publication`: the Publication fields of the CMS. ISBNs, Hatje Cantz
// links and the open-access PDF are real (from the holding page); pages,
// binding and format are placeholders.
const placeholder = {pages: '000 pages, 00 photos', binding: 'Binding', format: '000 × 000 mm'};
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
export type Figure = {label?: string; ratio: number; caption: Inline[]};
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
  abstract?: string;
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
    editedBy: string;
    designedBy: string;
    pages: string;
    binding: string;
    format: string;
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
    abstract:
      'Luiza Prado de O. Martins shows how artefacts of domestic labour allow for unravelling relations of land, body and class within capitalist/colonialist frameworks. She brings us on a journey from biopolitics of coloniality studied through technology to a more personal and profound story exploring how land/body can be understood as part of each other.'
  },
  {
    title: 'Rivers, Sturgeons and Dragons',
    people: ['christina-gruber'],
    page: 16,
    doi: '10.61608/9783775756372-002',
    abstract:
      'Christina Gruber follows sturgeons in the Danube to investigate the evolution of dragon myths along the stream, asking whether the majestic fish can help re-calibrate the relationship between bodies of water and human bodies.'
  },
  {
    title: 'Feminist Responses to the Prolonged Colonialities of Exploited Landscapes',
    people: ['karin-reisinger'],
    page: 34,
    doi: '10.61608/9783775756372-003',
    abstract:
      'In conversation with Karin Reisinger, we reflect on historical research methods combined with participatory formats. She brings out marginalized voices and material relations and examines the prolonged coloniality of exploited mining landscapes in the peripheries of northern Sweden.'
  },
  {
    title: 'Melting Ecologies',
    people: ['institute-for-postnatural-studies'],
    page: 46,
    doi: '10.61608/9783775756372-004',
    abstract:
      'The Institute for Postnatural Studies employs storytelling and artistic research methods to challenge the aesthetic qualities of a melting world – taking as a starting point the concept of postnature as a framework for creation.'
  },
  {
    title: 'Speculative Ecologies: The Future of Urban Wastelands',
    people: ['sandra-jasper'],
    page: 56,
    doi: '10.61608/9783775756372-005',
    abstract:
      'In conversation with Sandra Jasper, we delve into acoustic and cinematographic research methods to gain new perspectives on urban ecologies and to unpack more-than-human histories of so-called wastelands in Berlin.'
  },
  {
    title: 'The Trap of Time: Prototyping a Summer School',
    people: ['federico-perez-villoro'],
    page: 66,
    doi: '10.61608/9783775756372-006',
    abstract:
      'Federico Pérez Villoro tests alternate curricula with Materia Abierta, a summer school in Mexico City, reiterating learning models and offering a space to reflect on the ethics of the present and the future.'
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
    abstract:
      'Akshar Gajjar and Bhavya Jain urge us to behold a nineteenth-century pashmina shawl, a masterpiece intricately charting Srinagar’s waterways. They juxtapose artisanal insight and colonial mapping, advocating an embroidered ethos. Through threads and layered textiles, they defy the hegemony of Cartesian water cartography.'
  },
  {
    title: 'Liquid Shadows',
    people: ['valentina-noce'],
    page: 32,
    doi: '10.61608/9783775758758-003',
    abstract:
      'Valentina Noce ventures into the eerie realm of water, drawing parallels to Pascal’s abyss. Through ‘Liquid Shadows,’ she creates a digital odyssey, exploring water’s unsettling essence, mysterious allure and haunting ambiguity.'
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
    abstract:
      'Elnaz Najar Najafi and Negar Sanaan Bensi delve into the historical and cultural perceptions of thirst and its impact on settlements and cultivation within the deserts of the Iranian Plateau. By challenging the negative connotations associated with thirst and exploring the innovative water management techniques of inhabitants, they reveal how thirst has been a positive driving force for imagination, care and the nurturing of life in arid environments.'
  },
  {
    title: 'Men Talk but the Women Fetch the Water',
    people: ['stavroula-michael'],
    page: 58,
    doi: '10.61608/9783775758758-006',
    abstract:
      'Stavroula Michael examines the coloniality of water infrastructures in Cyprus during late British colonialism and the early years of independence, highlighting how these systems perpetuated systemic inequalities. She unearths hidden histories of water attending neglected narratives of women and their relationships to material constructions such as village fountains.'
  },
  {
    title: 'Bordoclima: New Calligraphies of Fluid Borders',
    people: ['lucia-rebolino', 'federica-pessotto'],
    page: 66,
    doi: '10.61608/9783775758758-007',
    abstract:
      'Lucia Rebolino and Federica Pessotto challenge the notion of fixed borders within contemporary geopolitics by conceptualizing them as dynamic entities. Their approach advocates the sovereignty of water in shaping borders and proposes a fluid understanding characterized by constant change and permeability.'
  },
  {
    title: 'Desalination and a New Environmental Public',
    people: ['linda-schilling-cuellar'],
    page: 74,
    doi: '10.61608/9783775758758-008',
    abstract:
      'Linda Schilling Cuellar tackles the complexities surrounding water management in Chile, questioning the polarizing allure of desalination. She reveals the multifaceted implications of landscape solutionism – technological interventions, privatization debates and ecological repercussions. In her exploration, water emerges as a critical lifeline amidst the ever-pressing climate crisis.'
  },
  {
    title: 'Dam Circumsonic',
    people: ['oskar-frederick-johanson'],
    page: 82,
    doi: '10.61608/9783775758758-009',
    abstract:
      'Oskar Frederick Johanson delves into the sonic environment of Warragamba Dam, a metaphor for broader water management issues in Australia. Through the lens of the Dyarubbin/Hawkesbury-Nepean watershed, embodied by the dam, he reveals the melodious yet dissonant complexities of controlling water amidst colonial legacies, urbanization pressures and environmental risks.'
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
    editorial: {doi: '10.61608/9783775756372-fm002'}, // its text is not on the site yet
    abstract: [
      'Placeholder for the abstract of Issue 00, ',
      {em: 'DELUS'},
      '. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
    ],
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      ...placeholder,
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
    abstract: [
      'Placeholder for the abstract of Issue 01, ',
      {em: 'Chasing Water'},
      '. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut.'
    ],
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      ...placeholder,
      isbn: '978-3-7757-5874-1',
      doi: '10.61608/9783775758758',
      buyUrl: 'https://www.hatjecantz.com/products/77075-delus-journal-for-landscape-and-urban-studies',
      forthcoming: false
    },
    contributions: withSlugs(contents1)
  },
  {
    slug: '02-season-creep',
    number: 2,
    title: 'Season Creep',
    date: 'Spring 2027',
    abstract: [
      'Placeholder for the abstract of Issue 02, ',
      {em: 'Season Creep'},
      '. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.'
    ],
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      ...placeholder,
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

// Eight invented news items, newest first. `slug` is what the CMS
// generates from the title ("News title A" → news-title-a), so the URLs
// are already the real ones. `date` is the full date (YYYY-MM-DD). A, B and
// C have a text (`body`, one string per paragraph), as a placeholder; B and
// C an image (B horizontal, C vertical).
// `images`: the post's images (Sanity's figures) — for now only their
// proportions, shown as empty frames.
export type Post = {
  slug: string;
  kind: string;
  date: string;
  title: string;
  body?: string[];
  images?: {width: number; height: number}[];
};

const placeholderBody = [
  'Placeholder for the text of a news item. The first paragraph says what happens, when and where, in a few plain sentences, so that the page can be judged with a realistic amount of text in this position.',
  'A second paragraph gives the details: who is taking part, how to join or apply, what the event or the call is about, and how it relates to the work of the journal and to its latest issue.',
  'A last, shorter paragraph with practical information: the date and time, the place, a link for registration or submission.'
];

export const posts: Post[] = [
  {
    slug: 'news-title-a',
    kind: 'News',
    date: '2026-11-12',
    title: 'News title A',
    body: placeholderBody
  },
  {
    slug: 'news-title-b',
    kind: 'Event',
    date: '2026-10-08',
    title: 'News title B',
    body: placeholderBody,
    images: [{width: 3, height: 2}] // horizontal
  },
  {
    slug: 'news-title-c',
    kind: 'News',
    date: '2026-08-27',
    title: 'News title C',
    body: placeholderBody,
    images: [{width: 2, height: 3}] // vertical
  },
  {slug: 'news-title-d', kind: 'Open call', date: '2026-06-15', title: 'News title D'},
  {slug: 'news-title-e', kind: 'Event', date: '2026-04-03', title: 'News title E'},
  {slug: 'news-title-f', kind: 'News', date: '2026-02-19', title: 'News title F'},
  {slug: 'news-title-g', kind: 'Open call', date: '2025-11-21', title: 'News title G'},
  {slug: 'news-title-h', kind: 'News', date: '2025-09-30', title: 'News title H'}
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
  // (a paragraph of inline pieces: the institute's name links to its site)
  text: [
    'DELUS began in 2021, initiated by former LUS doctoral fellows Sara Frikech and Johanna Just as a platform to engage with pressing questions in landscape and urban studies. Emerging from the ',
    {link: 'Institute for Landscape and Urban Studies', href: 'https://lus.arch.ethz.ch/'},
    ' (LUS) at ETH Zürich, DELUS is a research-driven journal fostering dialogue across disciplines and institutions. Situated at the intersection of architecture, landscape, and urban studies, it gives visibility to new topics, concepts, and perspectives shaping contemporary discourse.'
  ] as Inline[],
  // The colophon: Sanity's `credits` (label + value). Here each value is
  // a list of lines, some of them links.
  credits: [
    {label: 'Editors-in-Chief', value: [{text: 'Sara Frikech'}, {text: 'Johanna Just'}]},
    {label: 'Graphic Design', value: [{text: 'Studio Folder', href: 'https://studiofolder.it/'}]},
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
  // Highlights: what the home page shows, one at a time, in this order.
  // For now the issues, newest first; later chosen and ordered by the
  // editors in the CMS.
  highlights: newestFirst.map((issue) => ({label: issueLabel(issue.number), text: issue.abstract}))
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
