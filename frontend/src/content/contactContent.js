// [CONTENT — English/Sinhala, migrate verbatim] Contact Us page text
// (build-spec §18). English extracted programmatically from
// docs/Dhammahadaya.net.txt (lines 1809-1840) — not retyped. Sinhala added
// later (client doc, 2026-10) — this was English-only until then (no
// Sinhala version existed at the time of the original migration).

export const contactLocation = {
  en: "Dhammahadaya Senasanaya is near the Divineguma Training Center in the Balangoda Samanalawewa Reserve Zone.",
  // The client's Sinhala doc combines the location sentence and the lead-in
  // to the two directions below into one paragraph, rather than keeping
  // them as separate sentences like the English does.
  si: "බලන්ගොඩ සමනලවැව රක්ෂිත කලාපයේ, දිවි නැගුම පුහුණු මධ්‍යස්ථානයට නුදුරින් සොබාදහමේ නිහඬ ආශීර්වාදය මැද ධම්මහදය ආරණ්‍ය සේනාසනය පිහිටා ඇත. සේනාසනය වෙත පැමිණීමට ප්‍රධාන මාර්ග දෙකක් භාවිත කළ හැක:",
};
export const contactDirections = {
  en: [
    "About 5 km left from Rajawaka Junction on the Balangoda–Kalthota main road (easier route)",
    "About 4 km left from Depelamulla Junction on the same road",
  ],
  si: [
    "වඩාත් පහසු මාර්ගය: බලන්ගොඩ – කල්තොට ප්‍රධාන මාර්ගයේ රජවක හන්දියෙන් වමට හැරී කිලෝමීටර් 5ක් පමණ ඉදිරියට.",
    "විකල්ප මාර්ගය: එම ප්‍රධාන මාර්ගයේ ම දෙපැලමුල්ල හන්දියෙන් වමට හැරී කිලෝමීටර් 4ක් පමණ ඉදිරියට.",
  ],
};
export const contactPostalAddressLines = {
  en: ["Dhammahadaya Senasanaya", "Watawala", "Mulgama", "Balangoda", "70117"],
  // Given as one line in the client's doc rather than split per line like
  // the English — kept as a single-entry array so both still map the same
  // way in ContactUsPage.jsx/HomePage.jsx.
  si: ["ධම්මහදය සේනාසනය වටවල, මුල්ගම, බලන්ගොඩ. තැපැල් අංකය: 70117"],
};
// Phone numbers themselves are the same digits regardless of language, so
// HomePage.jsx's phoneFor() helper always reads contactChannels.en
// specifically — the Sinhala variant exists only for the Contact page's
// display labels, and additionally merges WhatsApp/Telegram into one row
// since the client's doc gives them as a single line (both numbers happen
// to be the same number already).
export const contactChannels = {
  en: [
    ["Email", "dhammahadayasenasanaya@gmail.com"],
    ["Phone 1", "+94 70 216 4642"],
    ["Phone 2", "+94 45 313 4808"],
    ["WhatsApp", "+94 70 216 4642"],
    ["Telegram", "+94 70 216 4642"],
  ],
  si: [
    ["විද්‍යුත් තැපෑල (Email)", "dhammahadayasenasanaya@gmail.com"],
    ["දුරකථන අංක 1", "+94 70 216 4642"],
    ["දුරකථන අංක 2", "+94 45 313 4808"],
    ["ක්ෂණික පණිවිඩ සේවා (WhatsApp / Telegram)", "+94 70 216 4642"],
  ],
};
// Saturday/Sunday rows updated per client correction, 2026-09. Sinhala
// added later (client doc, 2026-10).
export const contactOfficeHours = {
  en: [
    ["Weekdays", "8:00 am – 9:00 am and 7:00 pm – 9:00 pm"],
    ["Saturday", "All day (Phone 1 and Phone 2)"],
    ["Sunday", "All day (Phone 2)"],
  ],
  si: [
    ["සතියේ දිනවල (සඳුදා – සිකුරාදා)", "උදෑසන 8:00 සිට 9:00 දක්වා සහ රාත්‍රි 7:00 සිට 9:00 දක්වා"],
    ["සෙනසුරාදා", "දවස පුරා (දුරකථන අංක 1 සහ 2 ඔස්සේ)"],
    ["ඉරිදා", "දවස පුරා (දුරකථන අංක 2 ඔස්සේ පමණි)"],
  ],
};
// Sinhala-only intro sentence the client's doc includes right before the
// office-hours table — no English equivalent was given, so this just
// doesn't render on the English side (same asymmetry as aboutSi's own
// paragraph count relative to aboutEn).
export const contactOfficeHoursIntroSi =
  "සේනාසනයේ නිහඬ බව හා වතාවත් සුරැකෙන පරිදි, කාර්යාල දුරකථන ඇමතුම් සඳහා පහත වේලාවන් වෙන් කර ඇත:";

export const contactMapEmbedSrc = 'https://www.google.com/maps?q=6.6347779,80.7948675&output=embed';
export const contactMapLinkUrl = 'https://www.google.com/maps/place/Dhammahadaya+Senasanaya/@6.6347779,80.7948675,17z/data=!3m1!4b1!4m6!3m5!1s0x3ae3f56ef2caa573:0xa35fcabfc451415!8m2!3d6.6347779!4d80.7948675!16s%2Fg%2F11f08qf12f?hl=en-US&entry=ttu';
