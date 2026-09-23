import { useEffect, useRef } from 'react'
import { nl } from '../i18n/nl'

interface ConfirmModalProps {
  title: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ title, onConfirm, onCancel }: ConfirmModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        // Escape key: close through React state instead of the browser.
        e.preventDefault()
        onCancel()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal-box">
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <p className="modal-text">{nl.confirmQuestion}</p>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {nl.cancel}
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm} autoFocus>
            {nl.confirm}
          </button>
        </div>
      </div>
    </dialog>
  )
}
