// [CONTENT — Sinhala/English, migrate verbatim] Sponsorships page note
// (build-spec §10), extracted programmatically from docs/Dhammahadaya.net.txt
// (lines 493-538) — not retyped, to avoid corrupting Sinhala combining characters.
// sponsorshipNoteEn had a grammar pass on paragraphs 0/1/3 (client request,
// 2026-09: "make sure the english... is understandable") — the opening
// line was a sentence fragment, "Sir/ Madam" had a stray space, and the
// main paragraph had a subject-verb mismatch ("contributions ... provides")
// plus two awkward definite articles. Meaning and tone left unchanged.
// paragraphs[3]'s closing sentence was later replaced wholesale with the
// client's own rewritten dedication sentence (client request, 2026-09) —
// this shows on both the Home page preview and the full Sponsorship page,
// since both read from this same array. sponsorshipNoteSi.paragraphs was
// later replaced wholesale too (client doc, 2026-10) — a longer, 6-paragraph
// version rather than a literal translation of the English, matching the
// same independent-narrative pattern aboutSi already uses relative to
// aboutEn. sponsorshipNoteSi.instructions/instructionsHeading are unchanged
// (the client's doc repeated them verbatim).

export const sponsorshipHeader = "Sponsorships දායකත්ව";

export const sponsorshipNoteEn = {
  paragraphs: [
  "With the prosperity of Buddha Sasana at heart …….",
  "Dear Sir/Madam,",
  "Sponsorships for Dhammahadaya Forest Monastery",
  "We sincerely thank you for your annual, monthly, and daily donations to our monastery. We appreciatively remind you that your contributions not only cover the monastery’s water and electricity bills but also provide for other requirements of the monks such as medical, educational, and traveling expenses. We must reiterate the fact that aiding the monks who are in quest of their own enlightenment and the longevity of Buddha Sasana is a deed that generates merits beyond description. May the good merits you generate through your generosity towards the prosperity of the Buddha Sāsana be shared with your living and departed relatives, loved ones, and all sentient beings. May these merits bring them health, happiness, peace, prosperity, and a better existence, and ultimately support them on the path towards enlightenment.",
  "May the Triple-gem protect you!\nDhammahadaya Forest Monastery - Balangoda"
],
  instructionsHeading: "Instructions to book your dates.",
  instructions: [
  "Please select the intended date from the following calendar.",
  "Your contact information is required.",
  "Please provide the objective (අරමුණ) and the mailing address.",
  "Please review your selection and click “Send”.",
  "If you have any questions, concerns, or need assistance, please feel free to Contact Dhammahadaya Senasanaya."
],
};

export const sponsorshipNoteSi = {
  paragraphs: [
  "බුද්ධ ශාසනයේ චිරස්ථිතිය හදවතින් ම පෙරදැරි කර ගනිමින්...",
  "පින්වත් මහත්මයාණෙනි / මහත්මියනි,",
  "අප සේනාසනය වෙත ඔබ විසින් දිනපතා, මාස්පතා සහ වාර්ෂිකව සිදුකරනු ලබන අප්‍රමාණ පරිත්‍යාගයන් සහ නිරන්තර ශාසනික උපස්ථානයන් මෙත් සිත් පෙරටු කොට ගෞරවපූර්වකව සිහිපත් කරමු. සෙනසුන් පියසත්, එහි වැඩවසන සඟරුවනත් සුවසේ සුරැකෙන්නේ ඔබ වැනි සැදැහැවතුන්ගේ නොමඳ දායකත්වය සහ මෙත් සිත හේතුවෙනි.",
  "ඔබ ලබාදෙන ඒ උතුම් ආධාර උපකාර, ආරණ්‍යයේ ජල හා විදුලි බිල්පත් ඇතුළු අත්‍යවශ්‍ය නඩත්තු කටයුතුවලට මෙන්ම භාවනානුයෝගී මහා සංඝරත්නයේ ගිලන්පස, බෙහෙත් හේත්, අධ්‍යාපනික හා ගමනාගමන පහසුකම් නොපිරිහෙළා සපුරා ගැනීමට මහඟු සෙවණැල්ලක් වේ. එමගින් උන්වහන්සේලාට කිසිදු බාධාවකින් තොරව ධර්මය හැදෑරීමටත්, ප්‍රතිපත්ති පූජාවන්හි යෙදීමටත්, පිරිසිදු සම්බුදු සසුන ඉදිරි පරපුර උදෙසා ආරක්ෂා කර තැබීමටත් අවශ්‍ය පරිසරය මනාව ගොඩනැගේ.",
  "උතුම් නිවන් මඟ හෙළි කර ගනු වස් දහමට කැපවී වැඩ වසන සඟරුවන උදෙසාත්, සම්බුදු සසුනේ චිර ජීවනය උදෙසාත් සිදු කරන මෙවන් උපස්ථානයන් වචනයෙන් කියා නිම කළ නො හැකි මහා කුසල කර්මයකි. එහි ආනිසංස මෙලොව පරලොව දෙලොව සැනසුම පිණිස ම හේතු වාසනා වනු නො අනුමානය.",
  "සම්බුදු සසුන කෙරෙහි පිරිසිදු මෙත් සිතින් ඔබ රැස්කරගත් සියලු උතුම් පුණ්‍ය සම්භාරයන් ඔබගේ පවුලේ සැමටත්, දයාබර හිතමිතුරන්ටත්, පරලෝසැපත් ඥාතීන්ටත්, සියලු විශ්වාසී සත්ත්වයන්ටත් අත්වේවා! එම සියලු පින් බලයෙන් ඔබ සැමට නිරෝගී සුවය, පවුලේ සතුට, සාමය, සෞභාග්‍යය සහ සැනසිල්ල උදාවේවා! යහපත් ප්‍රඥාවෙන් දිවි මඟ ආලෝකමත් වී, අවසානයේ උතුම් වූ චතුරාර්ය සත්‍යාවබෝධයෙන් සසර දුකින් එතෙර වන්නට මෙම පින් හේතු වාසනා වේවා!",
  "තෙරුවන් සරණයි!\nධම්මහදය ආරණ්‍ය සේනාසනය - බළංගොඩ"
],
  instructionsHeading: "ඔබගේ දින වෙන් කරවා ගැනීමට උපදෙස්.",
  instructions: [
  "කරුණාකර පහත දින දර්ශනයෙන් ඔබට අවශ්‍ය දිනය තෝරන්න.",
  "කරුණාකර පරමාර්ථය (අරමුණ) සහ තැපැල් ලිපිනය ලබා දෙන්න.",
  "කරුණාකර ඔබගේ තේරීම නැවත පරික්ෂා කර “Send” කරන්න.",
  "ඔබට කිසියම් ප්‍රශ්නයක්, ගැටලුවක් හෝ සහයක් අවශ්‍ය නම්, කරුණාකර ධම්මහදය සේනාසනය සම්බන්ධ කර ගන්න."
],
};
