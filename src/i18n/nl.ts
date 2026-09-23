const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase('nl') + word.slice(1).toLocaleLowerCase('nl')

/** All user-facing text. */
export const nl = {
  appName: 'Rensdle',
  puzzleNumber: (id: number) => `Rensdle #${id}`,
  title: (start: string, end: string) => `Van ${capitalize(start)} tot ${capitalize(end)}`,
  previousPuzzle: 'Vorige puzzel',
  nextPuzzle: 'Volgende puzzel',

  flipUp: 'Wissel naar ↑ omhoog oplossen',
  flipDown: 'Wissel naar ↓ omlaag oplossen',
  answerLabel: (letters: number) => `Antwoord van ${letters} letters`,
  lockedLabel: (letters: number) => `Nog onbekend woord van ${letters} letters`,
  showHint: 'Toon hint',
  showAnswer: 'Toon antwoord',
  confirmQuestion: 'Weet je het zeker?',
  confirm: 'Ja, toon',
  cancel: 'Annuleren',

  findHint: 'Vind de juiste hint',
  solvedHints: 'Opgeloste hints',
  allHints: 'Alle hints',
  unknownWord: 'onbekend woord',
  about: 'Over deze puzzel',

  solved: 'Opgelost! 🎉',
  score: (percent: number) => `Score: ${percent}%`,
  share: 'Deel resultaat',
  copied: 'Gekopieerd!',
  copyFailed: 'Kopiëren mislukt',
  toNextPuzzle: 'Volgende puzzel →',

  notFound: 'Puzzel niet gevonden',
  notFoundText: 'Deze puzzel bestaat niet (meer).',
  toFirstPuzzle: 'Naar de eerste puzzel',
  noPuzzles: 'Er zijn nog geen puzzels.',
}
