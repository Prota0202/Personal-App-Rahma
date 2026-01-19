export type HadithOverride = {
  arabic?: string
  translation?: string
}

// Add trusted overrides by collection + hadith number.
// Example:
// export const hadithOverrides = {
//   'eng-muslim': {
//     1: {
//       arabic: '...arabic text...',
//       translation: '...english translation...',
//     },
//   },
// }
export const hadithOverrides: Record<string, Record<number, HadithOverride>> = {
  'eng-muslim': {},
  'eng-bukhari': {},
  'eng-nawawi': {},
}
