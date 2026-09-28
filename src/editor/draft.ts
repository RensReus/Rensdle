import type { Hint, PuzzleFile } from '../types'
import { text as t } from './text'

/** One editable hint. `hint` is shorthand (`_p` / `_a`); `shown` is the last valid hint in file form. */
export interface Row {
  key: number
  answer: string
  hint: string
  shown: string
}

export interface Draft {
  /** File name (without .json) this draft was loaded from; null for a new puzzle. */
  file: string | null
  id: string
  name: string
  start: string
  about?: string | null
  theme?: string | null
  rows: Row[]
}

export const validName = /^[a-z0-9_-]+$/i

let nextKey = 0

export const emptyRow = (): Row => ({ key: nextKey++, answer: '', hint: '', shown: '' })

export const toShorthand = (hint: string) => hint.replaceAll('$answer$', '_a').replaceAll('$prev$', '_p')
export const fromShorthand = (hint: string) => hint.replace(/_a/gi, '$$answer$$').replace(/_p/gi, '$$prev$$')

export function hintError(shorthand: string): string | null {
  const parts = fromShorthand(shorthand).split(/(\$prev\$|\$answer\$)/)
  const text = parts.filter((p) => p !== '$prev$' && p !== '$answer$').join('')
  if (text.includes('$')) return t.unknownDollar
  if (text.includes('_')) return t.unknownUnderscore
  if (parts.filter((p) => p === '$prev$').length > 1) return t.twice('_p')
  if (parts.filter((p) => p === '$answer$').length > 1) return t.twice('_a')
  return null
}

export function withHint(row: Row, hint: string): Row {
  return { ...row, hint, shown: hintError(hint) ? row.shown : fromShorthand(hint) }
}

export function newDraft(id: number): Draft {
  return { file: null, id: String(id), name: '', start: '', rows: [emptyRow()] }
}

export function draftFromFile(file: string, puzzle: PuzzleFile): Draft {
  const hints = [...(Array.isArray(puzzle.hints) ? puzzle.hints : [])].sort((a, b) => a.id - b.id)
  return {
    file,
    id: String(puzzle.id ?? ''),
    name: puzzle.name ?? file,
    start: puzzle.start ?? '',
    about: puzzle.about,
    theme: puzzle.theme,
    rows: hints.length > 0 ? hints.map((h) => withHint({ ...emptyRow(), answer: h.answer ?? '' }, toShorthand(h.hint ?? ''))) : [emptyRow()],
  }
}

const isEmpty = (row: Row) => row.answer.trim() === '' && row.hint.trim() === ''

/** Compared to detect unsaved changes; empty rows don't count, they aren't saved either. */
export function snapshot(draft: Draft): string {
  return JSON.stringify([draft.id, draft.name, draft.start, draft.rows.filter((r) => !isEmpty(r)).map((r) => [r.answer, r.hint])])
}

export function buildFile(draft: Draft): { puzzle: PuzzleFile } | { problems: string[] } {
  const problems: string[] = []
  if (!/^\d+$/.test(draft.id.trim())) problems.push(t.invalidId)
  if (!validName.test(draft.name.trim())) problems.push(t.invalidName)
  if (draft.start.trim() === '') problems.push(t.emptyStart)

  const hints: Hint[] = []
  draft.rows.forEach((row, i) => {
    if (isEmpty(row)) return
    const error = hintError(row.hint)
    if (row.answer.trim() === '' || row.hint.trim() === '') problems.push(t.incompleteRow(i + 1))
    else if (error) problems.push(t.invalidRow(i + 1, error))
    else hints.push({ id: hints.length, hint: fromShorthand(row.hint.trim()), answer: row.answer.trim() })
  })
  if (problems.length === 0 && hints.length === 0) problems.push(t.noHints)
  if (problems.length > 0) return { problems }

  const meta: Omit<PuzzleFile, 'hints'> = { id: Number(draft.id), start: draft.start.trim(), name: draft.name.trim() }
  if (draft.about !== undefined) meta.about = draft.about
  if (draft.theme !== undefined) meta.theme = draft.theme
  // hints last, so they're at the bottom of the file
  return { puzzle: { ...meta, hints } }
}
