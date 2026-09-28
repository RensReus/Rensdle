import { Link } from 'react-router'
import type { Puzzle } from '../types'
import { getNeighbours } from '../data/puzzleParser'
import { nl } from '../i18n/nl'
import { text as editorText } from '../editor/text'

export function PuzzleHeader({ puzzle, onClear }: { puzzle: Puzzle; onClear: () => void }) {
  const end = puzzle.words[puzzle.words.length - 1]
  const title = <h2 className="puzzle-title">{nl.title(puzzle.start, end)}</h2>

  if (puzzle.tutorial) {
    return (
      <header className="puzzle-header">
        <div className="pill">
          <span>{nl.tutorial}</span>
        </div>
        {title}
      </header>
    )
  }

  const { prev, next } = getNeighbours(puzzle.id)

  return (
    <header className="puzzle-header">
      <div className="pill">
        <span>{nl.puzzleNumber(puzzle.id)}</span>
        {puzzle.theme && <span className="pill-theme">{puzzle.theme}</span>}
      </div>
      {import.meta.env.DEV && (
        <span className="dev-links">
          <Link className="dev-link" to={`/editor?id=${puzzle.id}`}>
            {editorText.edit}
          </Link>
          <button type="button" className="dev-link" onClick={onClear}>
            {editorText.clearPuzzle}
          </button>
        </span>
      )}
      <div className="puzzle-nav">
        <NavLink to={prev && `/game/${prev.id}`} label={nl.previousPuzzle} symbol="←" />
        {title}
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
