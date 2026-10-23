import {defineField, defineType} from 'sanity'

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'URL name',
      type: 'slug',
      options: {source: 'name'},
      validation: (r) => r.required(),
    }),
    defineField({name: 'bio', title: 'Bio', type: 'simpleText'}),
    defineField({name: 'link', title: 'Website', type: 'url'}),
  ],
  orderings: [{title: 'Name', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]}],
  preview: {select: {title: 'name'}},
})
