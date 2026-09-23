import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router'
import { getPuzzle, puzzles } from './data/puzzleParser'
import { Game } from './components/Game'
import { nl } from './i18n/nl'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <header className="site-header">
        <Link to="/" className="logo">
          Rens<span>dle</span>
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:idOrName" element={<GamePage />} />
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
  // key resets all game state when navigating to another puzzle
  return <Game key={puzzle.id} puzzle={puzzle} />
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
