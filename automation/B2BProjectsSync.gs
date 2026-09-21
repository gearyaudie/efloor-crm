/**
 * Bound to the "efloor masterdata" Google Sheet.
 * Syncs new rows in the "B2B Projects" tab to Sanity as `b2bProject` documents.
 *
 * Sheet columns (row 1 = header) in the "B2B Projects" tab:
 *   A: Type | B: Nama Barang | C: Nama PT | D: Quantity | E: Tanggal
 *   F: Photo (image inserted in cell, via Insert > Image > Insert in cell)
 *   G: Sanity Doc ID (written by this script; leave blank for new rows)
 *
 * Setup (see automation/README.md for full steps):
 *   1. Open the Sheet -> Extensions -> Apps Script, paste this file in.
 *   2. Project Settings -> Script Properties: set SANITY_PROJECT_ID,
 *      SANITY_DATASET, SANITY_TOKEN (Editor-role token from
 *      manage.sanity.io -> project -> API -> Tokens).
 *   3. Run `syncB2BProjectsToSanity` once to authorize.
 *   4. Optionally add a time-driven trigger (Triggers -> Add Trigger) to
 *      run it daily. A "efloor" menu with a manual "Sync now" item is also
 *      added automatically when the Sheet is opened.
 */

const SHEET_NAME = "B2B Projects";
const API_VERSION = "2024-05-11";
const COLUMNS = {
  type: 1,
  namaBarang: 2,
  namaPT: 3,
  quantity: 4,
  tanggal: 5,
  photo: 6,
  sanityDocId: 7,
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("efloor")
    .addItem("Sync B2B Projects to Sanity", "syncB2BProjectsToSanity")
    .addToUi();
}

function getSanityConfig_() {
  const props = PropertiesService.getScriptProperties();
  const projectId = props.getProperty("SANITY_PROJECT_ID");
  const dataset = props.getProperty("SANITY_DATASET");
  const token = props.getProperty("SANITY_TOKEN");
  if (!projectId || !dataset || !token) {
    throw new Error(
      "Set SANITY_PROJECT_ID, SANITY_DATASET and SANITY_TOKEN in Script Properties first.",
    );
  }
  return { projectId, dataset, token };
}

function uploadImageToSanity_(config, blob) {
  const url = `https://${config.projectId}.api.sanity.io/v${API_VERSION}/assets/images/${config.dataset}`;
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: blob.getContentType() || "image/jpeg",
    payload: blob.getBytes(),
    headers: { Authorization: `Bearer ${config.token}` },
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() >= 300) {
    throw new Error(`Sanity asset upload failed: ${response.getContentText()}`);
  }
  const json = JSON.parse(response.getContentText());
  return json.document._id;
}

function createSanityDocument_(config, doc) {
  const url = `https://${config.projectId}.api.sanity.io/v${API_VERSION}/data/mutate/${config.dataset}`;
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ mutations: [{ create: doc }] }),
    headers: { Authorization: `Bearer ${config.token}` },
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() >= 300) {
    throw new Error(`Sanity mutation failed: ${response.getContentText()}`);
  }
  const json = JSON.parse(response.getContentText());
  return json.results[0].id;
}

function toIsoDate_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return value; // assume already ISO/plain text if not a Date cell
}

function syncB2BProjectsToSanity() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Tab "${SHEET_NAME}" not found.`);

  const config = getSanityConfig_();
  const lastRow = sheet.getLastRow();
  let synced = 0;

  for (let row = 2; row <= lastRow; row++) {
    const docIdCell = sheet.getRange(row, COLUMNS.sanityDocId);
    if (docIdCell.getValue()) continue; // already synced

    const photoCell = sheet.getRange(row, COLUMNS.photo);
    const image = photoCell.getValue();
    // Sheets returns an inserted-in-cell image as a CellImage object, which
    // exposes getContentUrl() (not getBlob() — CellImage has no such method).
    const isCellImage = image && typeof image.getContentUrl === "function";
    if (!isCellImage) continue; // skip incomplete rows (no photo yet)

    const type = sheet.getRange(row, COLUMNS.type).getValue();
    const namaBarang = sheet.getRange(row, COLUMNS.namaBarang).getValue();
    const namaPT = sheet.getRange(row, COLUMNS.namaPT).getValue();
    const quantity = sheet.getRange(row, COLUMNS.quantity).getValue();
    const tanggal = sheet.getRange(row, COLUMNS.tanggal).getValue();

    if (!namaBarang || !namaPT) continue; // skip rows without the basics

    const imageBlob = UrlFetchApp.fetch(image.getContentUrl()).getBlob();
    const assetId = uploadImageToSanity_(config, imageBlob);
    const docId = createSanityDocument_(config, {
      _type: "b2bProject",
      type: type ? String(type) : undefined,
      namaBarang: String(namaBarang),
      namaPT: String(namaPT),
      quantity: quantity ? String(quantity) : undefined,
      tanggal: tanggal ? toIsoDate_(tanggal) : undefined,
      photo: {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      },
    });

    docIdCell.setValue(docId);
    synced++;
  }

  Logger.log(`Synced ${synced} new row(s) to Sanity.`);
}
