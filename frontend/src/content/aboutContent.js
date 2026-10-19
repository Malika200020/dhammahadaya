// [CONTENT — English/Sinhala, migrate verbatim] About page text
// (build-spec §14), extracted programmatically from docs/Dhammahadaya.net.txt
// (lines 1855-1886) — not retyped, to avoid corrupting Sinhala combining
// characters. aboutEn.paragraphs[2] had a grammar/spelling pass (client
// request, 2026-09: "make sure the english... is understandable") —
// bhikkhu/Bikkus/Attakatha standardized to the spelling used elsewhere on
// the site (bhikkhus, Bhikkhus, Atthakatha); the same inconsistency recurs
// in paragraphs 3 and 7 below, left as-is since they weren't in scope of
// what was flagged.

export const aboutEn = {
  // Client correction, 2026-09: the registration number never had "TEMPO/"
  // in it — that was an error in the original migrated text.
  registrationNo: "Registration No: BC/20/18/072",
  paragraphs: [
  "Nestled amidst the mountains and the peaceful wilderness off Kalthota, Balangoda is the Dhammahadaya Aranya Senasanaya (Dhammahadaya Monastery) where serenity meets the soul. Dhammahadaya means the Heart of the great teachings of the Buddha.",
  "This Theravada Buddhist monastery began its journey on the 03rd of May 2017, as a branch of Mihindu Aranya, Anuradhapura which is a sector of the Siyam Nikaya, Rohana Parshavaya, Wanavasa sector. The journey began on this great day in the presence and with blessings from Most Ven. Galpatha Sumana Anunayaka Thero of Mihindu Aranya, Most Ven. Mankadawala Sudassana Thero of Labunoruwakanda Aranya Senasanaya and other most venerable Maha Sanga Rathnaya (Most Noble Theros). The chief dayakas present included Dr. Shriyani Abeysuriya, Mrs. Nirma Jayaweera and many others.",
  "The Aranya is home to Theravada bhikkhus who reside in huts spread across around 3 acres of forest. The Bhikkhus live a peaceful and noble life guided by the precepts and principles of Buddhist philosophy. Sermons, discourses and discussions are purely and wholly based on the teachings from the Tripitaka and Atthakatha.",
  "The monastery is located away from the village. The Bikkus mostly visit other temples in the village on full moon poya days to deliver sermons or for dhamma discussions. The bikkus are only visited by people who arrive at the Aranya to offer mid day dana (meals).",
  "The environment in which the Aranya is located is ideal for the Bhikkhus, in their strive towards the development of virtues and wisdom to attain the Supreme Bliss of Nirvana, though meditation and mindfulness.",
  "The day starts with morning dana (meals) prepared at the monastery, followed by cleaning of the surrounding by the monks and the lay people residing at the Aranya.",
  "The afternoon Dana or meal (which is the last meal for the day) is offered by lay people who visit the temple by 10:00 a.m. The lay people, first offer the prepared meal to the Buddha. This is known as offering of the ‘Buddha poojawa’. They then offer the meal or dana to the bikkus generally between 11:00 a.m. and 11:30 a.m. Once the dana is over, the visitors are gifted by the residing monks with the preaching of the most virtuous teaching of the Dhamma from Tripitaka.",
  "The rest of the day is spent by Bhikkhus in seclusion in practicing the Dhamma through meditation, mindfulness, reading of the Suttas from the Tripitaka and attakatta and Dhamma discussions."
],
};

