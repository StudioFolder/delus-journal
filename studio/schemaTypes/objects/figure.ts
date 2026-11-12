import {defineField, defineType} from 'sanity'

// An image with caption and credit — used everywhere images appear
export const figure = defineType({
  name: 'figure',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description: 'Short description for screen readers and search engines.',
    }),
    defineField({
      name: 'label',
      title: 'Figure letter',
      type: 'string',
      description: 'In an article: the letter the text refers to, e.g. A for (FIG. A). Leave empty elsewhere.',
    }),
    // Formatted (italics for titles, links), not plain text
    defineField({name: 'caption', title: 'Caption', type: 'simpleText'}),
    defineField({name: 'credit', title: 'Credit', type: 'string'}),
  ],
  preview: {
    select: {label: 'label', caption: 'caption', subtitle: 'credit', media: 'asset'},
    prepare: ({label, caption, subtitle, media}) => ({
      title: [label, (caption?.[0]?.children ?? []).map((c: any) => c.text).join('')].filter(Boolean).join(' — '),
      subtitle,
      media,
    }),
  },
})
