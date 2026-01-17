export type AzkarItem = {
  id: number
  title: string
  arabic: string
  transliteration: string
  translation: string
  reference?: string
}

export type AzkarCategory = {
  key: string
  label: string
  items: AzkarItem[]
}

export const azkarCategories: AzkarCategory[] = [
  {
    key: 'morning',
    label: 'Matin',
    items: [
      {
        id: 1,
        title: 'Dhikr du matin',
        arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        transliteration: 'SubhanAllahi wa bihamdih',
        translation: 'Gloire et louange à Allah.',
        reference: 'Muslim',
      },
      {
        id: 2,
        title: 'Protection',
        arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ',
        transliteration: 'Hasbiya Allahu la ilaha illa huwa alayhi tawakkaltu',
        translation: 'Allah me suffit; il n’y a de divinité que Lui, en Lui je place ma confiance.',
      },
    ],
  },
  {
    key: 'evening',
    label: 'Soir',
    items: [
      {
        id: 3,
        title: 'Dhikr du soir',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ',
        transliteration: 'Allahumma inni as\'aluka khayra hadhihi al-laylah',
        translation: 'Ô Allah, je Te demande le bien de cette nuit.',
      },
      {
        id: 4,
        title: 'Pardon',
        arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
        transliteration: 'Astaghfirullaha wa atubu ilayh',
        translation: 'Je demande pardon à Allah et je me repens à Lui.',
      },
    ],
  },
  {
    key: 'afterPrayer',
    label: 'Après la prière',
    items: [
      {
        id: 5,
        title: 'Tasbih',
        arabic: 'سُبْحَانَ اللَّهِ (33) • الْحَمْدُ لِلَّهِ (33) • اللَّهُ أَكْبَرُ (34)',
        transliteration: 'SubhanAllah • Alhamdulillah • Allahu Akbar',
        translation: 'Gloire à Allah, Louange à Allah, Allah est le Plus Grand.',
      },
    ],
  },
]
