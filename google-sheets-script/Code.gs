/**
 * Google Apps Script para registrar confirmaciones de asistencia.
 * Compatible con aplicación web de Google Apps Script.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getActiveSheet();

    if (sheet.getLastRow() === 0) {
      var headers = [
        'Fecha',
        'Nombre',
        'WhatsApp',
        'Asistencia',
        'Acompañantes',
        'Restricciones alimentarias',
        'Mensaje'
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#e6c375');
      headerRange.setFontColor('#11140d');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      for (var col = 1; col <= headers.length; col++) {
        sheet.setColumnWidth(col, 180);
      }
      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(2, 220);
      sheet.setColumnWidth(7, 300);
    }

    var params = {};
    if (e && e.parameter) {
      params = e.parameter;
    }

    if (Object.keys(params).length === 0 && e && e.postData && e.postData.contents) {
      params = parseFormUrlEncoded(e.postData.contents);
    }

    var fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
    var nombre = String(params.nombre || '').trim();
    var telefono = String(params.telefono || '').trim();
    var asistencia = String(params.asistencia || '').trim();
    var acompanantes = String(params.acompanantes || '').trim() || '0';
    var restricciones = String(params.restricciones || params.dieta || params.alergias || '').trim() || 'Ninguna';
    var mensaje = String(params.mensaje || '').trim() || 'Sin mensaje';

    var noAsiste = asistencia === 'No podré asistir';
    if (!nombre || !asistencia || (!noAsiste && !telefono)) {
      throw new Error('Faltan datos obligatorios: nombre y asistencia; el teléfono es obligatorio si asistirá.');
    }

    var rowData = [
      fecha,
      nombre,
      telefono,
      asistencia,
      acompanantes,
      restricciones,
      mensaje
    ];

    // Actualiza la confirmación existente para no duplicar invitados.
    var lastRow = sheet.getLastRow();
    var existingRows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, headers.length).getValues() : [];
    var normalizedName = nombre.toLowerCase();
    var duplicateRow = 0;

    for (var i = 0; i < existingRows.length; i++) {
      var existingName = String(existingRows[i][1] || '').trim().toLowerCase();
      var existingPhone = String(existingRows[i][2] || '').replace(/\D/g, '');
      var submittedPhone = telefono.replace(/\D/g, '');

      if ((submittedPhone && existingPhone && submittedPhone === existingPhone) ||
          (!submittedPhone && existingName && existingName === normalizedName)) {
        duplicateRow = i + 2;
        break;
      }
    }

    if (duplicateRow) {
      sheet.getRange(duplicateRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
      duplicateRow = sheet.getLastRow();
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      message: 'Confirmación registrada correctamente.',
      row: duplicateRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    result: 'online',
    message: 'Servicio activo.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function parseFormUrlEncoded(contents) {
  var result = {};
  var pairs = String(contents || '').split('&');

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    if (!pair) continue;
    var divider = pair.indexOf('=');
    var key = divider === -1 ? pair : pair.slice(0, divider);
    var value = divider === -1 ? '' : pair.slice(divider + 1);
    result[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
  }

  return result;
}
