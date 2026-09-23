import type { Hint, Puzzle, PuzzleMeta } from '../types'
import { buildWords } from '../game/logic'
import index from '../../puzzles.json'

const files = import.meta.glob<unknown>('/puzzles/*.json', { eager: true, import: 'default' })

const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

function validate(meta: PuzzleMeta, hints: unknown): string[] {
  const problems: string[] = []
  if (!Number.isInteger(meta.id)) problems.push('`id` must be an integer')
  if (!nonEmptyString(meta.start)) problems.push('`start` must be a non-empty string')
  if (!nonEmptyString(meta.name)) problems.push('`name` must be a non-empty string')
  if (hints === undefined) {
    problems.push(`file puzzles/${meta.name}.json not found`)
    return problems
  }
  if (!Array.isArray(hints) || hints.length === 0) {
    problems.push('hint file must be a non-empty list')
    return problems
  }
  const ids = hints.map((h: Hint) => h.id)
  if (!ids.every((id) => Number.isInteger(id) && id >= 0)) problems.push('hint ids must be integers >= 0')
  if (new Set(ids).size !== ids.length) problems.push(`hint ids must be unique, got [${ids.join(', ')}]`)
  hints.forEach((h: Hint, i) => {
    if (!nonEmptyString(h.hint)) problems.push(`hint #${i}: \`hint\` must be a non-empty string`)
    if (!nonEmptyString(h.answer)) problems.push(`hint #${i}: \`answer\` must be a non-empty string`)
  })
  return problems
}

function load(): Puzzle[] {
  if (!Array.isArray(index)) {
    console.error('[rensdle] puzzles.json is not a list')
    return []
  }

  const puzzles: Puzzle[] = []
  for (const meta of index as unknown as PuzzleMeta[]) {
    const hints = files[`/puzzles/${meta.name}.json`]
    const problems = validate(meta, hints)
    if (puzzles.some((p) => p.id === meta.id || p.name === meta.name)) problems.push('duplicate `id` or `name`')
    if (problems.length > 0) {
      console.error(`[rensdle] puzzle ${meta.id} (${meta.name}) skipped:\n- ${problems.join('\n- ')}`)
      continue
    }
    // File ids only set the order (gaps allowed); internally the id is the link position.
    const sorted = [...(hints as Hint[])].sort((a, b) => a.id - b.id).map((h, position) => ({ ...h, id: position }))
    puzzles.push({ ...meta, hints: sorted, words: buildWords(meta.start, sorted) })
  }
  return puzzles.sort((a, b) => a.id - b.id)
}

export const puzzles: Puzzle[] = load()

export function getPuzzle(idOrName: string): Puzzle | undefined {
  if (/^\d+$/.test(idOrName)) {
    const byId = puzzles.find((p) => p.id === Number(idOrName))
    if (byId) return byId
  }
  const name = idOrName.toLowerCase()
  return puzzles.find((p) => p.name.toLowerCase() === name)
}

export function getNeighbours(id: number): { prev?: Puzzle; next?: Puzzle } {
  const index = puzzles.findIndex((p) => p.id === id)
  return { prev: puzzles[index - 1], next: puzzles[index + 1] }
}
