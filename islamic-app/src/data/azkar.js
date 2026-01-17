const azkarCategories = [
  {
    id: 'before',
    titleKey: 'azkarBefore',
    items: [
      {
        id: 'before-eating',
        title: { en: 'Before eating', fr: 'Avant de manger' },
        arabic: 'بِسْمِ اللَّهِ',
        transliteration: 'Bismillah',
        translation: {
          en: 'In the name of Allah.',
          fr: 'Au nom d’Allah.',
        },
        reference: 'At-Tirmidhi',
      },
      {
        id: 'before-leaving-home',
        title: { en: 'Before leaving home', fr: 'Avant de sortir de la maison' },
        arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        transliteration: 'Bismillahi tawakkaltu ala Allah, la hawla wa la quwwata illa billah',
        translation: {
          en: 'In the name of Allah, I place my trust in Allah; there is no power or might except with Allah.',
          fr: 'Au nom d’Allah, je place ma confiance en Allah; il n’y a de puissance ni de force qu’en Allah.',
        },
        reference: 'Abu Dawud',
      },
      {
        id: 'before-entering-home',
        title: { en: 'Before entering home', fr: 'Avant d’entrer à la maison' },
        arabic: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا',
        transliteration: 'Bismillahi walajna wa bismillahi kharajna wa ala rabbina tawakkalna',
        translation: {
          en: 'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.',
          fr: 'Au nom d’Allah nous entrons, au nom d’Allah nous sortons, et c’est sur notre Seigneur que nous comptons.',
        },
        reference: 'Abu Dawud',
      },
      {
        id: 'before-sleep',
        title: { en: 'Before sleeping', fr: 'Avant de dormir' },
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        transliteration: 'Bismika Allahumma amutu wa ahya',
        translation: {
          en: 'In Your name, O Allah, I die and I live.',
          fr: 'En Ton nom, ô Allah, je meurs et je vis.',
        },
        reference: 'Al-Bukhari',
      },
      {
        id: 'before-restroom',
        title: { en: 'Before entering the restroom', fr: 'Avant d’entrer aux toilettes' },
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
        transliteration: 'Allahumma inni a\'udhu bika min al-khubthi wal-khaba\'ith',
        translation: {
          en: 'O Allah, I seek refuge in You from male and female devils.',
          fr: 'Ô Allah, je cherche refuge auprès de Toi contre les démons mâles et femelles.',
        },
        reference: 'Al-Bukhari',
      },
    ],
  },
  {
    id: 'after',
    titleKey: 'azkarAfter',
    items: [
      {
        id: 'after-eating',
        title: { en: 'After eating', fr: 'Après avoir mangé' },
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        transliteration: 'Alhamdu lillahi alladhi at\'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah',
        translation: {
          en: 'Praise is to Allah who fed me this and provided it for me without any power or might from me.',
          fr: 'Louange à Allah qui m’a nourri de cela et me l’a accordé sans force ni puissance de ma part.',
        },
        reference: 'At-Tirmidhi',
      },
      {
        id: 'after-wudu',
        title: { en: 'After ablution', fr: 'Après les ablutions' },
        arabic: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        transliteration: 'Ashhadu an la ilaha illa Allah wahdahu la sharika lah, wa ashhadu anna Muhammadan abduhu wa rasuluh',
        translation: {
          en: 'I testify that there is no god but Allah alone with no partner, and I testify that Muhammad is His servant and messenger.',
          fr: 'J’atteste qu’il n’y a pas de divinité en dehors d’Allah, Seul, sans associé, et j’atteste que Muhammad est Son serviteur et Messager.',
        },
        reference: 'Muslim',
      },
      {
        id: 'after-prayer',
        title: { en: 'After prayer', fr: 'Après la prière' },
        arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
        transliteration: 'Allahumma anta as-salam wa minka as-salam tabarakta ya dhal-jalali wal-ikram',
        translation: {
          en: 'O Allah, You are Peace and from You comes peace; blessed are You, O Possessor of majesty and honor.',
          fr: 'Ô Allah, Tu es la Paix et de Toi vient la paix; Tu es béni, ô Détenteur de majesté et de générosité.',
        },
        reference: 'Muslim',
      },
      {
        id: 'after-restroom',
        title: { en: 'After leaving the restroom', fr: 'Après avoir quitté les toilettes' },
        arabic: 'غُفْرَانَكَ',
        transliteration: 'Ghufranak',
        translation: {
          en: 'I seek Your forgiveness.',
          fr: 'Je Te demande pardon.',
        },
        reference: 'Abu Dawud',
      },
      {
        id: 'after-waking',
        title: { en: 'After waking', fr: 'Au réveil' },
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        transliteration: 'Alhamdu lillahi alladhi ahyana ba\'da ma amatana wa ilayhi an-nushur',
        translation: {
          en: 'Praise is to Allah who gave us life after causing us to die, and to Him is the resurrection.',
          fr: 'Louange à Allah qui nous a redonné la vie après nous avoir fait mourir, et vers Lui est la résurrection.',
        },
        reference: 'Al-Bukhari',
      },
    ],
  },
  {
    id: 'during',
    titleKey: 'azkarDuring',
    items: [
      {
        id: 'during-travel',
        title: { en: 'During travel', fr: 'En voyage' },
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
        transliteration: 'Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrineen',
        translation: {
          en: 'Glory to Him who has subjected this to us, and we could not have done it ourselves.',
          fr: 'Gloire à Celui qui a soumis ceci pour nous, alors que nous n’aurions pas pu le maîtriser.',
        },
        reference: 'Quran 43:13',
      },
      {
        id: 'during-rain',
        title: { en: 'When it rains', fr: 'Quand il pleut' },
        arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
        transliteration: 'Allahumma sayyiban nafi\'a',
        translation: {
          en: 'O Allah, make it a beneficial rain.',
          fr: 'Ô Allah, fais-en une pluie bénéfique.',
        },
        reference: 'Al-Bukhari',
      },
      {
        id: 'during-distress',
        title: { en: 'During distress', fr: 'Dans la détresse' },
        arabic: 'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
        transliteration: 'La ilaha illa anta subhanaka inni kuntu min az-zalimin',
        translation: {
          en: 'There is no god but You; glory be to You; indeed I was among the wrongdoers.',
          fr: 'Il n’y a pas de divinité en dehors de Toi; gloire à Toi; j’étais certes du nombre des injustes.',
        },
        reference: 'Quran 21:87',
      },
      {
        id: 'during-anxiety',
        title: { en: 'When anxious or afraid', fr: 'Quand on est anxieux ou inquiet' },
        arabic: 'حَسْبِيَ اللَّهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ',
        transliteration: 'Hasbiya Allahu la ilaha illa huwa alayhi tawakkaltu',
        translation: {
          en: 'Allah is sufficient for me; there is no god but Him; upon Him I rely.',
          fr: 'Allah me suffit; il n’y a pas de divinité en dehors de Lui; c’est sur Lui que je m’en remets.',
        },
        reference: 'Quran 9:129',
      },
      {
        id: 'during-sneeze',
        title: { en: 'After sneezing', fr: 'Après avoir éternué' },
        arabic: 'الْحَمْدُ لِلَّهِ',
        transliteration: 'Alhamdulillah',
        translation: {
          en: 'Praise be to Allah.',
          fr: 'Louange à Allah.',
        },
        reference: 'Al-Bukhari',
      },
    ],
  },
]

export const getLocalizedText = (value, language) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value.en || ''
}

export default azkarCategories
