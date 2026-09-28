import type { Hint, Puzzle } from '../types'
import { buildWords } from '../game/logic'

/**
 * In code instead of /puzzles, so it stays out of the list, the numbering and the navigation.
 * The first two answers must be solvable without help: the hint button is still hidden there.
 */
const hints: Hint[] = [
  { id: 0, hint: 'Dit seizoen heet ook wel $prev$jaar', answer: 'Lente' },
  { id: 1, hint: 'Een maand in de $prev$', answer: 'Mei' },
  { id: 2, hint: 'Verwijder een letter in $prev$ om iets te krijgen wat alle vogels in $prev$ leggen', answer: 'Ei' },
  { id: 3, hint: 'Een $prev$ bak je in een $answer$', answer: 'Pan' },
  { id: 4, hint: 'Rijst kook je in een $prev$ met $answer$', answer: 'Water' },
  { id: 5, hint: 'Een grote plas $prev$', answer: 'Meer' },
  { id: 6, hint: 'Het tegenovergestelde van $prev$', answer: 'Minder' },
  { id: 7, hint: 'Als je $prev$ punten hebt sta je $answer$', answer: 'Achter' },
]

const start = 'Voor'

export const tutorialPuzzle: Puzzle = {
  // Also the shuffle seed: -45 puts the giveaway hints second and fifth in the list.
  id: -45,
  name: 'tutorial',
  start,
  tutorial: true,
  hints,
  words: buildWords(start, hints),
}
