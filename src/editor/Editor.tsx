import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router'
import type { Direction, PuzzleFile } from '../types'
import { renderHint, type Frontiers } from '../game/logic'
import { HintText } from '../components/HintList'
import { ConfirmModal } from '../components/ConfirmModal'
import { text as t } from './text'
import { buildFile, draftFromFile, emptyRow, hintError, newDraft, snapshot, withHint, type Draft, type Row } from './draft'
import '../styles/editor.css'

/** Served by the dev-only plugin in editor-plugin.ts. */
interface StoredPuzzle {
  file: string
  puzzle: PuzzleFile
}

async function fetchPuzzles(): Promise<StoredPuzzle[]> {
  const res = await fetch('/__editor/puzzles')
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

async function writePuzzle(puzzle: PuzzleFile, originalFile: string | null): Promise<string | null> {
  const res = await fetch('/__editor/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ puzzle, originalFile }),
  })
  if (res.ok) return null
  const body = await res.json().catch(() => ({}))
  return body.error ?? t.saveFailed
}

const nextId = (stored: StoredPuzzle[]) => Math.max(-1, ...stored.map((s) => s.puzzle.id).filter(Number.isInteger)) + 1

/** Makes renderHint show one open hint as if its side were being solved. */
function previewFrontiers(direction: Direction, position: number, n: number): Frontiers {
  return { n, top: position, bottom: position + 1, complete: false, endHidden: false, direction, activeRow: null, activeLinks: [], canFlip: true }
}

type Field = 'answer' | 'hint'

