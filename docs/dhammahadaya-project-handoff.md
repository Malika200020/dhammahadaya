# Project Handoff — Dhammahadaya Senasanaya Web App Rebuild

## Purpose of this document
This is a complete context transfer for rebuilding an existing WordPress website as a modern Node.js + React application. It is written to be pasted into another AI tool to (1) produce a Software Requirements Specification (SRS) and (2) generate implementation prompts for Claude Code. It captures every decision and finding from the planning conversation so nothing is lost.

---

## 1. The project

**Client:** Dhammahadaya Senasanaya — a Theravada Buddhist monastery / aranya in Balangoda, Sri Lanka.

**Current state:** A WordPress site that is slow, especially on pages with large dictionary datasets, images, the booking calendar, and Tripitaka search/tables. It has many plugins causing bloat.

**Decision (final):** Do NOT optimize WordPress. Rebuild the entire system from scratch in **Node.js + React**. The client also wants NEW features added, which reinforces the rebuild decision. The main risk and effort is **data migration**, not the rebuild itself.

**Developer context:** The person doing this has zero WordPress knowledge and will implement using Claude Code after planning the system properly. They want to minimize token usage during implementation, so planning (SRS + prompts) is being done in a separate tool first.

---

## 2. What the site does (feature inventory)

- **Bilingual:** Primarily Sinhala, with English sections. i18n is required from day one, not bolted on later. URL structure (e.g. `/si/...` vs `/en/...`) must be decided before building the router.
- **Homepage:** Monastery description, recent newsletters/posts (sermons, articles on Tripitaka, Arahants, etc.), sponsorship/donation appeals, contact info.
- **Tripitaka & Resources (the core, heavy part):**
  - Tripitaka catalogue and search (by page numbers, volumes — 57 volumes of the Buddha Jayanthi Tripitaka).
  - PDF books: Tripitaka, Atthakatha, Tika, and other valuable books (potentially large — hundreds of MB to several GB total).
  - Large dictionary datasets powering search (see section 3).
- **Dhamma Sermons & Programs:** Booking Calendar for full-day reservations, time slots, appointments, meditation sessions, events, Poya days.
- **Other:** Posts/news, About Us, Sponsorships, Contact, YouTube gallery.
- **Content management constraint:** Non-technical monastery staff must be able to add sermons, upload PDFs, publish newsletters, and manage bookings easily. A React frontend alone does NOT provide this — an admin/CMS layer must be built or adopted (see section 6).

---

## 3. The dictionary + catalogue data (MOST IMPORTANT — the heart of the app)

Stored in **Ninja Tables Pro**. Five tables, already exported to both CSV and JSON by the user (saved locally). These "large JSON dictionaries" are the primary cause of slowness because Ninja Tables ships entire datasets to the browser and filters client-side.

| ID    | Title (Sinhala)              | Meaning                          |
|-------|------------------------------|----------------------------------|
| 22810 | සරල සිංහල ශබ්දකෝෂය            | Simple Sinhala dictionary        |
| 22809 | akshara_vinyasa.json         | Spelling/orthography dictionary (imported from TablePress) |
| 20571 | සංක්ෂිප්ත සිංහල ශබ්දකෝෂය       | Concise Sinhala dictionary       |
| 20560 | පාළි සිංහල ශබ්දකෝෂය            | Pali–Sinhala dictionary          |
| 19729 | ත්‍රිපිටක නාමාවලිය             | Tripitaka index/catalogue        |

**Status:** CSV + JSON downloaded for all five. NOT yet verified for encoding/row-count/structure — this verification is deferred to the implementation phase in Claude Code.

