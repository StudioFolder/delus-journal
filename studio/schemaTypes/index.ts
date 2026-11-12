import {figure} from './objects/figure'
import {articleLink, simpleText, richText} from './objects/text'
import {contribution} from './objects/contribution'
import {issue} from './documents/issue'
import {person} from './documents/person'
import {post} from './documents/post'
import {about, donate, shop, siteSettings} from './singletons/pages'

export const singletonTypes = new Set(['about', 'donate', 'shop', 'siteSettings'])

export const schemaTypes = [
  figure,
  articleLink,
  simpleText,
  richText,
  contribution,
  issue,
  person,
  post,
  about,
  donate,
  shop,
  siteSettings,
]
