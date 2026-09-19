# B2B Projects: Google Sheet → Sanity sync

Every month's new B2B procurement projects get added by editing the
**"B2B Projects"** tab of the **efloor masterdata** Google Sheet instead of
touching code. `B2BProjectsSync.gs` is an Apps Script bound to that Sheet
which pushes new rows into Sanity as `b2bProject` documents (schema in
`../schemas/b2bProject.ts`).

## Sheet columns ("B2B Projects" tab)

| Column | Header | Notes |
| --- | --- | --- |
| A | Type | e.g. Procurement, Project Needs, Supply Toko |
| B | Nama Barang | item/product |
| C | Nama PT | client/company name |
| D | Quantity | optional, e.g. "75 Pcs" |
| E | Tanggal | date |
| F | Photo | **insert the 430x430 image directly in the cell** via `Insert > Image > Insert in cell` (not a Drive link) |
| G | Sanity Doc ID | leave blank — the script fills this in once a row is synced, and uses it to skip already-synced rows |

## One-time setup

1. Open the Sheet -> **Extensions -> Apps Script**.
2. Paste in the contents of `B2BProjectsSync.gs`.
3. **Project Settings -> Script Properties**, add:
   - `SANITY_PROJECT_ID` = `n5elvhr7`
   - `SANITY_DATASET` = `production`
   - `SANITY_TOKEN` = an Editor-role token from
     `manage.sanity.io -> your project -> API -> Tokens -> Add API token`
4. Run the `syncB2BProjectsToSanity` function once from the Apps Script
   editor to authorize the script's permissions (it needs to call external
   URLs and read the Sheet).
5. Reopen the Sheet — a new **"efloor"** menu appears with **"Sync B2B
   Projects to Sanity"** for syncing on demand right after adding rows.
6. Optional: **Triggers -> Add Trigger** on `syncB2BProjectsToSanity`, time-driven,
   daily, so nothing has to be triggered manually at all.

## How it works

- Only rows with column G (Sanity Doc ID) empty and a real image in column F
  are processed — already-synced rows and incomplete rows are skipped.
- The image is uploaded to Sanity's asset endpoint, then a `b2bProject`
  document is created referencing that asset, using columns A–E.
- The new document's ID is written back into column G so re-running the
  sync never creates duplicates.
- The live site's `/projects` page and homepage snippet read `b2bProject`
  documents straight from Sanity (see `app/projects/page.tsx` and
  `app/components/ProjectsSnippet.tsx` in the `efloor` repo), so a synced
  row shows up on the site automatically — no redeploy needed.
