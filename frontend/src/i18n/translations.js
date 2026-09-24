// Global UI-chrome translations (client request, 2026-09) — every static
// label/heading/button the site's own code renders, keyed by a dot-path.
// Scope, per client confirmation: the site's UI chrome and the pages that
// already carried both languages (About, Sponsorship note) — never
// admin-authored content (dictionary entries, Tripitaka catalogue rows,
// newsletter articles, PDF book listings), which has no translated
// counterpart to switch to and always displays as entered.
// Sinhala strings here are original UI copy, not migrated site content —
// unlike the [CONTENT — migrate verbatim] files elsewhere, so writing them
// directly (rather than extracting from the source dump) is appropriate.
export const translations = {
  // --- Nav ---
  'nav.home': { en: 'Dhammahadaya', si: 'ධම්මහදය' },
  'nav.newsletters': { en: 'Newsletters', si: 'පුවත් පත්‍ර' },
  'nav.tripitaka': { en: 'Tripitaka', si: 'ත්‍රිපිටක' },
  'nav.dictionary': { en: 'Dictionary', si: 'ශබ්දකෝෂය' },
  'nav.dhammaSermons': { en: 'Dhamma Sermons', si: 'ධර්ම දේශනා' },
  'nav.programs': { en: 'Programs', si: 'වැඩසටහන්' },
  'nav.sponsorships': { en: 'Sponsorships', si: 'දායකත්ව' },
  'nav.contactUs': { en: 'Contact Us', si: 'අමතන්න' },
  'nav.aboutUs': { en: 'About us', si: 'අප ගැන' },
  'nav.openMenu': { en: 'Open menu', si: 'මෙනුව විවෘත කරන්න' },
  'nav.closeMenu': { en: 'Close menu', si: 'මෙනුව වසන්න' },

  // --- Language toggle ---
  'language.switchToSinhala': { en: 'Switch to Sinhala', si: 'සිංහලට මාරු වන්න' },
  'language.switchToEnglish': { en: 'Switch to English', si: 'ඉංග්‍රීසියට මාරු වන්න' },
  'language.groupLabel': { en: 'Language', si: 'භාෂාව' },

  // --- Common / shared ---
  'common.previous': { en: 'Previous', si: 'පෙර' },
  'common.next': { en: 'Next', si: 'ඊළඟ' },
  'common.send': { en: 'Send', si: 'යවන්න' },
  'common.sending': { en: 'Sending...', si: 'යවමින්...' },
  'common.subscribe': { en: 'Subscribe', si: 'දායක වන්න' },
  'common.readMore': { en: 'Read More »', si: 'තව කියවන්න »' },
  'common.backToList': { en: '« Back to list', si: '« ලැයිස්තුවට' },
  'common.noResults': { en: 'No results.', si: 'ප්‍රතිඵල නැත.' },
  'common.noEntriesYet': { en: 'No entries yet.', si: 'තවම ලිපි නැත.' },
  'common.loadingGeneric': { en: 'Loading…', si: 'පූරණය වෙමින්...' },
  'common.pageOf': { en: 'Page {page} of {total}', si: 'පිටුව {page} / {total}' },
  'common.loading': { en: 'Loading…', si: 'පූරණය වෙමින්...' },
  'common.loadingColdStart': {
    en: 'Loading… the first load of the day can take up to a minute while the server wakes up.',
    si: 'පූරණය වෙමින්... දිනයේ පළමු පූරණය සේවාදායකය අවදි වන තෙක් විනාඩියක් තරම් ගත විය හැක.',
  },
  'common.searchingColdStart': {
    en: 'Loading… the first search of the day can take up to a minute while the server wakes up.',
    si: 'පූරණය වෙමින්... දිනයේ පළමු සෙවීම සේවාදායකය අවදි වන තෙක් විනාඩියක් තරම් ගත විය හැක.',
  },
  'common.failedToLoad': { en: 'Failed to load: {message}', si: 'පූරණය කිරීම අසාර්ථක විය: {message}' },
  'entryDetail.episode': { en: 'Episode {n}', si: 'කථාංකය {n}' },

  // --- Newsletters landing page ---
  'newsletters.apeBuduHamuduruwo': { en: 'Ape Budu Hamuduruwo', si: 'අපේ බුදු හාමුදුරුවෝ' },
  'newsletters.asuMahaSrawakayanWahansela': { en: 'Asu Maha Srawakayan Wahansela', si: 'අසු මහා ශ්‍රාවකයන් වහන්සේලා' },
  'newsletters.importantArticles': { en: 'Important Articles', si: 'වැදගත් ලිපි' },

  // --- Tripitaka landing page ---
  'tripitaka.pageTitle': { en: 'Tripitaka', si: 'ත්‍රිපිටක' },

  // --- Dictionary landing page ---
  'dictionary.pageTitle': { en: 'Dictionary', si: 'ශබ්දකෝෂය' },
  'dictionary.paliSinhalese': { en: 'Pali Sinhalese Dictionary', si: 'පාලි සිංහල ශබ්දකෝෂය' },
  'dictionary.sinhala': { en: 'Sinhala Dictionary', si: 'සිංහල ශබ්දකෝෂය' },
  'dictionary.paliSearchPlaceholder': { en: 'Search Pali word...', si: 'පාලි වචනය සොයන්න...' },
  'dictionary.sinhalaSearchPlaceholder': { en: 'Search Sinhala word...', si: 'වචනය සොයන්න...' },
  'tripitakaCatalogue.searchPlaceholder': { en: 'Search sutta name, nikaya, vagga...', si: 'සූත්‍ර නාමය සොයන්න...' },
  'photoGallery.loading': { en: 'Loading photos…', si: 'ඡායාරූප පූරණය වෙමින්...' },

  // --- Booking calendar (shared component) ---
  'calendar.month': { en: 'Month', si: 'මාසය' },
  'calendar.year': { en: 'Year', si: 'වර්ෂය' },
  'calendar.available': { en: 'Available', si: 'ලබා ගත හැක' },
  'calendar.pending': { en: 'Pending', si: 'සමාලෝචනයේ' },
  'calendar.booked': { en: 'Booked', si: 'වෙන් කර ඇත' },
  'calendar.loadingAvailability': { en: 'Loading availability…', si: 'ලබ්‍යතාව පූරණය වෙමින්...' },
  'calendar.month.0': { en: 'January', si: 'ජනවාරි' },
  'calendar.month.1': { en: 'February', si: 'පෙබරවාරි' },
  'calendar.month.2': { en: 'March', si: 'මාර්තු' },
  'calendar.month.3': { en: 'April', si: 'අප්‍රේල්' },
  'calendar.month.4': { en: 'May', si: 'මැයි' },
  'calendar.month.5': { en: 'June', si: 'ජූනි' },
  'calendar.month.6': { en: 'July', si: 'ජූලි' },
  'calendar.month.7': { en: 'August', si: 'අගෝස්තු' },
  'calendar.month.8': { en: 'September', si: 'සැප්තැම්බර්' },
  'calendar.month.9': { en: 'October', si: 'ඔක්තෝබර්' },
  'calendar.month.10': { en: 'November', si: 'නොවැම්බර්' },
  'calendar.month.11': { en: 'December', si: 'දෙසැම්බර්' },
  'calendar.weekday.0': { en: 'Sun', si: 'ඉරි' },
  'calendar.weekday.1': { en: 'Mon', si: 'සඳු' },
  'calendar.weekday.2': { en: 'Tue', si: 'අඟ' },
  'calendar.weekday.3': { en: 'Wed', si: 'බදා' },
  'calendar.weekday.4': { en: 'Thu', si: 'බ්‍රහ' },
  'calendar.weekday.5': { en: 'Fri', si: 'සිකු' },
  'calendar.weekday.6': { en: 'Sat', si: 'සෙන' },

  // --- Theme toggle ---
  'theme.switchToLight': { en: 'Switch to light theme', si: 'දීප්තිමත් තේමාවට මාරු වන්න' },
  'theme.switchToDark': { en: 'Switch to dark theme', si: 'අඳුරු තේමාවට මාරු වන්න' },

  // --- Tripitaka search embed page ---
  'tripitakaSearch.fallbackPrefix': { en: "If the page below doesn't load,", si: 'පහත පිටුව පූරණය නොවන්නේ නම්,' },
  'tripitakaSearch.fallbackLink': { en: 'open tipitaka.lk in a new tab', si: 'tipitaka.lk නව ටැබයක විවෘත කරන්න' },

  // --- Searchable table (Dictionary + Tripitaka Catalogue shell) ---
  'searchableTable.searchFailed': { en: 'Search failed: {message}', si: 'සෙවීම අසාර්ථක විය: {message}' },
  'searchableTable.typeAtLeast': { en: 'Type at least {n} characters to search.', si: 'සෙවීමට අවම වශයෙන් අක්ෂර {n}ක් ටයිප් කරන්න.' },
  'searchableTable.scrollHint': { en: '⟷ Scroll sideways to see all columns', si: '⟷ සියලුම තීරු බැලීමට වමට/දකුණට අනුචලනය කරන්න' },
  'searchableTable.noResults': { en: 'No results.', si: 'ප්‍රතිඵල නැත.' },
  // --- Programs landing page ---
  'programs.satharaPohoyaCalendar': { en: 'Sathara Pohoya Calendar', si: 'සතර පොහෝ දින දර්ශනය' },
  'programs.buddhaPuja': { en: 'Buddha Puja', si: 'බුද්ධ පූජා' },
  'programs.katinaCeremony': { en: 'Katina Ceremony', si: 'කඨින පිංකම' },
  'programs.meditationPrograms': { en: 'Meditation Programs', si: 'භාවනා වැඩසටහන්' },

  // --- Video gallery (shared component) ---
  'videoGallery.thumbnailUnavailable': { en: 'Thumbnail unavailable', si: 'සිඟිති රුව නොමැත' },
  'videoGallery.loading': {
    en: 'Loading videos… the first load of the day can take up to a minute while the server wakes up.',
    si: 'වීඩියෝ පූරණය වෙමින්... දිනයේ පළමු පූරණය සේවාදායකය අවදි වන තෙක් විනාඩියක් තරම් ගත විය හැක.',
  },
  'videoGallery.noVideosYet': { en: 'No videos yet.', si: 'තවම වීඩියෝ නැත.' },
  'videoGallery.pageOfVideos': { en: 'Page {page} of {total} ({count} videos)', si: 'පිටුව {page} / {total} (වීඩියෝ {count})' },

  // --- Buddha Puja page ---
  'buddhaPuja.pageTitle': { en: 'Buddha Puja', si: 'බුද්ධ පූජා' },

  // --- Meditation Programs page ---
  'meditation.pageTitle': { en: 'Meditation Programs', si: 'භාවනා වැඩසටහන්' },
  'meditation.registration': { en: 'Registration', si: 'ලියාපදිංචිය' },
  'meditation.fromDate': { en: 'From Date (MAX {max} days)', si: 'දින සිට (උපරිම දින {max})' },
  'meditation.toDate': { en: 'To Date', si: 'දින දක්වා' },
  'meditation.stayTooLongNotice': {
    en: "That's {days} days — the maximum stay is {max} days.",
    si: 'එය දින {days}ක් — උපරිම නවාතැන් කාලය දින {max}කි.',
  },
  'meditation.experienceLabel': { en: 'Experience of meditation', si: 'භාවනා පුහුණු / නුපුහුණු බව' },
  'meditation.experienceYes': { en: 'Yes', si: 'භාවනා පුහුණු' },
  'meditation.experienceNo': { en: 'No', si: 'නුපුහුණු බව' },
  'meditation.meditationTypesLabel': { en: 'Types of meditation performed', si: 'කරන ලද භාවනා වර්ග' },
  'meditation.previousTeachersLabel': { en: 'Who were your previous meditation teachers?', si: 'ඔබේ කලින් භාවනා ගුරුවරුන් කවුද?' },
  'meditation.currentDiseasesLabel': { en: 'What are the current diseases?', si: 'දැනට පවතින රෝග මොනවාද?' },
  'meditation.stayTooLongError': {
    en: 'Stay must be at most {max} days (From Date through To Date, inclusive).',
    si: 'නවාතැන් කාලය දින {max}කට වඩා වැඩි විය නොහැක (දින සිට සහ දින දක්වා ඇතුළුව).',
  },
  'meditation.mustAgreeError': { en: 'You must agree to the terms.', si: 'ඔබ නියමයන්ට එකඟ විය යුතුය.' },
  'meditation.recaptchaError': { en: 'Please complete the "I\'m not a robot" check.', si: 'කරුණාකර "මම රොබෝවෙක් නොවෙමි" පරීක්ෂාව සම්පූර්ණ කරන්න.' },
  'meditation.successMessage': {
    en: 'Thank you — your registration has been submitted. The monastery will be in touch.',
    si: 'ස්තුතියි — ඔබගේ ලියාපදිංචිය ඉදිරිපත් කර ඇත. සේනාසනය ඔබ හා සම්බන්ධ වනු ඇත.',
  },

  // --- Katina Ceremony page ---
  'katina.pageTitle': { en: 'Katina Ceremony', si: 'කඨින පිංකම' },
  'katina.organizers': { en: 'Organizers', si: 'සංවිධායකයින්' },
  'katina.organizersTba': { en: 'Organizers to be announced.', si: 'සංවිධායකයින් පසුව නිවේදනය කෙරේ.' },
  'katina.noYearsYet': { en: 'No Katina years published yet.', si: 'තවම කඨින වර්ෂ ප්‍රකාශයට පත් කර නැත.' },

  // --- Sathara Pohoya Calendar ---
  'pohoya.noCalendarsYet': { en: 'No calendars published yet.', si: 'තවම දින දර්ශන ප්‍රකාශයට පත් කර නැත.' },
  'pohoyaYear.pageTitle': { en: 'Sathara Pohoya Calendar {year}', si: 'සතර පොහොය දින දර්ශනය {year}' },
  'pohoyaYear.monthColumn': { en: 'Month (Sinhala – English)', si: 'මාසය (සිංහල – ඉංග්‍රීසි)' },
  'pohoyaYear.dateColumn': { en: 'Date', si: 'දිනය' },
  'pohoyaYear.weekdayColumn': { en: 'Weekday', si: 'සතියේ දිනය' },
  'pohoyaYear.poyaColumn': { en: 'Poya', si: 'පොහෝ' },
  'pohoyaYear.notPublished': { en: 'No calendar published for {year}.', si: '{year} සඳහා දින දර්ශනයක් ප්‍රකාශයට පත් කර නැත.' },
  'pohoyaYear.imageNotUploaded': { en: 'Calendar image not yet uploaded.', si: 'දින දර්ශන රූපය තවම උඩුගත කර නැත.' },

  // --- Contact Us page ---
  'contactUs.viewOnGoogleMaps': { en: 'View on Google Maps', si: 'Google සිතියමෙන් බලන්න' },
  'contactUs.location': { en: 'Location', si: 'ස්ථානය' },
  'contactUs.postalAddress': { en: 'Postal Address', si: 'තැපැල් ලිපිනය' },
  'contactUs.contactDetails': { en: 'Contact Details', si: 'සම්බන්ධතා විස්තර' },
  'contactUs.officePhoneHours': { en: 'Office Phone Hours', si: 'කාර්යාල දුරකථන වේලාවන්' },
  'contactUs.sendInquiry': { en: 'Send an Inquiry', si: 'විමසුමක් යවන්න' },
  'contactUs.newsletter': { en: 'Newsletter', si: 'පුවත් පත්‍රය' },

  'pdfBooks.comingSoon': { en: 'Coming soon', si: 'ඉක්මනින්' },
  'pdfBooks.new': { en: 'New', si: 'නව' },
  'searchableTable.pageOfResults': {
    en: 'Page {page} of {total} ({count} results)',
    si: 'පිටුව {page} / {total} (ප්‍රතිඵල {count})',
  },
  'common.name': { en: 'Name', si: 'නම' },
  'common.email': { en: 'Email', si: 'ඊ-මේල්' },
  'common.phoneNumber': { en: 'Phone Number', si: 'දුරකථන අංකය' },
  'common.message': { en: 'Message', si: 'පණිවිඩය' },

  // --- Newsletter signup (shared component) ---
  'newsletterSignup.label': { en: 'Signup for our newsletter', si: 'අපගේ පුවත් පත්‍රයට දායක වන්න' },
  'newsletterSignup.emailPlaceholder': { en: 'Email', si: 'ඊ-මේල්' },
  'newsletterSignup.subscribing': { en: 'Subscribing...', si: 'දායක වෙමින්...' },
  'newsletterSignup.success': { en: 'Thank you for subscribing.', si: 'දායක වීම සඳහා ස්තුතියි.' },

  // --- Inquiry form (shared component) ---
  'inquiryForm.success': { en: 'Thank you — your message has been sent.', si: 'ස්තුතියි — ඔබගේ පණිවිඩය යවා ඇත.' },

  // --- Footer ---
  'footer.contactHeading': { en: 'Contact', si: 'සම්බන්ධ වන්න' },
  'footer.mobile': { en: 'Mobile: +94 70 216 4642', si: 'ජංගම දුරකථනය: +94 70 216 4642' },
  'footer.landPhone': { en: 'Land Phone: +94 45 313 4808', si: 'ස්ථාවර දුරකථනය: +94 45 313 4808' },
  'footer.alsoKnownAs': { en: 'Also known as', si: 'මෙසේද හැඳින්වේ' },
  'footer.copyright': { en: '© 2017 – 2026 – DHAMMAHADAYA SENASANAYA', si: '© 2017 – 2026 – ධම්මහදය සේනාසනය' },
  'footer.reportErrors': { en: 'Report any conversion errors to', si: 'පරිවර්තන දෝෂ වාර්තා කරන්න' },

  // --- About page ---
  'about.pageTitle': { en: 'About Us', si: 'අප ගැන' },
  'about.photoGallery': { en: 'Photo Gallery', si: 'ඡායාරූප එකතුව' },

  // --- Sponsorship page (Danaya / Development Projects) ---
  'sponsorship.pageTitle': { en: 'Sponsorships', si: 'දායකත්ව' },
  'sponsorship.danaya': { en: 'Danaya', si: 'දානය' },
  'sponsorship.acknowledgement': { en: 'Acknowledgement', si: 'ප්‍රණාමය' },
  'sponsorship.specialThanks': { en: 'Special Thanks', si: 'විශේෂ ස්තුතිය' },
  'sponsorship.honorableTribute': { en: 'Honorable Tribute', si: 'ගෞරවනීය උපහාරය' },
  'sponsorship.siriSugathaSasanaBandumathi': { en: 'Siri Sugatha Sasana Bandumathi', si: 'සිරි සුගත සාසන බන්ධුමතී' },

  // --- Development bank details table ---
  'development.pageTitle': { en: 'Development', si: 'සංවර්ධන' },
  'development.accountName': { en: 'Account Name', si: 'ගිණුම් නම' },
  'development.accountNumber': { en: 'Account Number', si: 'ගිණුම් අංකය' },
  'development.bank': { en: 'Bank', si: 'බැංකුව' },
  'development.branch': { en: 'Branch', si: 'ශාඛාව' },
  'development.swiftCode': { en: 'SWIFT Code', si: 'SWIFT කේතය' },
  'development.emailAddress': { en: 'E-mail Address', si: 'විද්‍යුත් ලිපිනය' },
  'development.officePhoneNumber': { en: 'Office Phone Number', si: 'කාර්යාල දුරකථන අංකය' },
  'development.whatsapp': { en: 'WhatsApp', si: 'WhatsApp' },
  'development.viber': { en: 'Viber', si: 'Viber' },
  'development.telegram': { en: 'Telegram', si: 'Telegram' },
  'sponsorship.developmentHeading': { en: 'Development Projects', si: 'සංවර්ධන ව්‍යාපෘති' },
  // English only, like About's Visitor Guidelines — new copy added 2026-09
  // with no existing Sinhala counterpart, so it doesn't switch with the
  // language toggle (see the component for the same reasoning).
  'sponsorship.developmentStatus': {
    en:
      'Development projects at Dhammahadaya Senasanaya continue on an ongoing basis, guided by the needs of the ' +
      'monastery and the generosity of our supporters. To find out about current or upcoming projects, or to ' +
      'enquire about contributing or getting involved, please contact us using the details above — we would be ' +
      'glad to hear from you.',
    si:
      'Development projects at Dhammahadaya Senasanaya continue on an ongoing basis, guided by the needs of the ' +
      'monastery and the generosity of our supporters. To find out about current or upcoming projects, or to ' +
      'enquire about contributing or getting involved, please contact us using the details above — we would be ' +
      'glad to hear from you.',
  },
  'sponsorship.selectDate': { en: 'Select a date', si: 'දිනයක් තෝරන්න' },
  'sponsorship.calendarError': {
    en: "Couldn't load date availability. Please refresh the page before selecting a date, so you don't pick one that's already taken.",
    si: 'දින ලබ්‍යතාව පූරණය කළ නොහැකි විය. දිනයක් තෝරන්නට පෙර පිටුව නැවුම් කරන්න.',
  },
  'sponsorship.bookingForm': { en: 'Booking form', si: 'වෙන්කරවා ගැනීමේ පත්‍රිකාව' },
  'sponsorship.datePlaceholder': { en: 'Select a date from the calendar above', si: 'ඉහත දින දර්ශනයෙන් දිනයක් තෝරන්න' },
  'sponsorship.detailsObjective': { en: 'Details / Objective', si: 'විස්තර / අරමුණ' },
  'sponsorship.mailingAddress': { en: 'Mailing Address', si: 'තැපැල් ලිපිනය' },
  'sponsorship.optional': { en: 'optional', si: 'අත්‍යවශ්‍ය නොවේ' },
  'sponsorship.selectDateError': { en: 'Please select an available date from the calendar.', si: 'කරුණාකර දින දර්ශනයෙන් ලබා ගත හැකි දිනයක් තෝරන්න.' },
  'sponsorship.bookingSuccess': {
    en: 'Thank you — your booking for {date} has been submitted and is now Pending review.',
    si: 'ස්තුතියි — {date} සඳහා ඔබගේ වෙන්කිරීම ඉදිරිපත් කර ඇති අතර, දැන් සමාලෝචනය සඳහා පොරොත්තුවෙන් පවතී.',
  },

  // --- Home page ---
  'home.aboutUsButton': { en: 'About Us', si: 'අප ගැන' },
  'home.latestNewsletters': { en: 'Latest Newsletters', si: 'නවතම පුවත් පත්‍ර' },
  'home.noNewslettersYet': { en: 'No newsletters yet.', si: 'තවම පුවත් පත්‍ර නැත.' },
  'home.moreNewsletters': { en: 'More Newsletters', si: 'තවත් පුවත් පත්‍ර' },
  'home.tripitakaHeading': { en: 'Tripitaka', si: 'ත්‍රිපිටක' },
  'home.tripitakaCatalogue': { en: 'Tripitaka Catalogue', si: 'ත්‍රිපිටක නාමාවලිය' },
  'home.tripitakaSearch': { en: 'Tripitaka Search', si: 'ත්‍රිපිටක සෙවීම' },
  'home.pdfBooks': { en: 'PDF Books', si: 'PDF පොත්' },
  'home.dhammaSermonsHeading': { en: 'Dhamma Sermons', si: 'ධර්ම දේශනා' },
  'home.dhammaSermonsButton': { en: 'Dhamma Sermons', si: 'ධර්ම දේශනා' },
  'home.youtubeChannel': { en: 'YouTube Channel', si: 'YouTube නාලිකාව' },
  'home.sponsorshipsHeading': { en: 'Sponsorships', si: 'දායකත්ව' },
  'home.moreSponsorships': { en: 'More Sponsorships', si: 'තවත් දායකත්ව' },
  'home.meritoriousDeeds': { en: 'Meritorious Deeds & Our Programs', si: 'පුණ්‍ය කටයුතු සහ අපගේ වැඩසටහන්' },
  'home.katinaCeremony': { en: 'Katina Ceremony', si: 'කඨින පිංකම' },
  'home.buddhaPuja': { en: 'Buddha Puja', si: 'බුද්ධ පූජා' },
  'home.meditation': { en: 'Meditation', si: 'භාවනා' },
  'home.newsletterSignupHeading': { en: 'Signup for our newsletter', si: 'අපගේ පුවත් පත්‍රයට දායක වන්න' },
  'home.officePhone': { en: 'Office phone: {phones}', si: 'කාර්යාල දුරකථනය: {phones}' },
  'home.loadingNewsletters': { en: 'Loading newsletters…', si: 'පුවත් පත්‍ර පූරණය වෙමින්...' },
  'home.whatsappGroup': { en: 'WhatsApp Group', si: 'WhatsApp සමූහය' },
  'home.whatsapp': { en: 'WhatsApp', si: 'WhatsApp' },
  'home.youtube': { en: 'YouTube', si: 'YouTube' },
  'home.facebook': { en: 'Facebook', si: 'Facebook' },
};
