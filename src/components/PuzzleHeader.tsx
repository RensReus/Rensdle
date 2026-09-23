import { Link } from 'react-router'
import type { Puzzle } from '../types'
import { getNeighbours } from '../data/puzzleParser'
import { nl } from '../i18n/nl'

export function PuzzleHeader({ puzzle }: { puzzle: Puzzle }) {
  const { prev, next } = getNeighbours(puzzle.id)
  const end = puzzle.words[puzzle.words.length - 1]

  return (
    <header className="puzzle-header">
      <div className="pill">
        <span>{nl.puzzleNumber(puzzle.id)}</span>
        {puzzle.theme && <span className="pill-theme">{puzzle.theme}</span>}
      </div>
      <div className="puzzle-nav">
        <NavLink to={prev && `/game/${prev.id}`} label={nl.previousPuzzle} symbol="←" />
        <h2 className="puzzle-title">{nl.title(puzzle.start, end)}</h2>
        <NavLink to={next && `/game/${next.id}`} label={nl.nextPuzzle} symbol="→" />
      </div>
    </header>
  )
}

function NavLink({ to, label, symbol }: { to?: string; label: string; symbol: string }) {
  if (!to) {
    return (
      <span className="nav-btn nav-btn--disabled" aria-hidden="true">
        {symbol}
      </span>
    )
  }
  return (
    <Link className="nav-btn" to={to} title={label} aria-label={label}>
      {symbol}
    </Link>
  )
}
