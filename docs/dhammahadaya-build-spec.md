# Dhammahadaya.net — Rebuild Specification (for Claude Code)

> **What this document is.** A page-by-page functional specification for rebuilding the
> Dhammahadaya Senasanaya website from WordPress into a Node.js + React application.
> It is organized so an implementing agent can work through it section by section.
> Every page, route, form field, admin capability, external link, and content block
> from the original note is preserved. Long Sinhala body-text passages that are *content*
> (not behavior) are referenced rather than reproduced — they live in the migrated data /
> a CMS, and are marked **[CONTENT — Sinhala, migrate verbatim]** so nothing is lost but
> the spec stays readable.

---

## 0. How to read this spec

- **Route** = the URL path the page lives at (kept identical to the old site to preserve SEO and existing links).
- **[STATIC]** = fixed page content, editable by admin through the CMS but not user-generated.
- **[DYNAMIC]** = content admins add/edit/delete through the admin panel.
- **[CONTENT — Sinhala, migrate verbatim]** = a block of Sinhala prose that exists in the
  original site; copy it exactly from the source content export. Do not translate, rewrite,
  or re-key it by hand (risk of corrupting Sinhala combining characters).
- **[ADMIN]** = an admin-panel capability required to manage that page's data.
- Every page shares the global **Header**, **NavBar**, and **Footer** (see §2).

---

## 1. Project overview

**Client:** Dhammahadaya Senasanaya — a Theravada Buddhist forest monastery (aranya) in
Balangoda, Sri Lanka. The site is informational, educational, and provides a sponsorship/
booking function.

**Languages:** Primarily Sinhala, with English on several pages. Some pages have an
English/Sinhala toggle. Treat internationalization (i18n) as a first-class concern from the
start; decide URL/language strategy before building the router.

**Target stack (decided):**
- Frontend: React (with i18n; Sinhala-first)
- Backend: Node.js
- Database: **PostgreSQL** (relational + full-text search). Managed Postgres (Supabase / Neon / Railway / Render) recommended.
- Search: Postgres full-text (GIN index) or Meilisearch/Typesense for the large dictionaries + Tripitaka catalogue.
- Admin/CMS: a custom admin panel OR a headless CMS (Payload / Strapi). Content must be
  easy for non-technical monastery staff to manage.
- File storage for PDFs/media: object storage + CDN (Cloudflare R2 recommended) — do NOT
  store large files on the app server.
- Auth: custom, with **email OTP two-factor** for admin login. (Original used miniOrange/
  Xecurify; that config does NOT migrate — rebuild fresh.)
- Domains available: `.lk` and `.net`. Domain choice is independent of the stack — a DNS step at deploy time.

**Design tokens (brand palette):**
- White: `#FFFFFF`
- Primary orange: `#FDA042` and `#FD9939`
- Font/text accent brown: `#45311C`

**Guiding UX principle:** The new app may be *easier* to use than the current site but must
never be harder. Unnecessary navbar items may be simplified or removed. Follow correct auth
practices for admin login/signup.

**Known data sources already exported (from the old WordPress via Ninja Tables Pro), CSV + JSON:**
| Old Ninja Table ID | Title | Role in new app |
|---|---|---|
| 22810 | සරල සිංහල ශබ්දකෝෂය (Simple Sinhala dictionary) | Sinhala dictionary data |
| 22809 | akshara_vinyasa.json (from TablePress) | Orthography/spelling dictionary data |
| 20571 | සංක්ෂිප්ත සිංහල ශබ්දකෝෂය (Concise Sinhala dictionary) | Sinhala dictionary data |
| 20560 | පාළි සිංහල ශබ්දකෝෂය (Pali–Sinhala dictionary) | Pali–Sinhala dictionary data |
| 19729 | ත්‍රිපිටක නාමාවලිය (Tripitaka catalogue) | Tripitaka catalogue table (27 pages of rows) |

**Data verification still required (do in Claude Code before importing):**
1. Confirm Sinhala renders correctly in the JSON files (plain-text editor is source of truth; Excel mangling CSV is cosmetic).
2. Confirm each JSON file is non-trivial in size (rows actually exported).
3. Inspect JSON structure to read column keys → these define the DB schema.
4. Normalize all Sinhala/Pali text to Unicode **NFC** consistently, including on search input, or searches will miss matches.
5. Booking records live in the Booking Calendar plugin's own MySQL tables (e.g. `wp_booking`, `wp_bookingdates`, `wp_booking_form`, `wp_booking_meta`; prefix may differ) — reachable only via phpMyAdmin/DB tool. Decide whether historical bookings need migrating at all (new booking features are planned, so structure matters more than old rows).

---

## 2. Global layout (appears on every page)

### 2.1 Top bar (appears on scroll)
- Shows phone number and email: **+94 70 216 4642**, **dhammahadayasenasanaya@gmail.com**
- Becomes visible when the user starts scrolling.

### 2.2 NavBar — hierarchical menu (max nesting depth: 3 levels)
Most parent items also link to their own landing page (e.g. clicking "Tripitaka" → `/tripitaka/`).

