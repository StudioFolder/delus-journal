import {defineArrayMember, defineField, defineType} from 'sanity'

// The URL name made from a title — the same rule as the site's
// (site/src/lib/data/format.ts, slugOf): lower case, accents dropped,
// anything that is not a letter or a figure becomes one hyphen
const slugOf = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// One entry in an issue's table of contents
export const contribution = defineType({
  name: 'contribution',
  title: 'Contribution',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    // The article's address: /issues/<issue>/<this>/
    defineField({
      name: 'slug',
      title: 'URL name',
      type: 'slug',
      description: 'Generated from the title; can be shortened. The article is at /issues/<issue>/<URL name>/.',
      options: {
        source: (_doc: any, context: any) => context.parent?.title ?? '',
        slugify: slugOf,
        // Unique within its issue only
        isUnique: (value: string, context: any) =>
          (context.document?.contributions ?? []).filter((c: any) => c?.slug?.current === value).length <= 1,
      },
      validation: (r) =>
        r.required().custom((slug) =>
          slug?.current === 'editorial' ? 'This name is taken by the issue\u2019s editorial page' : true,
        ),
    }),
    defineField({
      name: 'people',
      title: 'Contributor(s)',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'person'}]})],
      validation: (r) => r.required().min(1),
    }),
    defineField({name: 'pages', title: 'Pages', type: 'string', description: 'e.g. 15–17'}),
    defineField({name: 'abstract', title: 'Abstract', type: 'simpleText'}),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'richText',
      description: 'The full text, when it is published on the website: paragraphs, chapter titles (Heading), quotes, footnotes.',
    }),
    defineField({
      name: 'pdf',
      title: 'PDF',
      type: 'file',
      options: {accept: 'application/pdf'},
      description: 'The article as a PDF, for "Download" on its page.',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [defineArrayMember({type: 'figure'})],
      options: {layout: 'grid'},
    }),
  ],
  preview: {
    select: {title: 'title', p0: 'people.0.name', p1: 'people.1.name', pages: 'pages', media: 'images.0'},
    prepare: ({title, p0, p1, pages, media}) => ({
      title,
      subtitle: [[p0, p1].filter(Boolean).join(', '), pages && `pp. ${pages}`].filter(Boolean).join(' · '),
      media,
    }),
  },
})
