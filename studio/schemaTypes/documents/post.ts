import {defineArrayMember, defineField, defineType} from 'sanity'

const kinds = [
  {title: 'News', value: 'news'},
  {title: 'Event', value: 'event'},
  {title: 'Open call', value: 'openCall'},
]

export const post = defineType({
  name: 'post',
  title: 'Event / News',
  type: 'document',
  fields: [
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {list: kinds, layout: 'radio', direction: 'horizontal'},
      initialValue: 'news',
      validation: (r) => r.required(),
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'URL name',
      type: 'slug',
      options: {source: 'title'},
      validation: (r) => r.required(),
    }),
    defineField({name: 'date', title: 'Date', type: 'date', validation: (r) => r.required()}),
    defineField({name: 'time', title: 'Time', type: 'string', description: 'Optional, e.g. 18:30'}),
    defineField({name: 'place', title: 'Place', type: 'string'}),
    defineField({name: 'link', title: 'Link', type: 'url'}),
    defineField({name: 'relatedIssue', title: 'Related issue', type: 'reference', to: [{type: 'issue'}]}),
    defineField({name: 'text', title: 'Text', type: 'richText'}),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [defineArrayMember({type: 'figure'})],
      options: {layout: 'grid'},
    }),
  ],
  orderings: [{title: 'Date, newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', kind: 'kind', date: 'date', media: 'images.0'},
    prepare: ({title, kind, date, media}) => ({
      title,
      subtitle: [kinds.find((k) => k.value === kind)?.title, date].filter(Boolean).join(' · '),
      media,
    }),
  },
})