1. **Dhammahadaya** → `/` (Home)
2. **Posts** (dropdown)
   - Posts → `/post/`
   - Ape Budu Hamuduruwo → `/ape-budu-hamuduruwo-all/`
   - Asu Maha Srawakayan Wahansela → `/asu-maha-srawakayan-wahansela/`
   - Important Articles → `/important-articles/`
3. **Tripitaka** (dropdown)
   - Tripitaka (search / tipitaka.lk embed) → `/tripitaka/`
   - Tripitaka Catalogue → `/tripitaka-catalogs/`
4. **PDF Books** (dropdown)
   - PDF Books → `/pdf-books/`
   - Tripitaka (PDF) → `/tripitaka-pdf/`
   - Atthakatha (PDF) → `/atthakatha/`
   - Tika (PDF) → `/tika/`
   - Other Valuable Books → `/other-valuable-book/`
5. **Dictionary** (dropdown)
   - Pali Sinhalese Dictionary → `/pali-sinhalese-dictionary/`
   - Sinhala Dictionary → `/sinhala-dictionary/`
6. **Dhamma Sermons** (dropdown)
   - Australia Dhamma Sermons → `/australia-dhamma-sermons/`
   - Calgary Dhamma Sermons → `/calgary-dhamma-sermons/`
   - Katina Pinkam Dhamma Sermons → `/katina-pinkam-dhamma-sermons/`
   - London Dhamma Sermons → `/london-dhamma-sermons/`
   - Sadaham Sakmana Dhamma Sermons → `/sadaham-sakmana-dhamma-sermons/`
   - The Buddhist TV Dhamma Sermon → `/the-buddhist-tv-dhamma-sermon/`
7. **Programs** (dropdown)
   - Programs → `/programs/`
   - Sathara Pohoya Calendar → `/sathara-pohoya-calendar/`
     - Sathara Pohoya Calendar 2025 → `/sathara-pohoya-calendar-2025/`
     - Sathara Pohoya Calendar 2026 → `/sathara-pohoya-calendar-2026/`
   - Buddha Puja → `/buddha-puja/`
   - Kathina Ceremony → `/kathina-ceremony/`
   - Meditation Programs → `/meditation-programs/`
8. **Development** (dropdown)
   - Development → `/development/`
   - Special Thanks → `/special-thanks/`
   - Honorable Tribute → `/honorable-tribute/`
   - Siri Sugatha Sasana Bandumathi → `/siri-sugatha-sasana-bandumathi/`
9. **Sponsorships** → `/sponsorship/`
10. **Contact Us** → `/contact-us/`
11. **About** → `/about/`

### 2.3 Footer (every page)
- © 2017 – 2026 – DHAMMAHADAYA SENASANAYA
- Listed domains: dhammahadaya.net | dhammahadaya.lk | dhammahadaya.org | dhamma-hadaya.com | dhamma-hadaya.org
- "Report any conversion errors to dhammahadayasenasanaya@gmail.com"
- Address line: Dhammahadaya Senasanaya – Watawala – Mulgama – Balangoda
- Mobile +94 70 216 4642, Land Phone +94 45 313 4808

---

## 3. Cross-cutting feature: "Article-list" pattern (reused in several places)

Four sections share ONE reusable pattern. Build it once, configure per section.

**Behavior:**
- A listing page shows entries as **boxes/cards**, each with a title + short excerpt + "Read More".
- "Read More" opens the full entry on its own page.
- On the full-entry page the user can navigate **previous ↔ next** through entries.
- [ADMIN] Admin can create, edit, delete entries. Listing shows newest first (where relevant).

**Sections that use this pattern:**
1. **Newsletters / Posts** — home shows newest 4; `/post/` lists all.
2. **Ape Budu Hamuduruwo** (`/ape-budu-hamuduruwo-all/`) — story entries.
3. **Important Articles** (`/important-articles/`) — article entries.
4. (Asu Maha Srawakayan is a single static page, NOT this pattern — see §5.3.)

Suggested data model: `entry { id, type[newsletter|budu_hamuduruwo|important_article], title_si, title_en?, excerpt, body (rich text), cover_image?, published_at, order }`.

---

## 4. Home page — `/`  (top to bottom)

The home page is the primary entry point. Sections in vertical order:

### 4.1 Hero / salutation
- Image: `golden-buddha.jpg` with text.
- **[CONTENT — Sinhala, migrate verbatim]** Namo Tassa salutation block (the "නමො තස්ස භගවතො අරහතො…" verse) and the second devotional block ("බුදුරජාණන් වහන්සේ, සතර මහා ධාතූන්…").

### 4.2 Monastery intro
- Image `Damma-Senasanaya-Logo.png` on the left, description on the right.
- [STATIC] English description: "Nestled amidst the mountains … Dhammahadaya means the Heart of the great teachings of the Buddha." plus the two following paragraphs (founding on 03 May 2017 as a branch of Mihindu Aranya; the forest, ~3 acres, Theravada bhikkhus, sermons based on Tripitaka and Atta Katha). Full text repeated on `/about/` (see §14) — store once, reference.
- **About Us** button → `/about/`.

