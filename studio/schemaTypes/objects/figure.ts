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
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({name: 'credit', title: 'Credit', type: 'string'}),
  ],
  preview: {
    select: {title: 'caption', subtitle: 'credit', media: 'asset'},
  },
})
