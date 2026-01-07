function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("メモアプリ");
}

function saveMemo(text) {
  if (!text || !text.trim()) {
    throw new Error("メモが空です。");
  }

  var sheet = getMemoSheet_();
  sheet.appendRow([new Date(), text.trim()]);
  return { ok: true };
}

function updateMemo(rowId, text) {
  if (!text || !text.trim()) {
    throw new Error("メモが空です。");
  }

  var row = Number(rowId);
  if (!row || row < 2) {
    throw new Error("無効なメモです。");
  }

  var sheet = getMemoSheet_();
  var lastRow = sheet.getLastRow();
  if (row > lastRow) {
    throw new Error("対象のメモが見つかりません。");
  }

  sheet.getRange(row, 2).setValue(text.trim());
  return { ok: true };
}

function deleteMemo(rowId) {
  var row = Number(rowId);
  if (!row || row < 2) {
    throw new Error("無効なメモです。");
  }

  var sheet = getMemoSheet_();
  var lastRow = sheet.getLastRow();
  if (row > lastRow) {
    throw new Error("対象のメモが見つかりません。");
  }

  sheet.deleteRow(row);
  return { ok: true };
}

function getMemos() {
  var sheet = getMemoSheet_();
  var values = sheet.getDataRange().getValues();
  var tz = Session.getScriptTimeZone();
  var memos = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0] && !row[1]) {
      continue;
    }
    memos.push({
      id: i + 1,
      createdAt: row[0]
        ? Utilities.formatDate(new Date(row[0]), tz, "yyyy-MM-dd HH:mm")
        : "",
      text: row[1] || ""
    });
  }

  return memos.reverse();
}

function getMemoSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    var props = PropertiesService.getScriptProperties();
    var spreadsheetId = props.getProperty("SPREADSHEET_ID");
    if (!spreadsheetId) {
      throw new Error("アクティブなスプレッドシートがありません。スクリプトプロパティに SPREADSHEET_ID を設定してください。");
    }
    ss = SpreadsheetApp.openById(spreadsheetId);
  }

  var sheet = ss.getSheetByName("Memos");
  if (!sheet) {
    sheet = ss.insertSheet("Memos");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Created At", "Memo"]);
  }
  return sheet;
}
