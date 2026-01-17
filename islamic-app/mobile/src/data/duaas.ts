export type Duaa = {
  id: number
  title: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

export type DuaaCategory = {
  key: string
  label: string
  items: Duaa[]
}

export const duaaCategories: DuaaCategory[] = [
  {
    key: 'daily',
    label: 'Quotidien',
    items: [
      {
        id: 1,
        title: 'Dua du matin',
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilayka an-nushur',
        translation:
          'Ô Allah, par Toi nous entrons dans le matin, par Toi nous entrons dans le soir, par Toi nous vivons et par Toi nous mourons, et vers Toi est le retour.',
        reference: 'At-Tirmidhi',
      },
      {
        id: 2,
        title: 'Dua du soir',
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
        transliteration: 'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilayka al-masir',
        translation:
          'Ô Allah, par Toi nous entrons dans le soir, par Toi nous entrons dans le matin, par Toi nous vivons et par Toi nous mourons, et vers Toi est la destinée.',
        reference: 'At-Tirmidhi',
      },
    ],
  },
  {
    key: 'sleep',
    label: 'Sommeil',
    items: [
      {
        id: 3,
        title: 'Avant de dormir',
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        transliteration: 'Bismika Allahumma amutu wa ahya',
        translation: 'En Ton nom, Ô Allah, je meurs et je vis.',
        reference: 'Al-Bukhari',
      },
      {
        id: 4,
        title: 'Après le réveil',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        transliteration: 'Alhamdu lillahi alladhi ahyana ba\'da ma amatana wa ilayhi an-nushur',
        translation:
          'Louange à Allah qui nous a fait revivre après nous avoir fait mourir, et vers Lui est la résurrection.',
        reference: 'Al-Bukhari',
      },
    ],
  },
  {
    key: 'protection',
    label: 'Protection',
    items: [
      {
        id: 5,
        title: 'Protection',
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        transliteration: 'A\'udhu bi kalimati allahi at-tammati min sharri ma khalaq',
        translation:
          'Je cherche refuge dans les paroles parfaites d’Allah contre le mal de ce qu’Il a خلقé.',
        reference: 'Muslim',
      },
      {
        id: 6,
        title: 'Ayat al-Kursi',
        arabic:
          'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
        transliteration:
          'Allahu la ilaha illa huwa al-hayyu al-qayyum. La ta\'khudhuhu sinatun wa la nawm.',
        translation:
          'Allah ! Il n’y a de divinité que Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent.',
        reference: 'Quran 2:255',
      },
    ],
  },
]
