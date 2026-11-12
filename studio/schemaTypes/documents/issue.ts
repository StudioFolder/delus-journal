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
    defineField({name: 'editedBy', title: 'Edited by', type: 'string', group: 'main'}),
    defineField({
      name: 'designedBy',
      title: 'Designed by',
      type: 'string',
      group: 'main',
      initialValue: 'Studio Folder',
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
        defineField({name: 'text', title: 'Text', type: 'richText'}),
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
    defineField({name: 'binding', title: 'Binding', type: 'string', group: 'publication', description: 'e.g. Paperback with lay-flat binding'}),
    defineField({name: 'format', title: 'Format', type: 'string', group: 'publication', description: 'e.g. 210 × 240 mm'}),
    defineField({name: 'isbn', title: 'ISBN', type: 'string', group: 'publication'}),
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