// Visitor guidelines (client-provided, English only, 2026-09, revised
// 2026-09, Sinhala added 2026-10) — bilingual now; the client's doc gave a
// full Sinhala translation, including its own distinct section headings
// (not literal translations of the English ones) and a top-level heading
// that replaces "Visitor Guidelines" rather than translating it word for
// word. Visiting Hours was originally two lines (Weekdays/Weekends) with
// literal placeholder brackets ("[00:00 AM]"), published as-is at the
// client's explicit instruction. The 2026-10 doc gave real hours but
// collapsed to a single line covering every day (client confirmed this
// structure, 2026-10) — brackets dropped since the values are now real,
// not placeholders.
export const visitorGuidelines = {
  en: {
    heading: 'Visitor Guidelines',
    sections: [
      {
        heading: 'Dress Code',
        paragraphs: [
          'A Monastery is a place of spiritual reflection and respectful attire is mandatory for entry. All visitors, regardless of gender, must dress modestly.',
        ],
      },
      {
        heading: 'Chaperone Requirement',
        paragraphs: [
          'Female guests visiting the monastery, other than for religious ceremonies, must ensure that they are accompanied by a second person.',
        ],
      },
      {
        heading: 'Visiting Hours',
        paragraphs: ['The monastery is open to the general public during the following times'],
        hours: ['Please visit between 06:00 AM and 06:00 PM.'],
      },
    ],
  },
  si: {
    heading: 'පැමිණෙන සැදැහැවතුන් වෙත',
    sections: [
      {
        heading: 'සංවරශීලී ඇඳුම් පැළඳුම්',
        paragraphs: [
          'මෙම පුණ්‍ය භූමිය ආධ්‍යාත්මික සුවය වඩවන තපෝබිමක් බැවින්, මෙහි පැමිණෙන සැමදෙනාම ශරීරය මනාව ආවරණය වන පරිදි, සරල සහ සංවර වූ සුදු හෝ චාම් වස්ත්‍රයෙන් සැරසී පැමිණීමට කාරුණික වන්න.',
        ],
      },
      {
        heading: 'කාන්තා පාර්ශ්වය සඳහා විශේෂ සැලකිල්ල',
        paragraphs: [
          'ආරණ්‍යයේ වැඩ වසන භික්ෂූන් වහන්සේලාගේ විනය ගරුක පැවිදි දිවිය සහ වනගත සෙනසුනක ආරක්ෂාව අරමුණු කර ගනිමින්, පොදු ආගමික වතාවත් හැරුණු කොට වෙනත් අවශ්‍යතා සඳහා පැමිණෙන කාන්තා සැදැහැවතුන් තවත් අයෙකු සමඟ (දෙදෙනෙකු හෝ ඊට වැඩි පිරිසක් ලෙස) පැමිණිය යුතුය.',
        ],
      },
      {
        heading: 'පිවිසිය හැකි වේලාවන්',
        paragraphs: [
          'ආරණ්‍යයේ නිස්කලංක භාවයට සහ භික්ෂූන් වහන්සේලාගේ භාවනා කාලසටහනට බාධා නොවන අයුරින්, පහත සඳහන් වේලාවන් තුළ පමණක් සේනාසනය වෙත පැමිණෙන මෙන් මෙත් සිතින් දන්වා සිටිමු.',
        ],
        hours: ['06.00 පෙ.ව. සිට 06.00 ප.ව. දක්වා'],
      },
    ],
  },
};

