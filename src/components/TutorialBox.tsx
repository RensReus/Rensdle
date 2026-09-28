import { Link } from 'react-router'
import type { Direction } from '../types'
import type { Tutorial } from '../game/tutorial'
import { nl } from '../i18n/nl'

export function TutorialBox({ tutorial, direction }: { tutorial: Tutorial; direction: Direction }) {
  const { step } = tutorial
  const text = step === 'up' && direction === 'up' ? nl.tutorialStep.upActive : step && nl.tutorialStep[step]

  return (
    <section className={step ? 'tutorial-box' : 'tutorial-box tutorial-box--done'}>
      <TutorialNav tutorial={tutorial} />
      <p className="tutorial-text">{text ?? nl.tutorialDone}</p>
      {!step && (
        <Link className="btn-primary" to="/">
          {nl.tutorialToPuzzles}
        </Link>
      )}
    </section>
  )
}

function TutorialNav({ tutorial: t }: { tutorial: Tutorial }) {
  return (
    <div className="tutorial-nav">
      {t.showNav && (
        <button
          type="button"
          className="step-btn"
          onClick={t.toPrev ?? undefined}
          disabled={!t.toPrev}
          title={nl.previousStep}
          aria-label={nl.previousStep}
        >
          ←
        </button>
      )}
      <span
        className="tutorial-progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={t.total}
        aria-valuenow={t.position}
        aria-label={nl.stepOf(t.position, t.total)}
      >
        {Array.from({ length: t.total }, (_, i) => (
          <span key={i} className={i < t.position ? 'tutorial-dot tutorial-dot--done' : 'tutorial-dot'} />
        ))}
      </span>
      {t.showNav && (
        <button
          type="button"
          className="step-btn"
          onClick={t.toNext ?? undefined}
          disabled={!t.toNext}
          title={nl.nextStep}
          aria-label={nl.nextStep}
        >
          →
        </button>
      )}
    </div>
  )
}
