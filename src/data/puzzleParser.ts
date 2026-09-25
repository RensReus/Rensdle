import type { Hint, Puzzle, PuzzleFile } from '../types'
import { buildWords } from '../game/logic'

const files = import.meta.glob<unknown>('/puzzles/*.json', { eager: true, import: 'default' })

const nonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

function validate(file: PuzzleFile): string[] {
  const problems: string[] = []
  if (typeof file !== 'object' || file === null || Array.isArray(file)) return ['file must be an object']
  if (!Number.isInteger(file.id)) problems.push('`id` must be an integer')
  if (!nonEmptyString(file.start)) problems.push('`start` must be a non-empty string')
  if (!nonEmptyString(file.name)) problems.push('`name` must be a non-empty string')
  const { hints } = file
  if (!Array.isArray(hints) || hints.length === 0) {
    problems.push('`hints` must be a non-empty list')
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
  const puzzles: Puzzle[] = []
  for (const [path, content] of Object.entries(files)) {
    const file = content as PuzzleFile
    const problems = validate(file)
    if (problems.length === 0 && puzzles.some((p) => p.id === file.id || p.name === file.name)) {
      problems.push('duplicate `id` or `name`')
    }
    if (problems.length > 0) {
      console.error(`[rensdle] ${path} skipped:\n- ${problems.join('\n- ')}`)
      continue
    }
    // File ids only set the order (gaps allowed); internally the id is the link position.
    const sorted = [...file.hints].sort((a, b) => a.id - b.id).map((h, position) => ({ ...h, id: position }))
    puzzles.push({ ...file, hints: sorted, words: buildWords(file.start, sorted) })
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
