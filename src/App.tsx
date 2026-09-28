import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router'
import { getPuzzle, puzzles } from './data/puzzleParser'
import { tutorialPuzzle } from './data/tutorial'
import { Game } from './components/Game'
import { WelcomeModal } from './components/WelcomeModal'
import { nl } from './i18n/nl'
import { text as editorText } from './editor/text'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

const Editor = import.meta.env.DEV ? lazy(() => import('./editor/Editor').then((m) => ({ default: m.Editor }))) : null

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <header className="site-header">
        <Link to="/" className="logo">
          Rens<span>dle</span>
        </Link>
        <div className="header-right">
          {Editor && (
            <Link to="/editor" className="dev-link">
              {editorText.editor}
            </Link>
          )}
          <Link to="/tutorial" className="help-link">
            {nl.tutorial}
          </Link>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:idOrName" element={<GamePage />} />
          <Route path="/tutorial" element={<Game puzzle={tutorialPuzzle} />} />
          {Editor && (
            <Route
              path="/editor"
              element={
                <Suspense>
                  <Editor />
                </Suspense>
              }
            />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

function Home() {
  if (puzzles.length === 0) return <p className="message">{nl.noPuzzles}</p>
  return <Navigate to={`/game/${puzzles[0].id}`} replace />
}

function GamePage() {
  const { idOrName = '' } = useParams()
  const puzzle = getPuzzle(idOrName)
  if (!puzzle) return <NotFound />
  return (
    <>
      <WelcomeModal />
      <Game key={puzzle.id} puzzle={puzzle} />
    </>
  )
}

function NotFound() {
  return (
    <div className="message">
      <h2>{nl.notFound}</h2>
      <p>{nl.notFoundText}</p>
      {puzzles.length > 0 && <Link to="/">{nl.toFirstPuzzle}</Link>}
    </div>
  )
}
