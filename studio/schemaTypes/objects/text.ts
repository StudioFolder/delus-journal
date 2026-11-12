import {defineArrayMember, defineField, defineType} from 'sanity'
import {ArticlePicker} from '../../components/ArticlePicker'

// A link to a page of the journal: an issue and, in it, a contribution
// (by its key), the editors' note ("editorial") or nothing (the issue's
// own page). Chosen from one list (components/ArticlePicker.tsx); the
// site turns it into the page's address.
export const articleLink = defineType({
  name: 'articleLink',
  title: 'Article of the journal',
  type: 'object',
  fields: [
    defineField({name: 'issue', type: 'reference', to: [{type: 'issue'}], weak: true}),
    defineField({name: 'key', type: 'string'}),
  ],
  components: {input: ArticlePicker},
})

// A link on some words of a text: to an article of the journal, picked
// from the list, or to a web address — one of the two.
const link = {
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'article',
      title: 'Article of the journal',
      type: 'articleLink',
      description: 'To link to an article, an editors’ note or an issue of the journal: choose it here.',
    }),
    defineField({
      name: 'href',
      title: 'or a web address',
      type: 'url',
      description: 'For any other link: https://… (or mailto:… for an email address).',
      validation: (r: any) => r.uri({scheme: ['http', 'https', 'mailto']}),
    }),
  ],
  validation: (r: any) =>
    r.custom((value?: {article?: {issue?: unknown}; href?: string}) => {
      const article = Boolean(value?.article?.issue)
      const address = Boolean(value?.href)
      if (article && address) return 'Choose an article or write a web address, not both'
      return article || address || 'Choose an article of the journal or write a web address'
    }),
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
