import type { Hint, LinkMap, LinkStatus, Puzzle } from '../types'
import { renderHint, type Frontiers, type HintSegment } from '../game/logic'
import { nl } from '../i18n/nl'

interface HintListProps {
  puzzle: Puzzle
  order: Hint[]
  frontiers: Frontiers
  links: LinkMap
  highlighted: number[]
}

export function HintList({ puzzle, order, frontiers, links, highlighted }: HintListProps) {
  const open = order.filter((h) => !links[h.id])
  // Chain order, so the solved hints read as the solution path.
  const solved = puzzle.hints.filter((h) => links[h.id])
  const dim = open.some((h) => highlighted.includes(h.id))

  return (
    <>
      {open.length > 0 && (
        <section>
          <h3 className="section-title">{nl.findHint}</h3>
          {open.map((h) => (
            <HintCard
              key={h.id}
              hint={h}
              puzzle={puzzle}
              frontiers={frontiers}
              highlighted={highlighted.includes(h.id)}
              dimmed={dim && !highlighted.includes(h.id)}
            />
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
  dimmed?: boolean
}

function HintCard({ hint, puzzle, frontiers, status, highlighted, dimmed }: HintCardProps) {
  const segments = renderHint(hint, puzzle.words, status !== undefined, frontiers)
  const classes = ['hint-card', status && 'hint-card--solved', highlighted && 'hint-card--highlighted', dimmed && 'hint-card--dimmed']

  return (
    <div className={classes.filter(Boolean).join(' ')}>
      <HintText segments={segments} />
    </div>
  )
}

export function HintText({ segments }: { segments: HintSegment[] }) {
  return (
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
  )
}
