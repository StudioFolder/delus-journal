// The picker of a link to a page of the journal (the "Article of the
// journal" field of a Link, schemaTypes/objects/text.ts): one list of
// all the issues, each with its own page, its editors' note and its
// contributions. What is kept is the issue and the contribution's place
// in it (its key), not its address: the link follows the article when
// its title or URL name changes.
import {useEffect, useState} from 'react'
import {Select, Stack, Text} from '@sanity/ui'
import {set, unset, useClient, type ObjectInputProps} from 'sanity'

type Row = {
  _id: string
  number?: number
  title?: string
  contributions?: {_key: string; title?: string; people?: (string | null)[]}[]
}
type Value = {_type: 'articleLink'; issue?: {_ref?: string}; key?: string}

const query = `*[_type == "issue"] | order(number desc) {
  _id, number, title,
  contributions[]{_key, title, "people": people[]->name}
}`
const published = (id: string) => id.replace(/^drafts\./, '')
const two = (n?: number) => String(n ?? 0).padStart(2, '0')

export function ArticlePicker(props: ObjectInputProps) {
  const {onChange, readOnly} = props
  const value = props.value as Value | undefined
  const client = useClient({apiVersion: '2025-02-19'})
  const [issues, setIssues] = useState<Row[]>()

  useEffect(() => {
    let on = true
    client
      .fetch<Row[]>(query, {}, {perspective: 'raw'})
      .then((rows) => {
        // An issue being edited comes twice (as published and as a
        // draft): the draft, which is what the editor sees, is kept
        const byId = new Map<string, Row>()
        for (const row of rows) {
          if (row._id.startsWith('versions.')) continue
          const id = published(row._id)
          if (!byId.has(id) || row._id.startsWith('drafts.')) byId.set(id, {...row, _id: id})
        }
        if (on) setIssues([...byId.values()])
      })
      .catch(() => on && setIssues([]))
    return () => {
      on = false
    }
  }, [client])

  // One option = "<issue id>|<what>": nothing for the issue's own page,
  // "editorial", or the key of a contribution
  const current = value?.issue?._ref ? `${value.issue._ref}|${value.key ?? ''}` : ''
  const known =
    !current ||
    issues?.some(
      (issue) =>
        issue._id === value?.issue?._ref &&
        (!value?.key ||
          value.key === 'editorial' ||
          issue.contributions?.some((c) => c._key === value.key)),
    )

  function choose(option: string) {
    if (!option) return onChange(unset())
    const [issue, key] = option.split('|')
    onChange(
      set({
        _type: 'articleLink',
        issue: {_type: 'reference', _ref: issue, _weak: true},
        ...(key && {key}),
      }),
    )
  }

  return (
    <Stack gap={2}>
      <Select
        value={current}
        readOnly={readOnly}
        disabled={!issues}
        onChange={(event) => choose(event.currentTarget.value)}
      >
        <option value="">{issues ? 'None' : 'Loading…'}</option>
        {!known && <option value={current}>(no longer in the journal)</option>}
        {issues?.map((issue) => (
          <optgroup key={issue._id} label={`Issue ${two(issue.number)} — ${issue.title ?? ''}`}>
            <option value={`${issue._id}|`}>The issue’s page</option>
            <option value={`${issue._id}|editorial`}>A Note from the Editors</option>
            {issue.contributions?.map((c) => (
              <option key={c._key} value={`${issue._id}|${c._key}`}>
                {c.title ?? 'Untitled'}
                {c.people?.filter(Boolean).length ? ` — ${c.people.filter(Boolean).join(', ')}` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
      {!known && (
        <Text size={1} muted>
          The article this link pointed to has been removed: choose another one.
        </Text>
      )}
    </Stack>
  )
}
