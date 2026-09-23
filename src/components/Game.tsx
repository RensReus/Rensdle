import { useEffect, useMemo } from 'react'
import type { Puzzle } from '../types'
import { seededShuffle } from '../game/logic'
import { useGame } from '../game/useGame'
import { nl } from '../i18n/nl'
import { PuzzleHeader } from './PuzzleHeader'
import { Ladder } from './Ladder'
import { HintList } from './HintList'
import { Completion } from './Completion'

export function Game({ puzzle }: { puzzle: Puzzle }) {
  const game = useGame(puzzle)
  const order = useMemo(() => seededShuffle(puzzle.hints, puzzle.id), [puzzle])

  useEffect(() => {
    document.title = `${nl.puzzleNumber(puzzle.id)} · ${nl.title(puzzle.start, puzzle.words[puzzle.words.length - 1])}`
  }, [puzzle])

  return (
    <>
      <PuzzleHeader puzzle={puzzle} />
      <div className="game-area">
        <Ladder
          puzzle={puzzle}
          frontiers={game.frontiers}
          hinted={game.hinted}
          onSubmit={game.submit}
          onFlip={game.flip}
          onHint={game.showHint}
          onReveal={game.revealAnswer}
        />
        <div className="hints-col">
          {game.frontiers.complete && <Completion puzzle={puzzle} statuses={game.statuses} />}
          <HintList puzzle={puzzle} order={order} frontiers={game.frontiers} links={game.links} hinted={game.hinted} />
          {puzzle.about && (
            <section>
              <h3 className="section-title">{nl.about}</h3>
              <p className="about-text">{puzzle.about}</p>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
