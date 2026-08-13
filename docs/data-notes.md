# Data notes — migration inputs (backend/previous_system_files/)

Findings from inspecting the five Ninja Tables exports + the PDF link inventory, before
writing any import code. See §3–4 of the project handoff and §1/§20 of the build spec for
the checks these satisfy.

## Import gotchas (must handle in the import scripts)

1. **Read `original_rows[].value`, not `rows`.** Every exported JSON file has the shape
   `{ post, columns, settings, data_provider, metas, rows, original_rows }`. The top-level
   `rows` array is a Ninja Tables cache that is **empty (length 0)** in all five exports —
   it was not populated at export time. The actual data is in `original_rows`, where each
   element looks like:
   ```json
   { "position": ..., "owner_id": ..., "attribute": "value",
     "value": { "<column_key>": "...", "<column_key_2>": "..." },
     "settings": null, "created_at": "...", "updated_at": "..." }
   ```
   The column keys inside `value` match the `key` field in the top-level `columns` array,
   which is also where the human-readable Sinhala column labels live.

2. **Import from JSON, not CSV.** The CSVs are not safe to parse with a naive line-based
   reader: several definition fields (dictionary meanings especially) contain literal
   embedded newlines inside quoted cells. A naive newline split overcounts rows badly —
   e.g. the simple Sinhala dictionary CSV appears to have ~66,000 lines by naive count vs.
   the true **46,026** rows confirmed via JSON `original_rows`. The JSON is the source of
   truth; the CSVs are only useful as a human-readable cross-check (open in a real text
   editor, not naive line-splitting).

3. **NFC-normalize every string field on import.** Spot-checking all string values in
   `original_rows[].value` across all five files: the large majority are already
   Unicode NFC, but a non-trivial tail is not:
   - `akshara_vinyasa-json-imported-from-table-press.json` — **8 fields** not NFC (out of 18,406 checked)
   - `සරල-සිංහල-ශබ්දකෝෂය.json` (simple Sinhala dictionary) — **14 fields** not NFC (out of 92,052 checked)
   - All other files (Tripitaka catalogue, Pali–Sinhala dictionary, concise dictionary): 0 non-NFC fields found.

   Apply `.normalize('NFC')` to every string field during import, unconditionally — don't
   special-case the two files above, since the "clean" files could still have upstream one-offs.
   Apply the same normalization to search query input at query time, or these ~22 rows will
   silently fail to match on their broken variant of the text and (worse) any future data
   entered by admin staff might reintroduce the same inconsistency.

## Row counts and columns (confirmed via JSON `original_rows`)

| Table | Ninja ID | Rows | Column keys → labels |
|---|---|---|---|
| Sinhala dictionary (සරල) | 22810 | 46,026 | `word` → වචනය, `meaning` → සමාන පදමාලාව |
| Pali–Sinhala dictionary | 20560 | 44,339 | `ninja_column_1` → පාලි වචනය, `ninja_column_2` → සිංහල පරිවර්තනය |
| Orthography dict (akshara_vinyasa) | 22809 | 9,203 | `ninja_column_1` → අංකනය, `ninja_column_2` → definition |
| Concise Sinhala dictionary (සංක්ෂිප්ත) | 20571 | 1,431 | `වචනය`, `සමාන_පදමාලාව` |
| Tripitaka catalogue | 19729 | 268 | `නාමය`, `පිටකය`, `පොත`, `වග්ගය`, `පෙළ: පිටු අංක`, `pdf_පිටු_අංක`, `පාළි.අටු.`, `සිංහ​ල අටුවාව`, `pdf_සිංහල_අටුවාව`, `ටීකා`, `ටීකා_pdf` (matches the 11 columns in build-spec §6 exactly) |
| pdf-books.csv | — | 293 (253 `available`, 38 `no_link_yet`, 2 `available_new`) | `category, section, subsection, title, link_url, link_status` |

Encoding: Sinhala renders correctly throughout (file names, JSON, CSV) — no mojibake, ligatures
intact (e.g. ක්‍ර / ශ්‍රී-type conjuncts render properly).

## Open questions (need a client/product decision, not an engineering guess)

- **Tables 20571 (concise Sinhala dictionary, 1,431 rows) and 22809 (akshara_vinyasa /
  orthography dictionary, 9,203 rows) have no corresponding nav page in the build spec.**
  The spec's Sinhala Dictionary page (§15.2) is accounted for by table 22810 alone — its
  46,026 row count matches the spec's own "~46,000 words" note exactly, so no merge is
  needed there. That leaves 20571 and 22809 exported but with nowhere in the site to
  surface them. Ask the client: are these dead data (superseded, not linked anywhere on
  the live site), or do they want new nav entries/pages for them? Do not decide this by
  guessing — confirm before building.
- Postal code 70117 vs 70177 (already flagged in build spec §18) — unresolved, still needs
  the client.
