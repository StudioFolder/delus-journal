import {defineArrayMember, defineField, defineType} from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({name: 'text', title: 'Text', type: 'richText'}),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      description: 'Rows such as Editors, Graphic design, Publisher, Contact',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'creditRow',
          fields: [
            defineField({name: 'label', title: 'Label', type: 'string'}),
            defineField({name: 'value', title: 'Value', type: 'simpleText'}),
          ],
          preview: {select: {title: 'label'}},
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'About'})},
})

export const donate = defineType({
  name: 'donate',
  title: 'Donate',
  type: 'document',
  fields: [
    defineField({name: 'text', title: 'Text', type: 'richText'}),
    defineField({name: 'link', title: 'Donation link', type: 'url'}),
  ],
  preview: {prepare: () => ({title: 'Donate'})},
})

export const shop = defineType({
  name: 'shop',
  title: 'Shop',
  type: 'document',
  description: 'The grid of issues is generated from the issues themselves.',
  fields: [defineField({name: 'intro', title: 'Intro', type: 'simpleText'})],
  preview: {prepare: () => ({title: 'Shop'})},
})

// Imprint and Privacy: reached from the footer (desktop) and the menu
// (phone), laid out as News. The text's headings (style Heading) open
// its sections.
export const imprint = defineType({
  name: 'imprint',
  title: 'Imprint',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', initialValue: 'Imprint'}),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'richText',
      description: 'Each section opens with a Heading (e.g. Published by, Contact, Rights).',
    }),
  ],
  preview: {prepare: () => ({title: 'Imprint'})},
})

export const privacy = defineType({
  name: 'privacy',
  title: 'Privacy',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', initialValue: 'Privacy'}),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'richText',
      description:
        'Each section opens with a Heading (e.g. Hosting, Visit statistics, Newsletter). "Last updated" is added by the site, with the day this page was last published.',
    }),
  ],
  preview: {prepare: () => ({title: 'Privacy'})},
})

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({name: 'statement', title: 'Homepage statement', type: 'text', rows: 3}),
    defineField({
      name: 'featuredIssue',
      title: 'Featured issue',
      type: 'reference',
      to: [{type: 'issue'}],
      description: 'Leave empty to feature the latest issue.',
    }),
    defineField({name: 'footer', title: 'Footer text', type: 'string', initialValue: 'Journal for Landscape and Urban Studies'}),
    defineField({
      name: 'social',
      title: 'Social links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({name: 'label', title: 'Label', type: 'string'}),
            defineField({name: 'url', title: 'URL', type: 'url'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Search & sharing',
      type: 'object',
      fields: [
        defineField({name: 'title', title: 'Site title', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
        defineField({name: 'image', title: 'Sharing image', type: 'image'}),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
