import type {StructureResolver} from 'sanity/structure'

const singleton = (S: any, type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('issue').title('Issues'),
      S.documentTypeListItem('post').title('Events / News'),
      S.documentTypeListItem('person').title('People'),
      S.divider(),
      singleton(S, 'about', 'About'),
      singleton(S, 'donate', 'Donate'),
      singleton(S, 'shop', 'Shop'),
      S.divider(),
      singleton(S, 'imprint', 'Imprint'),
      singleton(S, 'privacy', 'Privacy'),
      S.divider(),
      singleton(S, 'siteSettings', 'Site settings'),
    ])
