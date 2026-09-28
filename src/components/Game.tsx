import { useEffect, useMemo } from 'react'
import type { Puzzle } from '../types'
import { seededShuffle } from '../game/logic'
import { useTutorial } from '../game/tutorial'
import { useGame } from '../game/useGame'
import { nl } from '../i18n/nl'
import { PuzzleHeader } from './PuzzleHeader'
import { Ladder } from './Ladder'
import { HintList } from './HintList'
import { Completion } from './Completion'
import { TutorialBox } from './TutorialBox'

export function Game({ puzzle }: { puzzle: Puzzle }) {
  const game = useGame(puzzle)
  const tutorial = useTutorial(!!puzzle.tutorial, game.links, game.hinted, game.frontiers.complete)
  const order = useMemo(() => seededShuffle(puzzle.hints, puzzle.id), [puzzle])

  useEffect(() => {
    document.title = puzzle.tutorial
      ? `${nl.appName} · ${nl.tutorial}`
      : `${nl.puzzleNumber(puzzle.id)} · ${nl.title(puzzle.start, puzzle.words[puzzle.words.length - 1])}`
  }, [puzzle])

  return (
    <>
      <PuzzleHeader puzzle={puzzle} onClear={game.reset} />
      <div className={tutorial ? 'game-area game-area--tutorial' : 'game-area'}>
        {tutorial && <TutorialBox tutorial={tutorial} direction={game.frontiers.direction} />}
        <Ladder
          puzzle={puzzle}
          frontiers={game.frontiers}
          hinted={game.hinted}
          showHelp={tutorial ? tutorial.showHelp : true}
          allowFlip={tutorial ? tutorial.allowFlip : true}
          onSubmit={game.submit}
          onFlip={game.flip}
          onHint={game.showHint}
          onReveal={game.revealAnswer}
        />
        <div className="hints-col">
          {game.frontiers.complete && !tutorial && <Completion puzzle={puzzle} statuses={game.statuses} />}
          <HintList
            puzzle={puzzle}
            order={order}
            frontiers={game.frontiers}
            links={game.links}
            highlighted={tutorial ? [...game.hinted, ...tutorial.givenHints] : game.hinted}
          />
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
