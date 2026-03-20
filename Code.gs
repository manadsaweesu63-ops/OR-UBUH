function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Surgery Schedule System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Get all surgery schedules from Google Sheet
 */
function getSurgerySchedule() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('SurgerySchedule') || createSurgerySheet(ss);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        let value = row[i];
        // Handle Date objects from Sheets
        if (value instanceof Date) {
          if (header === 'date') {
            value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
          } else {
            value = value.toISOString();
          }
        }
        obj[header] = value;
      });
      return obj;
    });
  } catch (e) {
    console.error('Error in getSurgerySchedule:', e);
    return [];
  }
}

/**
 * Add a new surgery schedule to Google Sheet
 */
function addSurgerySchedule(item) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('SurgerySchedule') || createSurgerySheet(ss);
    const headers = ["id", "date", "time", "room", "doctor", "patientName", "patientHN", "patientAge", "procedure", "surgeryType", "department", "status"];
    
    const id = Utilities.getUuid();
    const row = headers.map(h => h === 'id' ? id : (item[h] || ''));
    sheet.appendRow(row);
    return { ...item, id };
  } catch (e) {
    console.error('Error in addSurgerySchedule:', e);
    throw e;
  }
}

/**
 * Update an existing surgery schedule in Google Sheet
 */
function updateSurgerySchedule(id, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('SurgerySchedule');
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idIndex = headers.indexOf('id');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === id) {
        headers.forEach((header, j) => {
          if (data[header] !== undefined) {
            sheet.getRange(i + 1, j + 1).setValue(data[header]);
          }
        });
        break;
      }
    }
    return getSurgerySchedule();
  } catch (e) {
    console.error('Error in updateSurgerySchedule:', e);
    throw e;
  }
}

/**
 * Delete a surgery schedule from Google Sheet
 */
function deleteSurgerySchedule(id) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('SurgerySchedule');
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idIndex = headers.indexOf('id');
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] === id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return getSurgerySchedule();
  } catch (e) {
    console.error('Error in deleteSurgerySchedule:', e);
    throw e;
  }
}

/**
 * Helper to create the sheet if it doesn't exist
 */
function createSurgerySheet(ss) {
  const sheet = ss.insertSheet('SurgerySchedule');
  const headers = ["id", "date", "time", "room", "doctor", "patientName", "patientHN", "patientAge", "procedure", "surgeryType", "department", "status"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
  sheet.setFrozenRows(1);
  return sheet;
}