### 4.3 Last Newsletters section
- Displays the **newest 4** newsletters as boxes (title + excerpt + "Read More").
- Uses the Article-list pattern (§3). Read More → full newsletter; prev/next navigation there.
- Current sample newsletter titles (for reference only; real data comes from migration/CMS):
  - "පස් හැවිරිදි වියේදී අරහත්වයට පත් වූ පංචශීල සමාධානීය ස්වාමීන් වහන්සේ"
  - "සර්වඥ ධාතු පූජාවේ ආනිසංස"
  - "කාමය යනු බාහිර වස්තුවක් නොව, පුද්ගලයා තුළ ඇති සංකල්පයකි."
  - "රහතන් වහන්සේ ද පඤ්චෝපාදානස්කන්‍ධයෝ නුවණින් මෙනෙහි කන්නා​හ"
- [ADMIN] Admin adds newsletters; only newest 4 show on home.

### 4.4 Posts button
- **Posts** button → `/post/` (lists ALL newsletters using the Article-list pattern).

### 4.5 Three horizontal buttons (Posts sub-navigation)
Left → right:
1. **Ape Budu Hamuduruwo** → `/ape-budu-hamuduruwo-all/` (see §5.1)
2. **Asu Maha Srawakayan Wahansela** → `/asu-maha-srawakayan-wahansela/` (see §5.3)
3. **Important Articles** → `/important-articles/` (see §5.4)

### 4.6 Tripitaka section
Three images with captioned buttons, left → right:
1. `Thripitaka-Catalogue-Img.jpg` → **Tripitaka Catalogue** → `/tripitaka-catalogs/`
   - caption: "Tripitaka, Atta Katha, Tika, Printed Book & Pdf Book Page Numbers Search easily"
2. `Thripitaka-Search-Img.jpg` → **Tripitaka Search** → `/tripitaka/`
   - caption: about scanned Buddha Jayanthi Tripitaka, 57-volume search, fonts for readability.
3. `Pdf-Book-Img.jpg` → **PDF Book** → `/pdf-books/`
   - caption: "Tripitaka, Atta Katha, Tika & Valuable Books Pdf Book"

### 4.7 Dhamma Sermons section
Two horizontal images, each with a button below:
1. `Dhamma-Sermons-Img` → **Dhamma Sermons** button → `/dhamma-sermon/` (see §9)
2. `youtube-logo-icon.png` → **YouTube** button → external channel
   `https://www.youtube.com/channel/UCJCpaizlVHxNzWi3tvEmsaw`

### 4.8 Sponsorships section
- A card: left = a calendar showing **Booked / Available / Pending** sponsored dates for the current month and next month; right = the "Prosperity of Buddha Sasana at heart…" donor thank-you message [STATIC, English].
- **Sponsorships** button below the card → `/sponsorship/` (see §10).

### 4.9 Meritorious deeds & Our Programs section
Three images with buttons, left → right:
1. `Katina-Img.jpg` → **Katina Ceremony** → `/kathina-ceremony/` (see §11)
2. `Buddha-Puja-Img.jpg` → **Buddha Puja** → `/buddha-puja/` (see §12)
3. `Meditation-Img.jpg` → **Meditation** → `/meditation-programs/` (see §13)

### 4.10 Contact Us section
- Google Maps embed of the monastery location
  (`https://www.google.com/maps/place/Dhammahadaya+Senasanaya/@6.6347779,80.7948675,...`).
- Small inquiry form → sent to admin. Fields: **Name, Email, phone Number, Message** + **Send** button.

### 4.11 Newsletter signup
- "Signup for our newsletter" — **Email** field + **Subscribe** button. Stores subscriber email.

### 4.12 Social + contact links
- WhatsApp group: `https://chat.whatsapp.com/By2DvSjmiaK23Wmw90Jj5D`
- WhatsApp number: `https://api.whatsapp.com/send/?phone=702164642&...`
- YouTube: `https://www.youtube.com/channel/UCJCpaizlVHxNzWi3tvEmsaw`
- Facebook: `https://www.facebook.com/dhammahadaya.net/`

### 4.13 Static contact block
- Address: Dhammahadaya Senasanaya, Watawala, Mulgama, Balangoda, 70117
- Office phone: +94 45 313 4808, +94 70 216 4642
- WhatsApp: +94 702164642 · Telegram: +94 702164642
- Hours: Weekdays 8:00–9:00 am, 7:00–9:00 pm; Saturday all day (phone on); Sunday all day (phone off)

---

## 5. Posts dropdown pages

