import {defineArrayMember, defineField, defineType} from 'sanity'
import {plainTitle} from '../objects/text'

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
    // The title can have words in italics (an issue's title): one line of
    // text with the Italic button. The URL name is made from its words.
    defineField({
      name: 'title',
      title: 'Title',
      type: 'titleText',
      description: 'One line. Italics for the title of an issue or of a work.',
      validation: (r) =>
        r.custom((value?: unknown[]) =>
          !plainTitle(value as never) ? 'Required' : (value?.length ?? 0) > 1 ? 'One line only' : true
        ),
    }),
    defineField({
      name: 'slug',
      title: 'URL name',
      type: 'slug',
      options: {source: (doc) => plainTitle(doc.title as never)},
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
      title: plainTitle(title),
      subtitle: [kinds.find((k) => k.value === kind)?.title, date].filter(Boolean).join(' · '),
      media,
    }),
  },
})