**Verification still to do (in Claude Code):**
1. Confirm Sinhala text is intact in the JSON (a plain text editor is the source of truth; Excel mangling CSV UTF-8 is cosmetic and can be ignored).
2. Confirm file sizes are non-trivial (hundreds of KB to several MB each; a few hundred bytes would mean rows didn't export).
3. Inspect JSON structure to learn the column key names — these become the database schema fields.

---

## 4. Critical technical risk: Sinhala/Pali text handling

This is the #1 migration risk and must be handled before building anything data-related.

- Verify source MySQL tables are `utf8mb4` (old WP installs are sometimes `latin1` with stored mojibake).
- Do a byte-for-byte round-trip test: export one Sinhala row → import to the new DB → compare.
- Sinhala uses combining characters (ZWJ/ZWNJ for ligatures like ක්‍ර). **Normalize consistently — pick Unicode NFC and apply it everywhere, including search queries**, or searches will silently miss matches.
- Pali-in-Sinhala-script vs. romanized Pali with diacritics (ā, ī, ṃ, ñ) are different search targets. Decide whether to support both.
- **Get one Sinhala string end-to-end working before building anything else.** If it breaks, everything downstream breaks.

---

## 5. Search architecture (replaces the slow Ninja Tables client-side filtering)

The Tripitaka catalogue (57 volumes, page-level search) plus four dictionaries need proper server-side full-text search. Options:

- **PostgreSQL with a GIN full-text index** — solid default.
- **Meilisearch or Typesense** — if typo tolerance and instant results are wanted. Meilisearch handles Unicode scripts well and is easy to self-host. Recommended to prototype search alone early to confirm Sinhala search quality is acceptable. If this fails, the whole rebuild premise is in question — so validate it in week one.

---

## 6. CMS / admin layer (must not be forgotten — often half the work)

The client needs an easy content-management experience. A plain React frontend has no admin panel. Options:

- **Payload CMS** — Node-native, self-hostable. Good fit for a Node stack.
- **Strapi** — the other common headless CMS choice.
- Or build a custom admin (more work).

Budget real time for this; it is frequently underestimated in "simple" WordPress replacements.

---

## 7. PDF books storage

Tripitaka / Atthakatha / Tika PDFs are large. Do NOT store them on the app server's filesystem. Options:

- Keep serving from current server behind a **CDN**, or
- Move to **object storage** — **Cloudflare R2** recommended (no egress fees, which matters for large religious texts served to a distributed audience) or S3.

Check actual total size early (via WP Site Health → Directories and Sizes) to know if this is a 200MB or 20GB problem.

---

## 8. Booking system (biggest timeline risk — decide build vs. buy)

Current: Booking Calendar plugin (wpdevelop/oplugins), free + Pro. Supports time slots, full-day reservations, recurring Poya-day events, email confirmations.

**Data location:** Custom database tables (NOT posts, NOT Ninja Tables). Typical table names (prefix may differ from `wp_`):
- `wp_booking` — core reservations (dates, status)
- `wp_bookingdates` — specific dates/time slots per booking
- `wp_booking_form` — form field definitions
- `wp_booking_meta` — booking metadata
- plus resource/availability tables depending on version

These are only reachable via **phpMyAdmin** (hosting panel) or a DB tool — no clean admin-panel export button. To be pulled during implementation.

**Recommendations:**
- Rebuilding booking from scratch (timezone handling, double-booking prevention, cancellation flows, recurring events) is genuinely a few weeks of careful work. Consider **build vs. buy** — e.g. self-hosted **Cal.com** or an embedded scheduler — before committing to build.
- Since NEW booking features are wanted anyway, historical booking *records* likely do NOT need migrating. Migrate the *structure/requirements*, build fresh, and only port old rows if the client explicitly needs them. Decide this before spending effort.

---

## 9. Authentication / 2FA

Current admin login uses **miniOrange 2FA (Xecurify)** — sends an email passcode (OTP). This configuration does NOT migrate. Rebuild email-OTP from scratch (a few hours with any mailer). Do not attempt to port the miniOrange setup.

---

## 10. Other data to migrate (full inventory)

- **Posts / pages / newsletters / sermons:** In WordPress, exportable as WXR XML (Tools → Export). BUT — see Elementor caveat below.
- **Elementor caveat (a trap):** Pages built with Elementor store their content as serialized JSON in the `_elementor_data` postmeta field, NOT as usable HTML in `post_content`. A normal content export yields near-empty pages. Since the site is being redesigned anyway, **scraping the rendered frontend HTML is usually faster** than parsing `_elementor_data`.
- **Media files:** Live in `wp-content/uploads`, pulled separately via SFTP/file manager. The XML export only references URLs, it does not contain the files.
- **Users:** `wp_users` + `wp_usermeta`. Passwords are phpass hashes (`$P$` prefix) and CAN be ported (Node `phpass` libraries exist) so users needn't reset — worth doing if there's a real user base.
- **TablePress:** Also installed; may hold real data — check its own tables.
- **Quiz Maker:** Its own tables (`wp_ayspro_*`) — check if used.
- These separate data stores are easy to forget.

---

## 11. Immediate WordPress fix (independent of rebuild)

Two page caches are running simultaneously — **LiteSpeed Cache AND WP Super Cache** — which conflict and can make the site slower than no cache. **Deactivate WP Super Cache now**, keep LiteSpeed. Five-minute fix, buys breathing room while the rebuild proceeds. Keep the WordPress site live until the new system is verified in production; cut over when data reconciles, not on a fixed date.

---

## 12. Full plugin list of the current site (for reference)

Activity Log; Advanced Editor Tools; Booking Calendar (free, required by Pro); Buttons to Edit Next/Previous Post; Captcha by BestWebSoft; Classic Editor; Classic Widgets; EasyMedia (increase upload size); Elementor + Elementor Pro; Essential Addons for Elementor (free + Pro); Limit Attempts by BestWebSoft; Limit Login Attempts Reloaded; LiteSpeed Cache; miniOrange 2FA; MonsterInsights Pro; Ninja Tables + Ninja Tables Pro; Post SMTP; Quiz Maker; Quotes and Tips by BestWebSoft; Site Kit by Google; TablePress; WordPress Importer; WP Content Copy Protection & No Right Click; WP Mail Logging; WP Super Cache; WP-PageNavi; XML Sitemap Generator for Google; YotuWP YouTube Gallery.

Most of these become unnecessary in the rebuild (security, caching, editor, table, and SEO plugins are all replaced by native app architecture).

---

## 13. Recommended implementation sequence

1. Take a full DB dump (`mysqldump` with `--default-character-set=utf8mb4` — the charset flag is mandatory to avoid corrupting Sinhala) + a `wp-content` tarball. Restore locally so you can query freely without touching production.
2. **Encoding audit — Sinhala round-trip test before anything else.**
3. Inventory the Tripitaka + dictionary data: row counts, column names, exact storage location.
4. **Prototype search alone** — load the corpus into Postgres or Meilisearch, confirm Sinhala search works acceptably. If it fails, you want to know in week one.
5. Pick and stand up the CMS/admin layer.
6. Content + media migration (mind the Elementor caveat).
7. Booking last, after deciding build vs. buy.

Steps 2 and 4 are cheap and carry the unknown risk — do them first.

---

## 14. Proposed tech stack (starting point, to refine in SRS)

- **Frontend:** React (with i18n for Sinhala/English)
- **Backend:** Node.js
- **Database:** PostgreSQL (relational data + full-text search), optionally Meilisearch/Typesense for search
- **CMS:** Payload or Strapi (or custom admin)
- **File storage:** Cloudflare R2 or S3 + CDN for PDFs and media
- **Auth:** custom, with email-OTP 2FA for admin
- **Implementation tool:** Claude Code

---

## 15. What to produce next (in the other AI tool)

1. A full **SRS** covering: functional requirements (public site, Tripitaka search, dictionaries, PDF library, booking, bilingual content, CMS/admin, auth), non-functional requirements (performance targets, Unicode correctness, accessibility), data model, and migration plan.
2. A sequenced set of **Claude Code implementation prompts**, ordered per section 13, starting with the encoding/search validation spikes before feature build-out.
