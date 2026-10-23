import {defineArrayMember, defineField, defineType} from 'sanity'

// One entry in an issue's table of contents
export const contribution = defineType({
  name: 'contribution',
  title: 'Contribution',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
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
