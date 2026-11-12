import {issueLabel, type Credit} from './format.ts';

// The issues. `date` is how the issue is dated in print (season and year).
// Only Issue 02 has its real abstract; the other two are placeholders.
// `publication`: the Publication fields of the CMS. ISBNs, Hatje Cantz
// links and the open-access PDF are real (from the holding page); pages,
// binding and format are placeholders.
const placeholder = {pages: '000 pages, 00 photos', binding: 'Binding', format: '000 × 000 mm'};
const editors = 'Sara Frikech, Johanna Just';
// A block of a contribution's text: a paragraph, or a quote (Sanity's
// rich text: the Normal and Quote styles). Line breaks typed in a quote
// (verse) are kept.
export type Block = string | {quote: string};

// One entry of an issue's table of contents (Sanity's contribution):
// its title, its people (slugs of `people`, below), its first page, its
// abstract (Sanity: `abstract`; only one so far, from the editors) and
// its text (`body`; not in Sanity yet — the placeholder text otherwise).
export type Contribution = {
  title: string;
  people: string[];
  page?: number;
  abstract?: string;
  body?: Block[];
};

// The beginning of "Shifting Hues of Palash" (Issue 02), from the Figma
// layout: paragraphs, then a quote (Sanity: the Quote style), then more
// paragraphs.
const palashBody: Block[] = [
  'In this essay we trace stories of Palash, botanically Butea monosperma, a resilient tree native to the dry deciduous forests of India and its entanglement with the region’s culture, festivals, economies and collective memories. Affected by climate change, its blossom – which has been for centuries a key ecological reference point in season change – is shifting, along with its habitats; and we ask What is lost and what do we risk losing?',
  'Towards the end of winter, Palash loses all its leaves and crimson coloured flowers – also known as Tesu – fill its canopies. Its vivid crimson blossom stands out across the brown and grey landscape of dry deciduous forest (FIG. A, B), earning its common name Flame of the Forest.',
  'The striking presence of Palash in this moment of swinging of seasons has been captured in a 1931 Bengali poem Ore Grihabasi Khol Dwar by Rabindranath Tagore, a Bengali poet, philosopher and the first Asian Nobel laureate.',
  {quote: 'Open your door, the home-dweller, everything’s on the swing. The land, water, the forest floor all swing. Open, step out of your door. Loads of crimson blossoms of Ashok and Palash, all in smiles...'},
  'Forests are not the only places where Palash persists. Its flowers also move through local markets, carried into homes and communities. Viral’s father buys dried Tesu from a weekly organic farmers’ market in Surat, a city in south Gujarat. It was through this market that we met Vikas, a farmer from a tribal community in Uteva village. From February to April, Vikas and his family collect Tesu from Palash trees on their farm and carefully dry them in a shaded open space, before selling them in nearby markets (FIG. C, D). Over the past decade, Vikas has watched Palash on his farm flower around two to four weeks earlier. As the rhythm of its blooming shifts, what happens to seasonal economies and traditions that have grown around it? Dried Tesu enters local markets largely in anticipation of Holi, a festival whose date remains anchored to the Hindu lunisolar calendar. What happens when rhythms of the landscape and the festivals shaped by them no longer align?',
  'In the course of our conversations, Vikas shared extraordinary stories of his tribal community’s relationship with Palash, that speaks of ecological knowledge and cultural intimacy. In his village, whenever the local deities are worshipped, it is a custom to serve tea to the devotees in cups folded from Palash leaves. He says Palash is woven in their everyday life, from birth to death, in rituals, recipes and economies. Among many of the village\'s traditional dishes, Dhekla is prepared by steaming rice batter wrapped in Palash leaves in an earthen pot without salt or any spices; the entire flavour comes from being cooked in Palash leaves.',
  'Traditionally, members of the Adivasi community in Gujarat would place Palash leaves between their hands while sealing sacred agreements, including marriages and other social obligations. Palash leaves grow in clusters of three (FIG. E): the larger, rounded middle leaflet is used in auspicious occasions such as weddings, festivals and worships, whereas the two smaller oval leaflets accompany rituals of death and mourning. This sacred connection is almost only present in rural areas today; tribal and Adivasi people are one of the only remaining stewards of Palash.',
  'This sense of stewardship is retained through religion, scriptures and folklores as these elements preserve the value of care in the present day. In Hindu traditions, Palash is considered an incarnation of Agni, the God of fire and its wood, bark and flowers remain integral to sacred fire rituals and worship. In Buddhist traditions it is linked with the enlightenment of Medhaṅkara Buddha. In Sanskrit literature, especially Jayadeva\'s Gita Govinda, the crimson Tesu becomes a poetic metaphor for the ecstasy of love.'
];


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
  contributions: Contribution[];
};

