import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { nl } from '../i18n/nl'

const KEY = 'rensdle:tutorial-popup-shown'

/** Treats a failing read as "shown", so a browser without storage doesn't nag every visit. */
function alreadyShown(): boolean {
  try {
    return localStorage.getItem(KEY) !== null
  } catch {
    return true
  }
}

function markShown() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // Storage unavailable: the choice counts for this visit only.
  }
}

export function WelcomeModal() {
  const [open, setOpen] = useState(() => !alreadyShown())
  const ref = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  if (!open) return null

  const choose = (toTutorial: boolean) => {
    markShown()
    setOpen(false)
    if (toTutorial) navigate('/tutorial')
  }

  return (
    <dialog ref={ref} className="modal" aria-labelledby="welcome-title" onCancel={(e) => e.preventDefault()}>
      <div className="modal-box">
        <h2 id="welcome-title" className="modal-title">
          {nl.welcomeTitle}
        </h2>
        <p className="modal-text welcome-text">{nl.welcomeTutorialText}</p>
        <button type="button" className="btn-primary welcome-btn" onClick={() => choose(true)} autoFocus>
          {nl.welcomeTutorial}
        </button>
        <p className="modal-text welcome-text">{nl.welcomeSkipText}</p>
        <button type="button" className="btn-secondary welcome-btn" onClick={() => choose(false)}>
          {nl.welcomeSkip}
        </button>
      </div>
    </dialog>
  )
}
