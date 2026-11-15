import {figure} from './objects/figure'
import {articleLink, simpleText, richText, titleText} from './objects/text'
import {contribution} from './objects/contribution'
import {issue} from './documents/issue'
import {person} from './documents/person'
import {post} from './documents/post'
import {about, donate, shop, imprint, privacy, siteSettings} from './singletons/pages'

export const singletonTypes = new Set(['about', 'donate', 'shop', 'imprint', 'privacy', 'siteSettings'])

export const schemaTypes = [
  figure,
  articleLink,
  simpleText,
  titleText,
  richText,
  contribution,
  issue,
  person,
  post,
  about,
  donate,
  shop,
  imprint,
  privacy,
  siteSettings,
]