### 5.1 Ape Budu Hamuduruwo — `/ape-budu-hamuduruwo-all/`
- **[CONTENT — Sinhala, migrate verbatim]** Header "අපේ බුදු හාමුදුරුවෝ" + devotional intro
  ("පන්ලක්ෂ දොළොස්‌ දහස්‌…" salutation, request for forgiveness, "සාධු සාධු සාධු", and the
  paragraph crediting Thusitha Rajapaksa's Facebook article series compiled with permission).
- Then the **Article-list pattern** (§3): story boxes → Read More → full story → prev/next.
- [ADMIN] same add/edit/delete + prev/next as newsletters.

### 5.2 Posts — `/post/`
- Lists ALL newsletters (Article-list pattern). Read More → full newsletter → prev/next.

### 5.3 Asu Maha Srawakayan Wahansela — `/asu-maha-srawakayan-wahansela/`  (STATIC page, not the list pattern)
- Header: "අසු මහා ශ්‍රාවකයන් වහන්සේලා"
- Image: `80-මහා-ශ්_රාවක-picture.jpg`
- **[CONTENT — Sinhala, migrate verbatim]** Devotional intro + the long enumerated list of
  the 80 great disciples (Arahants), each with name + descriptor (Añña Kondañña, Vappa,
  Bhaddiya, … through Pingiya), and the closing explanatory paragraph on why they are called
  Maha Sāvaka. This is a single long static page — migrate the whole block verbatim.

### 5.4 Important Articles — `/important-articles/`
- Article-list pattern (§3): article boxes → Read More → full article → prev/next.
- [ADMIN] add/edit/delete.

---

## 6. Tripitaka Catalogue — `/tripitaka-catalogs/`

Purpose: a cross-reference index (ත්‍රිපිටක නාමාවලිය) to locate suttas/units across the printed
Buddha Jayanthi Tipitaka, its PDFs, Pali & Sinhala Atthakatha, and Pali/Pali–Sinhala Tika.

- **[CONTENT — Sinhala, migrate verbatim]** Header "Tripitaka Catalogue"; devotional intro
  ("පන්ලක්ෂ දොළොස්‌ දහස්‌…", request for forgiveness, "සාදු සාදු සාදු"); the column-legend
  explanations; and the **red disclaimer** that the catalogue is incomplete / still being
  proofread / may contain errors, inviting corrections.
- **Search field** + **grid with pagination** (original had 27 pages).
- Data source: exported **Ninja Table 19729** (CSV + JSON already downloaded).
- **Columns** (exact, from the source table):
  `සූත්‍ර නාමය` (Sutta name) · `පිටකය` (Pitaka) · `නිකාය` (Nikaya) · `වග්ගය` (Vagga) ·
  `පෙළ පිටු අංක` (printed page no.) · `PDF පෙළ පිටු අංක` · `PDF පාළි අටුවාව` ·
  `සිංහල අටුවාව` · `PDF සිංහල අටුවාව` · `PDF පාළි ටීකා` · `පාළි - සිංහල ටීකා`
- Several PDF columns contain **clickable download links** (to the same MEGA/site PDFs listed on the PDF pages).
- Implementation: server-side full-text search + pagination (replaces slow client-side Ninja Tables filtering). Preserve Sinhala NFC normalization on both stored data and query input.
- [ADMIN] Admin should be able to add/edit/remove catalogue rows (it is under ongoing proofreading).

---

## 7. Tripitaka Search — `/tripitaka/`

- A thin wrapper page: header "Tripitaka" + a **full-height iframe** embedding
  `https://tipitaka.lk/`. All browsing/search/reading functionality comes from that external
  site (the Sri Lankan Buddha Jayanthi Tipitaka, 57 volumes: full Pali text + Sinhala
  translations, hierarchical browsing, scanned original pages).
- No original backend logic needed — just embed. (Confirm embedding is acceptable; if the
  iframe is ever blocked, fall back to a prominent outbound link.)

---

## 8. PDF Books area

### 8.1 PDF Books landing — `/pdf-books/`
Four download categories (the four current top-level PDF groupings). [ADMIN] add / edit / remove PDFs.
1. Tripitaka (PDF) | ත්‍රිපිටක (PDF) → `/tripitaka-pdf/`
2. Atthakatha (PDF) | අට්ඨකථා (PDF) → `/atthakatha/`
3. Tīka (PDF) | ටීකා (PDF) → `/tika/`
4. Other Valuable Books | වෙනත් වැදගත් පොත් → `/other-valuable-book/`

> **Data model for all PDF pages:** `pdf_book { id, category, subsection_path (e.g.
> Vinayapitakaya > Dighanikaya), code (e.g. SP_DN1), title, link_url, link_status
> [available | "No link yet"], order }`. Links point to **MEGA** (most) or **Google Drive**
> (some newer items). Preserve the exact display titles (Sinhala + transliteration) verbatim.
> The full current link inventory is in the source note; migrate it as data rows, not code.

### 8.2 Tripitaka (PDF) — `/tripitaka-pdf/`
Three major sections, each with subsections and MEGA links:
- **Buddha Jayanthi Pali & Sinhala Tripitaka** — Vinayapitakaya (SP_VP1–9), Suttapitakaya
  (Dīgha SP_DN1–3, Majjhima SP_MN1–3, Saṃyutta SP_SN1–6, Aṅguttara SP_AN1–6, Khuddaka
  SP_KN1–17), Abhidhammapitakaya (SP_AP1–13).
- **AP De Zoysa Tripitaka** — Vinaya 01–04, Dīgha 01–03, Majjhima 01–05, Saṃyutta 01–07,
  Aṅguttara 01–04, Khuddaka 01–07, Abhidhamma 01–07.
- **PTS / ENG Tripitaka (New)** — Vinaya (Horner, Book of the Discipline Vol I–VI; older
  Vinaya Texts I–III), Sutta (Dīgha Dialogues I–III; Majjhima Middle Length Sayings I–III;
  Saṃyutta Kindred Sayings I–V; Aṅguttara Gradual Sayings I–V; Khuddaka Jātaka I–VI);
  Abhidhamma: none listed.
- (Exact titles + MEGA URLs are in the source note — migrate as data.)

### 8.3 Atthakatha (PDF) — `/atthakatha/`
- **Pali Atthakatha | පාළි අට්‌ඨකථා** — Vinaya (PA01–05), Sutta: Dīgha (PA06–08), Majjhima
  (PA09–11), Saṃyutta (PA12–16), Aṅguttara (PA17–20), Khuddaka (PA21–44); Abhidhamma
  (PA45–47). All with MEGA links.
- **Pali & Sinhala Atthakatha (New) | පාළි සිංහල අට්‌ඨකථා** — mostly listed with
  **"No link yet"**; only a few have Google Drive links (e.g. SA04_VP4, SA06_DN1). The
  data model's `link_status` field handles the "No link yet" state.

### 8.4 Tika (PDF) — `/tika/`
- **Pali Tika | පාළි ටීකා** — Vinaya (PT01–13), Sutta: Dīgha (PT14–18), Majjhima (PT19–21),
  Saṃyutta (PT22–26), Aṅguttara (PT27–30), Khuddaka/Netti (PT31–32); Abhidhamma (PT33–41).
  All with MEGA links.

### 8.5 Other Valuable Books — `/other-valuable-book/`
Two download sections + a Dictionary heading that only points to the Dictionary nav pages.
1. **Main Dhamma Books** — Abhidharmartha Pradeepika 1–4, Abhidharma Chandrikawa, Abhidharma
   Margaya, … Paramitha Prakaranaya, Patichcha Samuppada Vivarana, … Rerukane Chandawimala
   Thero (full list + MEGA links in source note).
2. **History | ඉතිහාසය** — Thupavamsa (Pali), Thupavamsa Katha, Dāthāvamsa, Mahāvamsa,
   illustrated Sinhala Thupavamsa, Sinhala Thupavamsa Ganthipada, Sinhala Dīpavamsa (+ links).
3. **Dictionary | ශබ්දකෝෂය** — two book links (Pali–Sinhala dictionary by Maditiyawela Siri
   Sumangala; Jinavachana Kosha by Mawittara Rewatha 1956) — these are downloadable books,
   distinct from the interactive Dictionary pages in §Dictionary.

---

## 9. Dhamma Sermons — `/dhamma-sermon/` (+ sub-pages)

Top-level index page: a menu linking to themed series (no search/player on the index itself):
- Australia Dhamma Sermons → `/australia-dhamma-sermons/`
- Calgary Dhamma Sermons → `/calgary-dhamma-sermons/`
- Katina Pinkam Dhamma Sermons → `/katina-pinkam-dhamma-sermons/`
- London Dhamma Sermons → `/london-dhamma-sermons/`
- Sadaham Sakmana Dhamma Sermons → `/sadaham-sakmana-dhamma-sermons/`
- The Buddhist TV Dhamma Sermon → `/the-buddhist-tv-dhamma-sermon/`

**Sub-page pattern (all series share it):**
- A paginated list of **YouTube videos**, each shown as thumbnail + title (Sinhala, sometimes English).
- Playback via YouTube embed keyed on the video ID. Some videos are "Private video".
- Series can be long and are paginated (e.g. "1 of 3", "1 of 7").
- **Data model:** `sermon_video { id, series_slug, title_si, title_en?, youtube_id, order, year?, speaker?, related_sutta? }`; `series { slug, name, order }`.
- [ADMIN] Admin can add/edit/delete videos in any series.

---

## 10. Sponsorships — `/sponsorship/`  (booking system — highest-effort feature)

Purpose: lay supporters sponsor the monastery's daily needs on specific dates (dana, utilities, medical, education/travel, general).

**Page structure:**
1. Header: "Sponsorships දායකත්ව".
2. A bilingual note with an **English/Sinhala toggle**:
   - [STATIC, English] "Prosperity of Buddha Sasana at heart… Dear Sir/Madam … May the Triple-gem protect you! Dhammahadaya Forest Monastery" + 5-step booking instructions.
   - **[CONTENT — Sinhala, migrate verbatim]** the Sinhala equivalent ("සාසනික ලැදියාවෙන් යුක්තව…", the donor message, "තෙරුවන් සරණයි!", and the Sinhala booking instructions).
3. **Interactive calendar** showing color-coded date status: **Available / Booked / Pending** (current + next month, at least).
4. **Booking form** (below the calendar). Fields (English | Sinhala labels):
   - Name | නම
   - Email | ඊ ලිපිනය
   - Phone Number | දුරකථන අංකය
   - Date | දිනය
   - Details / Objective | අරමුණ
   - **Send** button.

**Workflow:**
- User selects an available date, fills the form, clicks Send → the date becomes **Pending**.
- [ADMIN] Admin reviews and **confirms**; on confirmation the date becomes **Booked**.
- On confirmation, the sender receives an **email** confirmation.
- **[NEW FEATURE]** Also send the confirmation via **WhatsApp** using a whatsapp-web.js
  integration (admin links their WhatsApp number by scanning a QR). Build email first;
  WhatsApp as an added channel.

**Backend requirements:** store bookings; prevent double-booking; statuses
available/pending/booked; notify monastery + sponsor. Data model:
`sponsorship_booking { id, date, status[available|pending|booked], name, email, phone, objective, mailing_address?, created_at, confirmed_at? }`.

**Note:** Original used the WP Booking Calendar plugin (own MySQL tables). Since new features
are wanted, treat historical booking rows as optional to migrate; migrate the structure and
build fresh. This is the biggest timeline risk — consider build-vs-buy (e.g. self-hosted
Cal.com) if the client's needs are complex.

---

## 11. Katina Ceremony — `/kathina-ceremony/`

- Lists the **organizers** for the Katina ceremony of each year.
- A **photo gallery** for each year's ceremony.
- [ADMIN] Admin can add/change organizers per year, and add images to a year after its ceremony.
- Data model: `katina_year { year, organizers[], images[] }`.

---

## 12. Buddha Puja — `/buddha-puja/`

- Header "Buddha Puja".
- **[CONTENT — Sinhala, migrate verbatim]** dedication/merit-sharing text (monthly Full-moon
  Sambuddha Pūjā + New-moon Gilānpasa Sambuddha Pūjā; blessings; "තෙරුවන් සරණයි").
- Then a **paginated YouTube video gallery** (same pattern as Dhamma Sermons; currently "1 of 2")
  + a **photo gallery** of puja images uploaded by admin, each with the puja date.
- Sample video rows (YouTube ID → title), for reference:
  `wlb0gFwhAlQ` 2026 බක් පුර පසලොස්වක · `b14RwR4PqoQ` 2024 වෙසක් · `d6bdkV9LHMg` 2024 පොසොන් ·
  `6mz_nzAJK88` 2024 ඇසළ · `ecAsA1ui-f0` 2024 නිකිණි · `HrQ93gbQCXs` 2024 බිනර ·
  `dgpHlM-FQPE` 2024 වප් · `AzHfk11D0JU` 2024 උදුවප් · `Kmpht_GE1IM` 2024 ඉල් ·
  `tzACi4ueT3M` 2025 දුරුතු · `1WdYD0No-pE` 2025 නවම් · `RbuHnufs-qs` 2025 නවම් – ගිලන්පස
- Video type dimension: Full-moon Pūjā vs Gilānpasa Pūjā; also year + lunar month.
- [ADMIN] Admin can add/edit/upload videos and gallery images.

---

## 13. Meditation Programs — `/meditation-programs/`

- Header "Meditation Programs".
- **[CONTENT — Sinhala, migrate verbatim]** the full rules/guidelines document for residential
  yogis: registration + daily attendance register; sīla clothing rules; no mobile phones/
  valuables (emergency number 045 313 4808); strict silence; dana & gilānpasa (no evening
  meal); items to bring; premises-cleanliness note; "තෙරුවන් සරණයි!"; signed by the
  Organizing Committee.
- **Registration form** (gets sent to admin). Fields (English | Sinhala):
  - Name | නම
  - Email
  - Phone Number
  - From Date (MAX 7 days) | දින සිට (උපරිම දින 7)
  - To Date
  - Experience of meditation | භාවනා පුහුණු / නුපුහුණු බව  → Yes (භාවනා පුහුණු) / No (නුපුහුණු බව)
  - Types of meditation performed | කරන ලද භාවනා වර්ග
  - Who were your previous meditation teachers? | ඔබේ කලින් භාවනා ගුරුවරුන් කවුද?
  - What are the current diseases? | දැනට පවතින රෝග මොනවාද?
  - **Agreement tick-box** | (the long Sinhala "ඉහත සියලු තොරතුරු සත්‍ය…" pledge) — required.
  - **"I'm not a robot"** reCAPTCHA.
  - **Send** button.
- Backend: store the application; notify the monastery (email or admin dashboard).
- Data model: `meditation_application { id, name, email, phone, from_date, to_date, experience[yes|no], meditation_types, previous_teachers, current_diseases, agreed[bool], created_at }`.

---

## 14. About — `/about/`  (STATIC)

- Header "About | අප ගැන" with **English / Sinhala** options.
- [STATIC, English] Full about text: registration No. **BC/TEMPO/20/18/072**; "Nestled amidst
  the mountains…"; founding history (03 May 2017, Mihindu Aranya branch, Siyam Nikaya Rohana
  Parshavaya Wanavasa sector, named theros and chief dayakas); daily monastery life (dana,
  Buddha poojawa, sermons, seclusion/meditation).
