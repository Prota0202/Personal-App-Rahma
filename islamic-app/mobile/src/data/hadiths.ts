export type Hadith = {
  id: number
  collection: string
  title: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

export const hadiths: Hadith[] = [
  {
    id: 1,
    collection: 'Sahih Bukhari',
    title: 'Les intentions',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    transliteration: 'Innama al-a\'malu bi an-niyyat',
    translation:
      'Les actions ne valent que par les intentions, et chaque homme n’aura que ce qu’il a intentionné.',
    reference: 'Sahih Bukhari 1',
  },
  {
    id: 2,
    collection: 'Sahih Muslim',
    title: 'Bon caractère',
    arabic: 'الْبِرُّ حُسْنُ الْخُلُقِ',
    transliteration: 'Al-birru husnu al-khuluq',
    translation: 'La droiture est le bon caractère.',
    reference: 'Sahih Muslim 2553',
  },
  {
    id: 3,
    collection: 'Nawawi 40',
    title: 'Les piliers',
    arabic: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ',
    transliteration: 'Buniya al-Islamu ala khamsin',
    translation:
      'L’Islam est bâti sur cinq : attester qu’il n’y a de divinité qu’Allah et que Muhammad est Son messager...',
    reference: 'Nawawi 3',
  },
  {
    id: 4,
    collection: 'Sahih Bukhari',
    title: 'Prière en groupe',
    arabic:
      'صَلاَةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلاَةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً',
    transliteration: 'Salatu al-jama\'ati afdalu min salati al-fadhdhi...',
    translation:
      'La prière en groupe est vingt-sept fois supérieure à la prière accomplie seul.',
    reference: 'Sahih Bukhari 645',
  },
]
