function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVP Responses");

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVP Responses");
    sheet.appendRow(["Timestamp", "Full Name", "Address", "Will Attend"]);
  }

  sheet.appendRow([
    new Date(),
    e.parameter.fullName || "",
    e.parameter.address || "",
    e.parameter.attendance || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
