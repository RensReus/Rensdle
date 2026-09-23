import { useEffect, useState } from 'react'
import type { Direction, LinkMap, LinkStatus, Puzzle } from '../types'
import { deriveFrontiers, normalize } from './logic'

interface SavedState {
  links: LinkMap
  /** Links for which the hint button was used (they score 🟡 once solved). */
  hinted: number[]
  direction: Direction
}

const storageKey = (id: number) => `rensdle:${id}`
const STATUSES: LinkStatus[] = ['clean', 'hint', 'answer']

function loadState(puzzle: Puzzle): SavedState {
  const empty: SavedState = { links: {}, hinted: [], direction: 'down' }
  try {
    const raw = localStorage.getItem(storageKey(puzzle.id))
    if (!raw) return empty
    const saved = JSON.parse(raw) as Partial<SavedState>
    const n = puzzle.hints.length
    const links: LinkMap = {}
    for (const [key, status] of Object.entries(saved.links ?? {})) {
      const link = Number(key)
      if (Number.isInteger(link) && link >= 0 && link < n && STATUSES.includes(status as LinkStatus)) links[link] = status
    }
    return {
      links,
      hinted: Array.isArray(saved.hinted) ? saved.hinted.filter((l) => Number.isInteger(l) && l >= 0 && l < n) : [],
      direction: saved.direction === 'up' ? 'up' : 'down',
    }
  } catch {
    return empty
  }
}

export function useGame(puzzle: Puzzle) {
  const [state, setState] = useState<SavedState>(() => loadState(puzzle))
  const n = puzzle.hints.length
  const frontiers = deriveFrontiers(state.links, n, state.direction)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(puzzle.id), JSON.stringify(state))
    } catch {
      // Storage unavailable (private mode): the game still works, just without saving.
    }
  }, [puzzle.id, state])

  /** Solves every active link; the first (own) link may get a forced status. */
  const solveActive = (ownStatus?: LinkStatus) =>
    setState((s) => {
      const f = deriveFrontiers(s.links, n, s.direction)
      const links = { ...s.links }
      f.activeLinks.forEach((link, i) => {
        links[link] = i === 0 && ownStatus ? ownStatus : s.hinted.includes(link) ? 'hint' : 'clean'
      })
      return { ...s, links }
    })

  const submit = (value: string): boolean => {
    if (frontiers.activeRow === null) return false
    const typed = normalize(value)
    if (typed === '' || typed !== normalize(puzzle.words[frontiers.activeRow])) return false
    solveActive()
    return true
  }

  const flip = () => setState((s) => ({ ...s, direction: s.direction === 'down' ? 'up' : 'down' }))

  const showHint = () => {
    const link = frontiers.activeLinks[0]
    if (link === undefined) return
    setState((s) => (s.hinted.includes(link) ? s : { ...s, hinted: [...s.hinted, link] }))
  }

  const revealAnswer = () => solveActive('answer')

  const statuses = puzzle.hints.map((h) => state.links[h.id]).filter((s): s is LinkStatus => s !== undefined)

  return { frontiers, links: state.links, hinted: state.hinted, statuses, submit, flip, showHint, revealAnswer }
}
