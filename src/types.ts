export interface PuzzleFile {
  id: number
  start: string
  /** Usable in the URL. */
  name: string
  about?: string | null
  theme?: string | null
  hints: Hint[]
}

/**
 * Hint `id` k links word k to word k+1 (word 0 is the start word):
 * `$prev$` is word k, `$answer$` is word k+1.
 */
export interface Hint {
  id: number
  hint: string
  answer: string
}

export interface Puzzle extends PuzzleFile {
  /** start + every answer in chain order; the last one is the end word. */
  words: string[]
  tutorial?: boolean
}

export type Direction = 'down' | 'up'

/** How a link was solved: on its own, after viewing the hint, or by revealing the answer. */
export type LinkStatus = 'clean' | 'hint' | 'answer'

export type LinkMap = Partial<Record<number, LinkStatus>>
