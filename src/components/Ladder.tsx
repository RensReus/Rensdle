import { useRef, useState } from 'react'
import { ConfirmModal } from './ConfirmModal'
import type { Puzzle } from '../types'
import { currentRow, isRowKnown, letterCount, type Frontiers } from '../game/logic'
import { nl } from '../i18n/nl'

interface LadderProps {
  puzzle: Puzzle
  frontiers: Frontiers
  hinted: number[]
  showHelp: boolean
  allowFlip: boolean
  onSubmit: (value: string) => boolean
  onFlip: () => void
  onHint: () => void
  onReveal: () => void
}

export function Ladder({ puzzle, frontiers: f, hinted, showHelp, allowFlip, onSubmit, onFlip, onHint, onReveal }: LadderProps) {
  const current = currentRow(f)
  // Clicking the unanswered row at the other end of the gap flips the direction.
  const flipRow = !f.canFlip || !allowFlip ? null : f.direction === 'up' ? f.top + 1 : f.endHidden ? f.n : f.bottom - 1

  return (
    <div className="ladder-col">
      <div className="ladder">
        {puzzle.words.map((word, row) => {
          if (row === f.activeRow) {
            return (
              <ActiveRow
                key={`active-${row}`}
                word={word}
                hintUsed={hinted.includes(f.activeLinks[0])}
                showHelp={showHelp}
                onSubmit={onSubmit}
                onHint={onHint}
                onReveal={onReveal}
              />
            )
          }
          if (!isRowKnown(row, f)) {
            const letters = letterCount(word)
            const content = (
              <>
                <span className="letter-blocks" aria-hidden="true">
                  {Array.from({ length: letters }, (_, i) => (
                    <span key={i} className="letter-block" />
                  ))}
                </span>
                <span className="letter-count" aria-hidden="true">
                  ({letters})
                </span>
              </>
            )
            if (row === flipRow) {
              const label = f.direction === 'down' ? nl.flipUp : nl.flipDown
              return (
                <button key={row} type="button" className="row row--locked row--clickable" onClick={onFlip} title={label} aria-label={label}>
                  {content}
                </button>
              )
            }
            return (
              <div key={row} className="row row--locked" aria-label={nl.lockedLabel(letters)}>
                {content}
              </div>
            )
          }
          const classes = ['row', 'row--complete', row === current && 'row--current']
          return (
            <div key={row} className={classes.filter(Boolean).join(' ')}>
              {word}
            </div>
          )
        })}
      </div>
      {!f.complete && allowFlip && (
        <button type="button" className="flip-btn" onClick={onFlip} disabled={!f.canFlip}>
          {f.direction === 'down' ? nl.flipUp : nl.flipDown}
        </button>
      )}
    </div>
  )
}

interface ActiveRowProps {
  word: string
  hintUsed: boolean
  showHelp: boolean
  onSubmit: (value: string) => boolean
  onHint: () => void
  onReveal: () => void
}

function ActiveRow({ word, hintUsed, showHelp, onSubmit, onHint, onReveal }: ActiveRowProps) {
  const [value, setValue] = useState('')
  const [confirming, setConfirming] = useState<'hint' | 'answer' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const letters = letterCount(word)

  const closeModal = () => {
    setConfirming(null)
    inputRef.current?.focus()
  }

  return (
    <div className="row row--active">
      <span className="badge" aria-hidden="true">
        ({letters})
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          if (!onSubmit(e.target.value)) setValue(e.target.value)
        }}
        aria-label={nl.answerLabel(letters)}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {showHelp && (
        <div className="row-actions">
          {hintUsed ? (
            <button type="button" className="icon-btn" onClick={() => setConfirming('answer')} title={nl.showAnswer} aria-label={nl.showAnswer}>
              👁️
            </button>
          ) : (
            <button type="button" className="icon-btn" onClick={() => setConfirming('hint')} title={nl.showHint} aria-label={nl.showHint}>
              💡
            </button>
          )}
        </div>
      )}
      {confirming && (
        <ConfirmModal
          title={confirming === 'hint' ? nl.showHint : nl.showAnswer}
          onConfirm={() => {
            if (confirming === 'hint') onHint()
            else onReveal()
            closeModal()
          }}
          onCancel={closeModal}
        />
      )}
    </div>
  )
}
