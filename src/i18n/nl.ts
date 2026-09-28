const upper = (word: string) => word.toLocaleUpperCase('nl')

/** All user-facing text. */
export const nl = {
  appName: 'Rensdle',
  puzzleNumber: (id: number) => `Rensdle #${id}`,
  title: (start: string, end: string) => `Van ${upper(start)} tot ${upper(end)}`,
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

  tutorial: 'Tutorial',
  welcomeTitle: 'Welkom bij Rensdle!',
  welcomeTutorialText: 'Speel de tutorial om te leren hoe het spel werkt.',
  welcomeTutorial: 'Speel de tutorial',
  welcomeSkipText:
    'Ken je het spel al, dan kan je in één keer naar de normale puzzel. Een link naar de tutorial kan je altijd rechtsboven terugvinden.',
  welcomeSkip: 'Direct spelen',
  previousStep: 'Vorige stap',
  nextStep: 'Volgende stap',
  stepOf: (step: number, total: number) => `Stap ${step} van ${total}`,
  /** One text per step of the tutorial; see TutorialStep. */
  tutorialStep: {
    first: 'Welkom bij Rensdle! \n Het doel is om de juiste hints te vinden en alle woorden in de lijst in te vullen. \n Los de aangegeven hint op. \nDe (5) bij het invoerveld betekent dat het antwoord 5 letters heeft.',
    shuffled:
      'De opgeloste hint staat nu bij de opgeloste hints.\n De resterende hints staan door elkaar. \n Zoek de best passende hint en vul het antwoord in.',
    lamp: 'Kom je er niet uit? Klik op het lampje 💡, dan wordt de juiste hint aangewezen. Probeer maar.',
    eye: 'Dit is de bijbehorende hint. Zit je dan nog vast, klik dan op het oog 👁️ om het antwoord te tonen.',
    up: 'Je kunt ook omhoog oplossen: klik op de laatste open regel of op “Wissel naar ↑ omhoog oplossen”.',
    upActive: 'De hints passen zich aan op de richting. Van onder naar boven is meestal wel lastiger.',
  },
  tutorialDone: 'Dat was de tutorial. Veel plezier!',
  tutorialToPuzzles: 'Start met puzzelen →',

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
