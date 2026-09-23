import { useState } from 'react'
import { Link } from 'react-router'
import type { LinkStatus, Puzzle } from '../types'
import { ball, score, shareText } from '../game/logic'
import { getNeighbours } from '../data/puzzleParser'
import { nl } from '../i18n/nl'

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for browsers without the async clipboard API (or non-secure contexts).
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

export function Completion({ puzzle, statuses }: { puzzle: Puzzle; statuses: LinkStatus[] }) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const { next } = getNeighbours(puzzle.id)

  const share = async () => {
    const text = shareText({
      id: puzzle.id,
      start: puzzle.start,
      end: puzzle.words[puzzle.words.length - 1],
      statuses,
      url: `${location.origin}${import.meta.env.BASE_URL}game/${puzzle.id}`,
    })
    setFeedback((await copyToClipboard(text)) ? nl.copied : nl.copyFailed)
  }

  return (
    <section className="completion">
      <p className="completion-title">{nl.solved}</p>
      <p className="completion-score">{nl.score(score(statuses))}</p>
      <p className="completion-balls">{statuses.map(ball).join('')}</p>
      <div className="completion-actions">
        <button type="button" className="btn-primary" onClick={share}>
          {feedback ?? nl.share}
        </button>
        {next && (
          <Link className="btn-secondary" to={`/game/${next.id}`}>
            {nl.toNextPuzzle}
          </Link>
        )}
      </div>
    </section>
  )
}