// The tables of contents, from the printed issues (Issue 02: order as
// given by the editors, no page numbers yet)
const contents0: Contribution[] = [
  {title: 'Salted Waters: Cooking, Land and Resistance', people: ['luiza-prado-de-o-martins'], page: 10},
  {title: 'Rivers, Sturgeons and Dragons', people: ['christina-gruber'], page: 16},
  {title: 'Feminist Responses to the Prolonged Colonialities of Exploited Landscapes', people: ['karin-reisinger'], page: 34},
  {title: 'Melting Ecologies', people: ['institute-for-postnatural-studies'], page: 46},
  {title: 'Speculative Ecologies: The Future of Urban Wastelands', people: ['sandra-jasper'], page: 56},
  {title: 'The Trap of Time: Prototyping a Summer School', people: ['federico-perez-villoro'], page: 66}
];
const contents1: Contribution[] = [
  {title: 'Navel Gazing', people: ['yumna-al-arashi'], page: 8},
  {title: 'The Draining of the Fens: Enclosures, Resistance and Wilderness', people: ['mathilde-redoute'], page: 14},
  {title: 'Embroidered Waterscapes: Unpacking Relationships Through Artisanal Map-making', people: ['akshar-gajjar', 'bhavya-jain'], page: 24},
  {title: 'Liquid Shadows', people: ['valentina-noce'], page: 32},
  {title: 'Not a Drop Is Lost', people: ['stefan-breit', 'insa-jelena-streit'], page: 38},
  {title: 'On Thirst: Anecdotes on Chasing the Waters', people: ['elnaz-najar-najafi', 'negar-sanaan-bensi'], page: 50},
  {title: 'Men Talk but the Women Fetch the Water', people: ['stavroula-michael'], page: 58},
  {title: 'Bordoclima: New Calligraphies of Fluid Borders', people: ['lucia-rebolino', 'federica-pessotto'], page: 66},
  {title: 'Desalination and a New Environmental Public', people: ['linda-schilling-cuellar'], page: 74},
  {title: 'Dam Circumsonic', people: ['oskar-frederick-johanson'], page: 82}
];
const contents2: Contribution[] = [
  {title: 'Grounds of Delay', people: ['salome-katamadze']},
  {title: 'Ecological Double Exposure and the Failure of Synthetic Time', people: ['sina-hensel']},
  {title: 'Portrait of Trees', people: ['mattias-josefsson']},
  {title: 'Is Façade Landscape?', people: ['andreas-korner']},
  {title: 'Regardless of Weather', people: ['yosuke-nakamoto']},
  {title: 'False Autumns', people: ['tom-budd']},
  {
    title: 'Shifting Hues of Palash',
    people: ['viral-mehta', 'priyanka-awatramani'],
    abstract:
      'Viral Mehta and Priyanka Awatramani trace the shifting seasonal life of Palash, a tree deeply entwined with livelihoods and collective memory across India. As climate change alters its flowering cycles and habitats, the essay asks what is lost when ecological rhythms fall out of sync with the cultural practices they have long sustained.',
    body: palashBody
  },
  {title: 'Fields of Gold', people: ['emily-schlickman']}
];

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
    },
    contributions: contents0
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
    },
    contributions: contents1
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
    },
    contributions: contents2
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

// The text of a contribution (an "article"), as a placeholder: one
// string per paragraph. The editors' note of Issue 01 from the Figma
// layout. Shown for every contributor for now.
// (Sanity's contribution has no field for its text yet.)
export const placeholderArticle: Block[] = [
  'Material appears to flow down the slope. Is it soil, or merely water? A lorry, half tilted, interrupts the scene, a witness to the artificiality embedded within the material. It is only when we read the title underneath the photo, that we recognise what we are seeing: Asphalt Rundown (Smithson 1969). In this work, asphalt becomes more than surface; it becomes an agent that reveals the hidden contours of the terrain. It runs across the ground, absorbing each depression, outlining the micro-reliefs that our eyes might have overlooked unless the added material declared them visible by contrasting the existing surface. The photo makes the asphalt stiffen, transforming it to something that preserves. The asphalt follows its own course, allowing us to see, along lines shaped by gravity and chance, the steep decline of the hill. The asphalt shifts our reading of the geology from the ordinary to the sculptural. The photograph amplifies this contrast, becoming more than a record, perhaps an interpretation, or an encounter that stands on its own.',
  'When we introduce a sculptural form that contrasts with the landscape, do we see things that we would not have seen otherwise? Each winter, the first snow arrives as a quiet shock, restricting and redefining our freedom to move. It covers familiar paths and gentle slopes, silencing the details beneath a uniform white surface. Beneath it, roads and tracks vanish. In response, the snowplough begins its work, removing the forgiving layer that restricts our movement. In this fragile negotiation between weather and human will, the priorities of society reveal themselves in lines of salt and cleared asphalt. Routes once trusted may become inaccessible, shaped by the snowplough’s passage. Banks and piles of snow become boundaries that separate what is accessible and revealed from what which remains hidden.',
  'May emerge through repetition and the mechanical limits of the plough. As temperatures shift between thaw and freeze, edges harden and become more defined. These urban snow ridges function as both obstacles and monuments, evidence of how snow, machinery, and daily routine combine to form a temporary structure in the city.',
  'A landscape is never static. It transforms with time, and how we approach the pedagogy of landscape design must reflect this constant transformation. Rather than beginning with drawings or abstract plans, we start with an experience of the specific place. The workshop has been developed since 2019, with a focus on using performative engagement as a process of discussing the use of public space.'
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
    {label: 'Contact', value: [{text: 'delus@arch.ethz.ch', href: 'mailto:delus@arch.ethz.ch'}]},
    {label: 'Follow', value: [{text: '@delusjournal', href: 'https://www.instagram.com/delusjournal/'}]}
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