export const aboutSi = {
  // Client correction, 2026-10: Latin "BC" rather than the Sinhala
  // abbreviation previously used, matching the English version's format.
  registrationNo: "ලියාපදිංචි අංකය: BC/20/18/072",
  // Paragraphs replaced wholesale (client doc, 2026-10) — a different,
  // more poetic rewrite rather than a literal translation of aboutEn, same
  // as the original migration's approach. Still a 1:1 paragraph count with
  // aboutEn (7), just independently worded per paragraph.
  paragraphs: [
  "මීදුම් සේලයෙන් වැසුණු නිල්වන් කඳුවැටි අතරින් හමන මඳ පවනේ දැවටී එන්නේ අසීමිත නිදහසක සුවඳයි. බලන්ගොඩ, කල්තොට නිස්කලංක වනාන්තර පියසේ සැඟවුණු ධම්මහදය ආරණ්‍ය සේනාසනය, ගිලන් වූ සිත් සනසන, සසරෙන් එතෙර වන්නට මං සොයන උතුම් තපෝබිමකි. 'ධම්මහදය' යනු තිලෝගුරු බුදු පියාණන් වහන්සේ දේශනා කොට වදාළ පරම සත්‍යයේ, එනම් ශ්‍රී සද්ධර්මයේ හදවතයි.",
  "අනුරාධපුර මිහිදු ආරණ්‍ය සේනාසනයේ ශාඛාවක් ලෙස, ශ්‍යාමෝපාලි මහා නිකායේ රෝහණ පාර්ශ්වයේ වනවාස සංඝ සභාවට අයත්ව මෙම පුණ්‍ය භූමිය ඇරඹෙන්නේ 2017 මැයි මස 3 වන සුබ දිනකය. මිහිඳු ආරණ්‍යයේ අනුනායක අතිපූජ්‍ය ගල්පාත සුමන අනුනාහිමිපාණන් වහන්සේ, ලබුනොරුවකන්ද ආරණ්‍ය සේනාසනාධිපති අතිපූජනීය මාන්කඩවල සුදස්සන ස්වාමීන්ද්‍රයන් වහන්සේ ඇතුළු ගෞරවනීය මහා සංඝරත්නයේ ආශීර්වාදයෙන් සහ වෛද්‍ය ශ්‍රියානි අබේසූරිය, නිර්මා ජයවීර මහත්මිය ඇතුළු සැදැහැති දායක පිරිස ගේ මූලිකත්වයෙන් මෙහි පළමු පහන දැල්විණි.",
  "අක්කර තුනක පමණ ස්වාභාවික වනපෙතක විසිරී ඇති සෙනසුන් කුටි තුළ වැඩ වසන තෙරුවන් ගුණ සරණ ගිය ථෙරවාද භික්ෂූන් වහන්සේලා, විනය ගරුකව, චාම් බවින් යුතු උතුම් පැවිදි දිවියක් ගත කරති. මෙහි ඇසෙන සෑම ධර්ම දේශනාවක් ම, සාකච්ඡාවක් ම සම්බුදු මුවින් දෙසූ ත්‍රිපිටක හා අටුවා දහමට ම පමණක් සීමා වූ පිරිසිදු ධර්ම ඥානයෙන් පෝෂණය වී ඇත.",
  "ගම්මානයෙන් බොහෝ ඈත පිහිටි මේ අරණ, භාවනානුයෝගී හිමිවරුන්ගේ චිත්ත ඒකාග්‍රතාවට තෝතැන්නකි. පුරපසළොස්වක පෝය දිනවල දී ගම්මානයේ වෙහෙර විහාර වෙත වැඩම කර දහම් අමාවෙන් සැදැහැවතුන් නැහැවීම හැරුණු කොට, උන්වහන්සේලා නිරන්තරයෙන් ගත කරන්නේ නිහඬ, විවේකී ජීවිතයකි.",
  "අලුයම පිබිදෙන අරණේ දවස ඇරඹෙන්නේ සෙනසුන තුළ ම සකසා ගන්නා හිමිදිරි දානයෙන් සහ මුළු පරිසරයම ඇමදීමෙන් පවිත්‍ර කරමිනි. ඉන් පසු දහවල් 10:00 වන විට ගම් වැසි සැදැහැවතුන් දහවල් දානය රැගෙන අරණට පැමිණෙන්නේ ශ්‍රද්ධාව පිරි සිතින් යුතුවය. පළමුව උතුම් බුද්ධ පූජාව තබා, අනතුරුව 11:00 ත් 11:30 ත් අතර මහා සංඝරත්නය වෙත දානය පූජා කෙරේ. කුසල් සිත් පුරවා ගෙන දන් වළඳා බැතිමතුන්ට පෙරළා හිමි වන්නේ ත්‍රිපිටක දහම් රසයෙන් පිරුණු උතුම් ධර්ම දානයකි.",
  "ඉර අවරට යත්ම, අවට තුරුලතාවන් අතරින් ගලා එන්නේ අප්‍රමාණ නිහඬතාවකි. භික්ෂූන් වහන්සේලා තමන් වැඩවසන කුටි තුළට වී සක්මන් කරමින්, භාවනාවෙන් සිත සමාධි ගත කරමින්, සූත්‍ර දේශනා හදාරමින් උතුම් නිවන් මඟ හෙළි කරගන්නට වෙහෙසෙති.",
  "නො නවතින ලෝකයේ නො සන්සුන් සිත් නිවාලන, සැබෑ බුදු මඟ පෙන්වන මේ පුණ්‍ය භූමිය සැබවින්ම නිවන සොයන නිහඬ සිතක නැවතුමකි."
],
};
