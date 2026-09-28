import { useEffect, useState } from 'react'
import type { LinkMap } from '../types'

export const TUTORIAL_STEPS = ['first', 'shuffled', 'lamp', 'eye', 'up'] as const

export type TutorialStep = (typeof TUTORIAL_STEPS)[number]

export interface Tutorial {
  /** The explanation on screen, or null for the finished state. */
  step: TutorialStep | null
  /** 1-based. */
  position: number
  total: number
  toPrev: (() => void) | null
  toNext: (() => void) | null
  /** Hints that are given away: marked as if their hint button had been used. */
  givenHints: number[]
  showHelp: boolean
  allowFlip: boolean
  /** The step arrows; the progress bar itself is always visible. */
  showNav: boolean
}

const DONE = TUTORIAL_STEPS.length
const LAMP = TUTORIAL_STEPS.indexOf('lamp')
const UP = TUTORIAL_STEPS.indexOf('up')

/** A player who solves the third link without the hint button skips the answer step. */
function reached(links: LinkMap, hinted: number[], complete: boolean): number {
  if (complete) return DONE
  const solved = Object.keys(links).length
  if (solved === 0) return 0
  if (solved === 1) return 1
  if (solved === 2) return hinted.length > 0 ? LAMP + 1 : LAMP
  return UP
}

/** Returns null for a normal puzzle; the hooks run either way, so the call stays unconditional. */
export function useTutorial(isTutorial: boolean, links: LinkMap, hinted: number[], complete: boolean): Tutorial | null {
  const [browsing, setBrowsing] = useState<number | null>(null)
  const current = reached(links, hinted, complete)

  // Playing on beats browsing: a step the game reaches is shown right away.
  useEffect(() => setBrowsing(null), [current])

  if (!isTutorial) return null

  const shown = browsing ?? current
  const last = complete ? DONE : DONE - 1
  // Reading ahead unlocks the buttons as well; paging back never takes them away again.
  const unlocked = Math.max(shown, current)

  return {
    step: shown === DONE ? null : TUTORIAL_STEPS[shown],
    position: shown + 1,
    total: DONE + 1,
    toPrev: shown > 0 ? () => setBrowsing(shown - 1) : null,
    toNext: shown < last ? () => setBrowsing(shown + 1) : null,
    givenHints: Object.keys(links).length === 0 ? [0] : [],
    showHelp: unlocked >= LAMP,
    allowFlip: unlocked >= UP,
    showNav: current > 0,
  }
}
