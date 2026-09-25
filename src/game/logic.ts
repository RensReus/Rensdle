import type { Direction, Hint, LinkMap, LinkStatus } from '../types'

/** Comparison form of a word: case, accents, spaces and hyphens are ignored. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s\-‐-―]/g, '')
}

export function letterCount(word: string): number {
  return normalize(word).length
}

export function buildWords(start: string, hintsInChainOrder: Hint[]): string[] {
  return [start, ...hintsInChainOrder.map((h) => h.answer)]
}

function mulberry32(seed: number): () => number {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Same seed, same order. If the result equals the input order, the next seed is tried. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const shuffle = (s: number) => {
    const random = mulberry32(s)
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
  const unchanged = (result: T[]) => result.every((item, i) => item === items[i])

  let result = shuffle(seed)
  for (let attempt = 1; items.length > 1 && unchanged(result) && attempt < 100; attempt++) {
    result = shuffle(seed + attempt)
  }
  return result
}

export interface Frontiers {
  /** Number of links (hints); words are indexed 0..n. */
  n: number
  /** Words 0..top are known from the start word. */
  top: number
  /** Words bottom..n are known from the end word (bottom === n: only the end word). */
  bottom: number
  complete: boolean
  /** The end word is not shown and must be typed. */
  endHidden: boolean
  direction: Direction
  activeRow: number | null
  /** Links solved by typing the active row; the first is the "own" link of the active side. */
  activeLinks: number[]
  canFlip: boolean
}

export function deriveFrontiers(links: LinkMap, n: number, chosen: Direction): Frontiers {
  let top = 0
  while (top < n && links[top]) top++

  if (top === n) {
    return { n, top: n, bottom: 0, complete: true, endHidden: false, direction: chosen, activeRow: null, activeLinks: [], canFlip: false }
  }

  let bottom = n
  while (bottom > top + 1 && links[bottom - 1]) bottom--

  // Solving down from the third-to-last word, the end word hides so the second-to-last word
  // solves only its own link (`top >= 1`: the start word doesn't count as answered).
  const onlyEndLeft = bottom === n && top === n - 1
  const endHidden = onlyEndLeft || (bottom === n && top === n - 2 && top >= 1 && chosen === 'down')
  const direction: Direction = onlyEndLeft ? 'down' : chosen
  // One word left between both sides: typing it solves both links.
  const singleGap = !endHidden && bottom - top === 2

  let activeRow: number
  let activeLinks: number[]
  if (direction === 'down') {
    activeRow = top + 1
    activeLinks = singleGap ? [top, top + 1] : [top]
  } else {
    activeRow = bottom - 1
    activeLinks = singleGap ? [bottom - 1, top] : [bottom - 1]
  }

  return { n, top, bottom, complete: false, endHidden, direction, activeRow, activeLinks, canFlip: !onlyEndLeft }
}

export function isRowKnown(row: number, f: Frontiers): boolean {
  return f.complete || row <= f.top || (row >= f.bottom && !f.endHidden)
}

/** The word all open hints currently refer to. */
export function currentRow(f: Frontiers): number | null {
  if (f.complete) return null
  return f.direction === 'down' ? f.top : f.bottom
}

export type HintSegment =
  | { kind: 'text'; text: string }
  | { kind: 'word'; text: string; current: boolean; placeholder: 'prev' | 'answer' }
  | { kind: 'blank' }

/**
 * Fills `$prev$` / `$answer$`.
 * Solved hints show their own words. Open hints all show the current word:
 * going down it replaces `$prev$`, going up it replaces `$answer$`; the other becomes a blank.
 * Hints without `$answer$` get ` → $answer$` appended when solved or when solving up.
 */
export function renderHint(hint: Hint, words: string[], solved: boolean, f: Frontiers): HintSegment[] {
  const showAnswer = !hint.hint.includes('$answer$') && (solved || f.direction === 'up')
  const template = showAnswer ? `${hint.hint} → $answer$` : hint.hint
  return template
    .split(/(\$prev\$|\$answer\$)/)
    .filter((part) => part !== '')
    .map((part): HintSegment => {
      if (part !== '$prev$' && part !== '$answer$') return { kind: 'text', text: part }
      const isPrev = part === '$prev$'
      const placeholder = isPrev ? 'prev' : 'answer'
      if (solved) return { kind: 'word', text: words[isPrev ? hint.id : hint.id + 1], current: false, placeholder }
      if (f.direction === 'down') return isPrev ? { kind: 'word', text: words[f.top], current: true, placeholder } : { kind: 'blank' }
      return isPrev ? { kind: 'blank' } : { kind: 'word', text: words[f.bottom], current: true, placeholder }
    })
}

const POINTS: Record<LinkStatus, number> = { clean: 1, hint: 0.5, answer: 0 }
const BALLS: Record<LinkStatus, string> = { clean: '🟢', hint: '🟡', answer: '🔴' }

export function ball(status: LinkStatus): string {
  return BALLS[status]
}

export function score(statuses: LinkStatus[]): number {
  if (statuses.length === 0) return 0
  const points = statuses.reduce((sum, s) => sum + POINTS[s], 0)
  // points * 100 is an integer, so the division is the only rounding step.
  return Math.floor((points * 100) / statuses.length)
}

export function shareText(opts: { id: number; start: string; end: string; statuses: LinkStatus[]; url: string }): string {
  return [
    `${opts.start} → ${opts.end} [${score(opts.statuses)}%]`,
    `Rensdle #${opts.id}`,
    opts.url,
    '',
    opts.statuses.map(ball).join(''),
  ].join('\n')
}
