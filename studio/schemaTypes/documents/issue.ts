import {defineArrayMember, defineField, defineType} from 'sanity'

const pad = (n?: number) => (typeof n === 'number' ? String(n).padStart(2, '0') : '??')

export const issue = defineType({
  name: 'issue',
  title: 'Issue',
  type: 'document',
  groups: [
    {name: 'main', title: 'Issue', default: true},
    {name: 'editorial', title: 'Editorial'},
    {name: 'contents', title: 'Contributions'},
    {name: 'publication', title: 'Publication'},
  ],
  fields: [
    // Issue
    defineField({
      name: 'number',
      title: 'Number',
      type: 'number',
      group: 'main',
      validation: (r) => r.required().integer().min(0),
    }),
    defineField({name: 'title', title: 'Title', type: 'string', group: 'main', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'URL name',
      type: 'slug',
      group: 'main',
      description: 'Generated from number and title, e.g. 02-season-creep',
      options: {source: (doc: any) => `${pad(doc.number)}-${doc.title ?? ''}`},
      validation: (r) => r.required(),
    }),
    defineField({name: 'season', title: 'Season', type: 'string', group: 'main', description: 'e.g. Autumn 2024'}),
    defineField({
      name: 'abstract',
      title: 'Abstract',
      type: 'simpleText',
      group: 'main',
      description: 'A few sentences introducing the issue: shown on the home page, in the list of issues and on the issue page.',
    }),
    defineField({name: 'cover', title: 'Cover', type: 'figure', group: 'main'}),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      group: 'main',
      of: [defineArrayMember({type: 'figure'})],
      options: {layout: 'grid'},
    }),
    defineField({name: 'editedBy', title: 'Editors', type: 'string', group: 'main', description: 'Names separated by commas'}),
    defineField({
      name: 'designedBy',
      title: 'Graphic design',
      type: 'string',
      group: 'main',
      initialValue: 'Studio Folder',
    }),
    defineField({
      name: 'designedByUrl',
      title: 'Graphic design link',
      type: 'url',
      group: 'main',
      initialValue: 'https://studiofolder.it/',
    }),

    // Editorial
    defineField({
      name: 'editorial',
      title: 'Editorial',
      type: 'object',
      group: 'editorial',
      fields: [
        defineField({name: 'title', title: 'Title', type: 'string', initialValue: 'A Note from the Editors'}),
        defineField({name: 'authors', title: 'Authors', type: 'string'}),
        defineField({
          name: 'cover',
          title: 'Cover image',
          type: 'image',
          description:
            'The image that stands for the piece in the issue’s contents (the gallery and grid of the issue page). Empty: its first image. To use one of its images: Select → Browse, and pick it (it is not uploaded twice).',
          fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', description: 'Short description for screen readers and search engines.'})],
        }),
        defineField({name: 'text', title: 'Text', type: 'richText'}),
        defineField({name: 'doi', title: 'DOI', type: 'string', description: 'As registered by the publisher, without https://doi.org/ — e.g. 10.61608/9783775758758-001'}),
        defineField({
          name: 'citation',
          title: 'Citation (override)',
          type: 'text',
          rows: 3,
          description:
            'Leave empty to generate it (Chicago style: people, title, journal, issue, season, pages, DOI). Plain text: the journal is set in italics on the site.',
        }),
      ],
    }),

    // Contributions
    defineField({
      name: 'contributions',
      title: 'Contributions',
      type: 'array',
      group: 'contents',
      description: 'In order of appearance. "Texts by" and the Contributors page are generated from this list.',
      of: [defineArrayMember({type: 'contribution'})],
    }),

    // Publication
    defineField({name: 'publicationDate', title: 'Publication date', type: 'date', group: 'publication'}),
    defineField({name: 'pageCount', title: 'Pages', type: 'number', group: 'publication'}),
    defineField({name: 'photoCount', title: 'Photos', type: 'number', group: 'publication'}),
    // The credits of the printed issue, as in its colophon: one name (or
    // name and place) per line, a link where it has a site (simpleText).
    // The site shows a row only where filled in.
    defineField({name: 'projectManagement', title: 'Project management', type: 'simpleText', group: 'publication', description: 'One per line (Shift+Enter); a name can carry a link (the Link button)'}),
    defineField({name: 'copyediting', title: 'Copyediting', type: 'simpleText', group: 'publication', description: 'One per line (Shift+Enter); a name can carry a link (the Link button)'}),
    defineField({name: 'proofreading', title: 'Proofreading', type: 'simpleText', group: 'publication', description: 'One per line (Shift+Enter); a name can carry a link (the Link button)'}),
    defineField({name: 'production', title: 'Production', type: 'simpleText', group: 'publication', description: 'One per line (Shift+Enter); a name can carry a link (the Link button), e.g. Alise Ausmane'}),
    defineField({name: 'reproductions', title: 'Reproductions', type: 'simpleText', group: 'publication', description: 'One per line (Shift+Enter); a name can carry a link (the Link button)'}),
    defineField({name: 'printing', title: 'Printing', type: 'simpleText', group: 'publication', description: 'One per line (Shift+Enter); a name can carry a link (the Link button), e.g. Livonia Print, Riga'}),
    defineField({name: 'format', title: 'Format', type: 'string', group: 'publication', description: 'e.g. 210 × 240 mm'}),
    defineField({name: 'language', title: 'Language', type: 'string', group: 'publication', initialValue: 'English'}),
    defineField({name: 'isbn', title: 'ISBN', type: 'string', group: 'publication'}),
    defineField({name: 'doi', title: 'DOI', type: 'string', group: 'publication', description: 'Of the whole issue, without https://doi.org/ — e.g. 10.61608/9783775758758'}),
    defineField({
      name: 'pdf',
      title: 'PDF',
      type: 'file',
      group: 'publication',
      options: {accept: 'application/pdf'},
    }),
    defineField({
      name: 'pdfUrl',
      title: 'PDF link',
      type: 'url',
      group: 'publication',
      description: 'When the open-access PDF is hosted elsewhere (e.g. OAPEN), instead of a file above.',
    }),
    // The publisher: the colophon's row and the end of the issue's citation ("Berlin: Hatje Cantz")
    defineField({name: 'publisher', title: 'Publisher', type: 'string', group: 'publication', initialValue: 'Hatje Cantz'}),
    defineField({name: 'publisherPlace', title: 'Publisher’s city', type: 'string', group: 'publication', initialValue: 'Berlin', description: 'For the citation: Berlin: Hatje Cantz'}),
    defineField({name: 'buyUrl', title: 'Hatje Cantz link', type: 'url', group: 'publication'}),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      group: 'publication',
      options: {
        list: [
          {title: 'Available', value: 'available'},
          {title: 'Forthcoming', value: 'forthcoming'},
          {title: 'Sold out', value: 'soldOut'},
        ],
        layout: 'radio',
      },
      initialValue: 'available',
    }),
    defineField({
      name: 'citation',
      title: 'Citation (override)',
      type: 'text',
      rows: 3,
      group: 'publication',
      description: 'Leave empty to generate it automatically.',
    }),
  ],
  orderings: [{title: 'Number, newest first', name: 'numberDesc', by: [{field: 'number', direction: 'desc'}]}],
  preview: {
    select: {number: 'number', title: 'title', season: 'season', media: 'cover'},
    prepare: ({number, title, season, media}) => ({
      title: `Issue ${pad(number)} — ${title ?? ''}`,
      subtitle: season,
      media,
    }),
  },
})
