import {issueLabel, type Credit} from './format.ts';

// The issues. `date` is how the issue is dated in print (season and year).
// Only Issue 02 has its real abstract; the other two are placeholders.
// `publication`: the Publication fields of the CMS. ISBNs, Hatje Cantz
// links and the open-access PDF are real (from the holding page); pages,
// binding and format are placeholders.
const placeholder = {pages: '000 pages, 00 photos', binding: 'Binding', format: '000 × 000 mm'};
const editors = 'Sara Frikech, Johanna Just';
export type Issue = {
  slug: string;
  number: number;
  title: string;
  date: string;
  abstract: string;
  publication: {
    editedBy: string;
    designedBy: string;
    pages: string;
    binding: string;
    format: string;
    isbn?: string;
    buyUrl?: string;
    pdfUrl?: string;
    forthcoming: boolean;
  };
};

export const issues: Issue[] = [
  {
    slug: '00-delus',
    number: 0,
    title: 'DELUS',
    date: 'Autumn 2023',
    abstract:
      'Placeholder for the abstract of Issue 00. A few sentences introducing the issue will stand here, of about the same length as the abstract of the current issue, so that the page can be judged with a realistic amount of text in this position.',
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      ...placeholder,
      isbn: '978-3-7757-5636-5',
      buyUrl: 'https://www.hatjecantz.com/products/66089-delus-the-journal-of-the-institute-of-landscape-and-urban-studies',
      pdfUrl: 'https://library.oapen.org/handle/20.500.12657/97869',
      forthcoming: false
    }
  },
  {
    slug: '01-chasing-water',
    number: 1,
    title: 'Chasing Water',
    date: 'Autumn 2024',
    abstract:
      'Placeholder for the abstract of Issue 01, Chasing Water. A few sentences introducing the issue will stand here, of about the same length as the abstract of the current issue, so that the page can be judged with a realistic amount of text in this position.',
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      ...placeholder,
      isbn: '978-3-7757-5874-1',
      buyUrl: 'https://www.hatjecantz.com/products/77075-delus-journal-for-landscape-and-urban-studies',
      forthcoming: false
    }
  },
  {
    slug: '02-season-creep',
    number: 2,
    title: 'Season Creep',
    date: 'Spring 2027',
    abstract:
      'In the highlands of the Caucasus, season is sensed before it is measured. It gathers in snowlines, grass, mud, thirst, animal fatigue, and the opening of mountain paths. For shepherds moving flocks between summer and winter pastures in eastern Georgia, transhumance is a cyclical rhythm of attunement: knowing when a landscape can receive, sustain, or release a moving herd.',
    publication: {
      editedBy: editors,
      designedBy: 'Studio Folder',
      ...placeholder,
      forthcoming: true
    }
  }
];

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

// About: the text from the Figma About page.
// The site's tagline (Site settings → Footer text in the CMS): in the
// footer, and the measure of the newsletter's line.
export const site = {
  tagline: 'Journal for Landscape and Urban Studies'
};

export const about = {
  text: 'DELUS began in 2021, initiated by former LUS doctoral fellows Sara Frikech and Johanna Just as a platform to engage with pressing questions in landscape and urban studies. Emerging from the Institute for Landscape and Urban Studies (LUS) at ETH Zürich, DELUS is a research-driven journal fostering dialogue across disciplines and institutions. Situated at the intersection of architecture, landscape, and urban studies, it gives visibility to new topics, concepts, and perspectives shaping contemporary discourse.',
  // The colophon: Sanity's `credits` (label + value). Here each value is
  // a list of lines, some of them links.
  credits: [
    {label: 'Editors-in-Chief', value: [{text: 'Sara Frikech'}, {text: 'Johanna Just'}]},
    {label: 'Graphic Design', value: [{text: 'Studio Folder', href: 'https://studiofolder.it/'}]},
    {label: 'Publisher', value: [{text: 'Hatje Cantz', href: 'https://www.hatjecantz.com/'}]},
    {
      label: 'Contact',
      value: [
        {text: 'delus@arch.ethz.ch', href: 'mailto:delus@arch.ethz.ch'},
        {text: '@delusjournal', href: 'https://www.instagram.com/delusjournal/'}
      ]
    }
  ] as Credit[]
};

// Placeholder texts. Replaced by Sanity later.
export const home = {
  statement:
    'Situated at the intersection of architecture, landscape, and urban studies, DELUS gives visibility to new topics, concepts, and perspectives shaping contemporary discourse.',
  // Highlights: what the home page shows, one at a time, in this order.
  // For now the issues, newest first; later chosen and ordered by the
  // editors in the CMS.
  highlights: issues
    .toSorted((a, b) => b.number - a.number)
    .map((issue) => ({label: issueLabel(issue.number), text: issue.abstract}))
};
