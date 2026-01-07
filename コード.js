function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Memo App");
}

function saveMemo(text) {
  if (!text || !text.trim()) {
    throw new Error("Memo text is empty.");
  }

  var sheet = getMemoSheet_();
  sheet.appendRow([new Date(), text.trim()]);
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
      throw new Error("No active spreadsheet. Set SPREADSHEET_ID in script properties.");
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