export function Editor() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [stored, setStored] = useState<StoredPuzzle[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saved, setSaved] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<(() => void) | null>(null)
  const [solvedView, setSolvedView] = useState(true)
  const [direction, setDirection] = useState<Direction>('down')
  const [reorder, setReorder] = useState(false)

  const inputs = useRef(new Map<string, HTMLInputElement>())
  const focusNext = useRef<string | null>(null)
  const nameInput = useRef<HTMLInputElement>(null)

  const dirty = draft !== null && snapshot(draft) !== saved
  const dirtyRef = useRef(dirty)
  dirtyRef.current = dirty

  function show(next: Draft) {
    setDraft(next)
    setSaved(snapshot(next))
    setError(null)
  }

  function open(list: StoredPuzzle[], file: string) {
    const entry = list.find((s) => s.file === file)
    if (!entry) return
    show(draftFromFile(entry.file, entry.puzzle))
    setSearchParams({ p: entry.file }, { replace: true })
  }

  function createNew(list: StoredPuzzle[]) {
    show(newDraft(nextId(list)))
    setSearchParams({}, { replace: true })
    nameInput.current?.focus()
  }

  function guard(action: () => void) {
    if (dirty) setPending(() => action)
    else action()
  }

  useEffect(() => {
    fetchPuzzles()
      .then((list) => {
        setStored(list)
        // ?p=<file> from the editor itself, ?id=<id> from the edit button on a puzzle page.
        const file = searchParams.get('p')
        const id = searchParams.get('id')
        const entry = list.find((s) => (file !== null ? s.file === file : id !== null && String(s.puzzle.id) === id))
        if (entry) open(list, entry.file)
        else show(newDraft(nextId(list)))
      })
      .catch(() => setLoadFailed(true))
    // Only on mount; later loads go through open().
  }, [])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  useEffect(() => {
    if (focusNext.current === null) return
    inputs.current.get(focusNext.current)?.focus()
    focusNext.current = null
  })

  async function save(): Promise<boolean> {
    if (!draft) return false
    const result = buildFile(draft)
    if ('problems' in result) {
      setError(result.problems.join(' · '))
      return false
    }
    const failure = await writePuzzle(result.puzzle, draft.file)
    if (failure) {
      setError(failure)
      return false
    }
    const next = { ...draft, file: result.puzzle.name }
    dirtyRef.current = false
    show(next)
    setSearchParams({ p: next.file }, { replace: true })
    setStored(await fetchPuzzles())
    return true
  }

  async function play() {
    if (draft && (await save())) window.location.assign(`${import.meta.env.BASE_URL}game/${Number(draft.id)}`)
  }

  const saveRef = useRef(save)
  saveRef.current = save
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (loadFailed) return <p className="message">{t.loadFailed}</p>
  if (!stored || !draft) return <p className="message">{t.loading}</p>

  const update = (changes: Partial<Draft>) => setDraft({ ...draft, ...changes })
  const setRows = (rows: Row[]) => update({ rows })

  function setRow(index: number, row: Row) {
    setRows(draft!.rows.map((r, i) => (i === index ? row : r)))
  }

  function insertRow(index: number) {
    const row = emptyRow()
    setRows([...draft!.rows.slice(0, index), row, ...draft!.rows.slice(index)])
    focusNext.current = `${row.key}:answer`
  }

  function removeRow(index: number) {
    const rows = draft!.rows.filter((_, i) => i !== index)
    setRows(rows.length > 0 ? rows : [emptyRow()])
    const neighbour = index > 0 ? `${draft!.rows[index - 1].key}:hint` : rows[0] && `${rows[0].key}:answer`
    if (neighbour) focusNext.current = neighbour
  }

  function moveRow(index: number, delta: number, field: Field) {
    const target = index + delta
    if (target < 0 || target >= draft!.rows.length) return
    const rows = [...draft!.rows]
    ;[rows[index], rows[target]] = [rows[target], rows[index]]
    setRows(rows)
    focusNext.current = `${rows[target].key}:${field}`
  }

  function focusRow(index: number, delta: number, field: Field) {
    const target = index + delta
    if (target < 0) {
      if (field === 'answer') inputs.current.get('start')?.focus()
      return
    }
    if (target >= draft!.rows.length) return
    inputs.current.get(`${draft!.rows[target].key}:${field}`)?.focus()
  }

  function onRowKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number, field: Field) {
    const row = draft!.rows[index]
    if (e.key === 'Enter') {
      e.preventDefault()
      insertRow(index + 1)
    } else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      moveRow(index, e.key === 'ArrowUp' ? -1 : 1, field)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      focusRow(index, e.key === 'ArrowUp' ? -1 : 1, field)
    } else if (e.key === 'Backspace' && row.answer === '' && row.hint === '' && draft!.rows.length > 1) {
      e.preventDefault()
      removeRow(index)
    }
  }

  const words = [draft.start, ...draft.rows.map((r) => r.answer)].map((w) => w.trim() || '?')
  const n = draft.rows.length
  const cards = draft.rows.map((row, i) => ({
    row,
    error: hintError(row.hint),
    segments: renderHint({ id: i, hint: row.shown, answer: row.answer }, words, solvedView, previewFrontiers(direction, i, n)),
  }))
  if (direction === 'up') cards.reverse()
  const startLine = (
    <div className="editor-line editor-preview">
      <span className="hint-word hint-word--prev">{words[0]}</span>
    </div>
  )

  const register = (key: string) => (el: HTMLInputElement | null) => {
    if (el) inputs.current.set(key, el)
    else inputs.current.delete(key)
  }

  return (
    <div className="editor">
      <div className="editor-bar">
        <select value={draft.file ?? ''} onChange={(e) => guard(() => open(stored, e.target.value))}>
          {draft.file === null && <option value="">{t.unsaved}</option>}
          {stored.map((s) => (
            <option key={s.file} value={s.file}>
              {s.puzzle.id} · {s.file}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => guard(() => createNew(stored))}>
          {t.new}
        </button>
        <span className="editor-id">#{draft.id}</span>
        <label>
          {t.name}
          <input ref={nameInput} value={draft.name} onChange={(e) => update({ name: e.target.value })} />
        </label>
        <button type="button" className="editor-save" onClick={save} disabled={!dirty && draft.file !== null}>
          {dirty || draft.file === null ? t.save : t.saved}
        </button>
      </div>
      {error && <p className="editor-error">{error}</p>}

      <div className="editor-columns">
        <section>
          <div className="editor-head">
            <h3>{t.preview}</h3>
            <span className="editor-toggle">
              <button type="button" aria-pressed={solvedView} onClick={() => setSolvedView(true)}>
                {t.solvedView}
              </button>
              <button type="button" aria-pressed={!solvedView} onClick={() => setSolvedView(false)}>
                {t.openView}
              </button>
            </span>
            <span className="editor-toggle">
              <button type="button" aria-pressed={direction === 'down'} onClick={() => setDirection('down')}>
                {t.down}
              </button>
              <button type="button" aria-pressed={direction === 'up'} onClick={() => setDirection('up')}>
                {t.up}
              </button>
            </span>
            <button type="button" className="editor-link" onClick={play}>
              {t.play}
            </button>
          </div>
          {direction === 'down' && startLine}
          {cards.map(({ row, error, segments }) => (
            <div key={row.key} className={`editor-line editor-preview${error ? ' editor-preview--invalid' : ''}`} title={error ?? undefined}>
              <HintText segments={segments} />
            </div>
          ))}
          {direction === 'up' && startLine}
        </section>

        <section>
          <div className="editor-head">
            <h3>{t.hints}</h3>
            <button type="button" className="editor-reorder-toggle" aria-pressed={reorder} title={t.reorder} onClick={() => setReorder((r) => !r)}>
              {t.reorder}
            </button>
          </div>
          <div className="editor-line editor-row">
            <input
              ref={register('start')}
              value={draft.start}
              aria-label={t.start}
              onChange={(e) => update({ start: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  insertRow(0)
                  return
                }
                if (e.key !== 'ArrowDown') return
                e.preventDefault()
                inputs.current.get(`${draft.rows[0].key}:answer`)?.focus()
              }}
            />
            <span className="editor-start-label">{t.start}</span>
          </div>
          {draft.rows.map((row, i) => {
            const error = hintError(row.hint)
            return (
              <div key={row.key} className="editor-line editor-row">
                <input
                  ref={register(`${row.key}:answer`)}
                  value={row.answer}
                  aria-label={`${t.answer} ${i + 1}`}
                  onChange={(e) => setRow(i, { ...row, answer: e.target.value })}
                  onKeyDown={(e) => onRowKeyDown(e, i, 'answer')}
                />
                <input
                  ref={register(`${row.key}:hint`)}
                  value={row.hint}
                  aria-label={`${t.hint} ${i + 1}`}
                  aria-invalid={error !== null}
                  title={error ?? undefined}
                  onChange={(e) => setRow(i, withHint(row, e.target.value))}
                  onKeyDown={(e) => onRowKeyDown(e, i, 'hint')}
                />
                {reorder ? (
                  <span className="editor-move">
                    <button type="button" tabIndex={-1} disabled={i === 0} title={t.moveUp} onClick={() => moveRow(i, -1, 'answer')}>
                      ↑
                    </button>
                    <button type="button" tabIndex={-1} disabled={i === n - 1} title={t.moveDown} onClick={() => moveRow(i, 1, 'answer')}>
                      ↓
                    </button>
                  </span>
                ) : (
                  <button type="button" className="editor-remove" tabIndex={-1} title={t.remove} onClick={() => removeRow(i)}>
                    ×
                  </button>
                )}
              </div>
            )
          })}
          <button type="button" className="editor-add" title={t.addHint} onClick={() => insertRow(n)}>
            +
          </button>
          <p className="editor-help">{t.help}</p>
        </section>
      </div>

      {pending && (
        <ConfirmModal
          title={t.unsavedTitle}
          text={t.unsavedText}
          confirmLabel={t.discard}
          cancelLabel={t.cancel}
          onConfirm={() => {
            pending()
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}
