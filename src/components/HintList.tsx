import type { Hint, LinkMap, LinkStatus, Puzzle } from '../types'
import { renderHint, type Frontiers } from '../game/logic'
import { nl } from '../i18n/nl'

interface HintListProps {
  puzzle: Puzzle
  order: Hint[]
  frontiers: Frontiers
  links: LinkMap
  hinted: number[]
}

export function HintList({ puzzle, order, frontiers, links, hinted }: HintListProps) {
  const open = order.filter((h) => !links[h.id])
  // Solved hints are listed in chain order so they read as the solution path.
  const solved = puzzle.hints.filter((h) => links[h.id])

  return (
    <>
      {open.length > 0 && (
        <section>
          <h3 className="section-title">{nl.findHint}</h3>
          {open.map((h) => (
            <HintCard key={h.id} hint={h} puzzle={puzzle} frontiers={frontiers} highlighted={hinted.includes(h.id)} />
          ))}
        </section>
      )}
      {solved.length > 0 && (
        <section className={frontiers.complete ? 'hints-all' : undefined}>
          <h3 className="section-title">{frontiers.complete ? nl.allHints : nl.solvedHints}</h3>
          {solved.map((h) => (
            <HintCard key={h.id} hint={h} puzzle={puzzle} frontiers={frontiers} status={links[h.id]} />
          ))}
        </section>
      )}
    </>
  )
}

interface HintCardProps {
  hint: Hint
  puzzle: Puzzle
  frontiers: Frontiers
  status?: LinkStatus
  highlighted?: boolean
}

function HintCard({ hint, puzzle, frontiers, status, highlighted }: HintCardProps) {
  const segments = renderHint(hint, puzzle.words, status !== undefined, frontiers)
  const classes = ['hint-card', status && 'hint-card--solved', highlighted && 'hint-card--highlighted']

  return (
    <div className={classes.filter(Boolean).join(' ')}>
      <p className="hint-text">
        {segments.map((s, i) => {
          if (s.kind === 'text') return s.text
          if (s.kind === 'blank') return <span key={i} className="hint-blank" role="img" aria-label={nl.unknownWord} />
          return (
            <span key={i} className={`hint-word hint-word--${s.placeholder}${s.current ? ' hint-word--current' : ''}`}>
              {s.text}
            </span>
          )
        })}
      </p>
    </div>
  )
}