- **[CONTENT — Sinhala, migrate verbatim]** the Sinhala About text ("ධම්මහදය සේනාසනය … ලියාපදිංචි
  අංකය: බෞකො/20/18/072 …" including the location description and daily-life paragraphs).
- **Photo gallery** below the static section. [ADMIN] Admin can add/delete images.

---

## 15. Dictionary pages

Both are single searchable two-column tables (originally Elementor Advanced Data Table,
client-side filter, whole dictionary loaded at once → slow). **Rebuild with server-side
search + pagination.** Preserve NFC normalization on data and query.

### 15.1 Pali Sinhalese Dictionary — `/pali-sinhalese-dictionary/`
- Title "Pali Sinhalese Dictionary – පාළි සිංහල ශබ්දකෝෂය".
- Search box + table, 2 columns: **පාලි වචනය** (Pali word) | **සිංහල පරිවර්තනය** (Sinhala translation/grammar notes).
- Data source: Ninja Table **20560** (CSV + JSON exported). Confirm actual column keys on import.

### 15.2 Sinhala Dictionary — `/sinhala-dictionary/`
- Title "Sinhala Dictionary – සිංහල ශබ්දකෝෂය".
- Note displayed above table: "~46,000 words currently included; loading takes some time"
  (the point of the rebuild is to make this fast → server-side search fixes it).
- Search box + table, 2 columns: **වචනය** (word) | **සමාන පදමාලාව** (definitions/synonyms).
- Data source(s): Ninja Tables **22810 (සරල)**, **20571 (සංක්ෂිප්ත)**, and **22809
  (akshara_vinyasa)** — confirm on import which table backs which page, and whether the
  Sinhala Dictionary page should merge more than one of these. Column keys to be read from JSON.

> **Dictionary data model:** `dictionary_entry { id, dictionary[pali_sinhala|sinhala_simple|sinhala_concise|akshara], term, definition, extra? }` with a full-text index on `term` (and optionally `definition`). Consider Meilisearch/Typesense for instant typo-tolerant search across large tables.

---

## 16. Programs dropdown — calendars

### 16.1 Programs — `/programs/`
- Landing page for the Programs dropdown.

### 16.2 Sathara Pohoya Calendar — `/sathara-pohoya-calendar/`
- Links to per-year calendars (2025, 2026, and future years).

### 16.3 Sathara Pohoya Calendar 2025 — `/sathara-pohoya-calendar-2025/`
- Title "සතර පොහොය දින දර්ශනය 2025".
- A table with columns: **Month (Sinhala–English)**, **Date**, **Weekday**, **Poya**.
  (Full 2025 dataset — දුරුති/January through උඳුවප්/December, with Poya phases පුර අටවක /
  පුර පසළොස්වක / අව අටවක / අමාවක — is in the source note; migrate as data rows.)
- An **image** of the calendar is also uploaded.

### 16.4 Sathara Pohoya Calendar 2026 — `/sathara-pohoya-calendar-2026/`
- Title "සතර පොහොය දින දර්ශනය 2026". Same table structure + uploaded image. (Full 2026 dataset in source note.)

- [ADMIN] Admin can **upload upcoming calendars** (table data + an image) and **edit/remove**
  old calendars. Data model: `pohoya_calendar { year, rows[{month_si_en, date, weekday, poya}], image_url }`.

---

## 17. Development dropdown

### 17.1 Development — `/development/`  (STATIC)
- Bank details for donations:
  - Account Name: **Dhammahadaya Senasanaya (For Development)**
  - Account Number: **109761005375**
  - Bank: **Sampath Bank**, Branch: **Balangoda**
  - SWIFT: **BSAMLKLX**

### 17.2 Special Thanks — `/special-thanks/`
- Title "Special Thanks | විශේෂ පුණ්‍යානුමෝදනා කිරීම්".
- Lists major donors under English + Sinhala section headings, e.g.: Offering of the Senasanaya
  to the Maha Sanga; Sima Malakaya & Vihara Puja; Drinking Water; Vehicle donation; Residential
  two-storied Kuti with Buddha Kuti; Buddha statue; Guest monks' kuti (Sinhala-only row).
- Notable donors repeated across sections (Dr. Shiryani Abeysuriya, Mrs. Nirma Jayaweera /
  Palandagama, Mrs. Yishani Karunanayake, and others — local + Australia).
- [ADMIN] Admin can add/edit/update/delete entries. Data model: `special_thanks { id, section_en, section_si, purpose, donors[], order }`.

### 17.3 Honorable Tribute — `/honorable-tribute/`
- Title "Honorable tribute | ගෞරව උපහාරයයි".
- **[CONTENT — Sinhala, migrate verbatim]** a single formal tribute letter to Most Venerable
  Karagoda Uyangoda Maitreya Murthi Maha Nayaka Thero (Amarapura Maha Nikaya) with his
  honorific titles.
- [ADMIN] Admin can add/edit/update/delete. Data model: one static rich-text record.

### 17.4 Siri Sugatha Sasana Bandumathi — `/siri-sugatha-sasana-bandumathi/`
- Title "Siri Sugatha Sasana Bandumathi | සිරි සුගත ශාසන බන්දුමතී".
- An official honorary-certificate announcement (ශ්‍රී සන්නස් පත්‍රය).
  - Recipient: වෛද්‍ය ශ්‍රියානි අබේසූරිය මැතිනිය (Dr. Shiryani Abeysuriya), Rajagiriya.
  - Honor: "සිරි සුගත ශාසන බන්දුමතී".
  - Date/place: 3 May 2025, Dhammahadaya Senasanaya, Balangoda / Watawala / Mulgama.
  - Conferred by: Most Ven. Agalabada Piyasiri Maha Nayaka Thero (Sri Rohana, Siamopali Maha
    Nikaya) and Most Ven. Galpatha Sumana Anunayaka Thero (Anunayaka, head of Vanavasa Sangha Sabha).
- **[CONTENT — Sinhala, migrate verbatim]** the formal certificate text.

---

## 18. Contact Us — `/contact-us/`  (STATIC)

- Location + directions (English + Sinhala):
  - Near the Divineguma Training Center in the Balangoda Samanalawewa Reserve Zone.
  - ~5 km left from Rajawaka Junction on the Balangoda–Kalthota main road (easier route).
  - ~4 km left from Depelamulla Junction on the same road.
- Postal address: Dhammahadaya Senasanaya, Watawala, Mulgama, Balangoda, **70117**
  (Sinhala section shows **70177** — a known inconsistency on the original page; pick one and confirm with client).
- Contact details: Email dhammahadayasenasanaya@gmail.com · Phone +94 70 216 4642 ·
  Phone +94 45 313 4808 · WhatsApp +94 70 216 4642 · Telegram +94 70 216 4642.
- Office phone hours: Weekdays 8:00–9:00 am & 7:00–9:00 pm; Saturday all day (on); Sunday all day (off).
- **Newsletter signup** + a simple **inquiry form** at the bottom (Name, Email, phone, Message → admin).

---

## 19. Admin panel — consolidated capabilities

A single admin area (behind auth + email-OTP 2FA) must let non-technical staff manage:
- **Newsletters / Posts** — CRUD, ordering; newest 4 surface on home. (§3, §4.3, §5.2)
- **Ape Budu Hamuduruwo** stories — CRUD + prev/next. (§5.1)
- **Important Articles** — CRUD + prev/next. (§5.4)
- **Asu Maha Srawakayan** static page — edit. (§5.3)
- **Tripitaka Catalogue** rows — CRUD (ongoing proofreading). (§6)
- **PDF Books** (all four categories) — add/edit/remove PDF entries + links, incl. "No link yet" state. (§8)
- **Dhamma Sermons** videos — CRUD per series. (§9)
- **Sponsorship bookings** — review, confirm (→ Booked), trigger email + WhatsApp confirmation. (§10)
- **Katina Ceremony** — organizers per year + per-year photo galleries. (§11)
- **Buddha Puja** — videos + dated photo gallery. (§12)
- **Meditation applications** — view submissions. (§13)
- **About** photo gallery — add/delete images. (§14)
- **Sathara Pohoya Calendars** — upload new year (table + image), edit/remove old. (§16)
- **Special Thanks / Honorable Tribute / Siri Sugatha** — CRUD/edit. (§17)
- **Contact / inquiry form submissions** and **newsletter subscribers** — view/export. (§4.10, §4.11, §18)

**Auth:** correct practices for admin login/signup; email-OTP two-factor (rebuild, not migrated).

---

## 20. Non-functional requirements & build notes

- **Performance is the reason for the rebuild.** The dictionaries and Tripitaka catalogue must
  use server-side search + pagination, not load entire tables client-side. Validate search
  performance on the real ~46k-row Sinhala dictionary early (a spike) before building features.
- **Sinhala/Pali correctness:** utf8mb4 end-to-end; normalize to Unicode **NFC** on both stored
  data and query input; handle ZWJ/ZWNJ ligatures; round-trip test one Sinhala string before mass import.
- **Media/PDF storage:** object storage + CDN (Cloudflare R2). Most Tripitaka PDFs are external
  MEGA/Google-Drive links today — keep them as links unless the client wants them re-hosted.
- **i18n:** Sinhala-first; several pages have EN/SI toggles; decide URL/language strategy up front.
- **SEO / continuity:** keep the existing URL paths (listed throughout) or add redirects, to
  preserve Google indexing and printed/shared links.
- **Two caches** (LiteSpeed + WP Super Cache) conflicted on the old site — irrelevant to the new
  stack, but keep the old site alive until the new one is verified; cut over when data reconciles.

### Recommended build order (spikes first)
1. Project skeleton (Node API + React + Postgres + i18n scaffolding + design tokens/palette).
2. **Spike:** Sinhala encoding round-trip + dictionary search performance on real data.
3. Data import scripts for the 5 exported tables (dictionaries + catalogue).
4. Dictionary pages (§15) and Tripitaka Catalogue (§6) — the core, highest-value pages.
5. Article-list pattern (§3) → Newsletters/Posts, Ape Budu Hamuduruwo, Important Articles.
6. PDF Books pages (§8) as data-driven link lists.
7. Dhamma Sermons + Buddha Puja video galleries (§9, §12).
8. Sponsorship booking system + email, then WhatsApp (§10).
9. Meditation registration (§13); Katina (§11); Calendars (§16).
10. Static pages: About, Contact, Development, Special Thanks, Honorable Tribute, Siri Sugatha (§14, §17, §18).
11. Admin panel wiring across all of the above (§19).
12. Home page assembly (§4) pulling from all sections.

### Open questions to confirm with the client
- Exact list of **new features** wanted (beyond WhatsApp confirmations).
- Sponsorship complexity → build vs. buy for the calendar.
- Whether large PDFs should be re-hosted (R2) or kept as MEGA/Drive links.
- Postal code 70117 vs 70177.
- Whether the Sinhala Dictionary page merges multiple exported tables.
- Who edits the site day-to-day (shapes admin UX).
