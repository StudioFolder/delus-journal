import {defineArrayMember, defineField, defineType} from 'sanity'

const link = {
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [defineField({name: 'href', title: 'URL', type: 'url', validation: (r) => r.uri({scheme: ['http', 'https', 'mailto']})})],
}

// Short formatted text: italics, bold, links. For abstracts, bios, credits, intros.
export const simpleText = defineType({
  name: 'simpleText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Italic', value: 'em'},
          {title: 'Bold', value: 'strong'},
        ],
        annotations: [link],
      },
    }),
  ],
})

// Long formatted text with headings, quotes, lists and footnotes. For the
// editorial, the text of a contribution, posts, About.
// A footnote is attached to the word it follows: select the last word
// before the note's number, then Footnote. The site numbers them in order.
export const richText = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Heading', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Italic', value: 'em'},
          {title: 'Bold', value: 'strong'},
        ],
        annotations: [
          link,
          {
            name: 'footnote',
            title: 'Footnote',
            type: 'object',
            fields: [
              // Formatted (italics for titles, links), not plain text
              defineField({
                name: 'text',
                title: 'Footnote text',
                type: 'simpleText',
                validation: (r) => r.required(),
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({type: 'figure'}),
  ],
})
