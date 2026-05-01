import { GoogleAccount, GoogleCalendar, GoogleSheet } from '../models/index.js';
import { getCalendarClient, getSheetsClient } from './google-api-helper.js';

export async function assertGoogleAccountForUser(userId, googleAccountId) {
  const account = await GoogleAccount.findOne({
    _id: googleAccountId,
    user_id: userId,
    deleted_at: null
  });
  return account;
}

export async function loadCalendarForUser(userId, googleAccountId, calendarDbId) {
  const account = await assertGoogleAccountForUser(userId, googleAccountId);
  if (!account) return null;
  const cal = await GoogleCalendar.findOne({
    _id: calendarDbId,
    google_account_id: googleAccountId,
    deleted_at: null
  });
  return cal;
}

export async function loadSheetForUser(userId, googleAccountId, sheetDbId) {
  const account = await assertGoogleAccountForUser(userId, googleAccountId);
  if (!account) return null;
  const sheet = await GoogleSheet.findOne({
    _id: sheetDbId,
    google_account_id: googleAccountId,
    deleted_at: null
  });
  return sheet;
}

export async function runCalendarListTool({
  userId,
  googleAccountId,
  calendarDbId,
  timeMin,
  timeMax,
  maxResults = 10
}) {
  const cal = await loadCalendarForUser(userId, googleAccountId, calendarDbId);
  if (!cal) return { ok: false, error: 'Calendar not found' };

  let tMin = String(timeMin || '').trim();
  let tMax = String(timeMax || '').trim();
  if (!tMin) tMin = new Date().toISOString();
  if (!tMax) {
    const from = new Date(tMin);
    const endDate = Number.isNaN(from.getTime())
      ? new Date(Date.now() + 30 * 24 * 3600000)
      : new Date(from.getTime() + 30 * 24 * 3600000);
    tMax = endDate.toISOString();
  }
  const n = Math.min(50, Math.max(1, parseInt(String(maxResults), 10) || 10));

  const calendarClient = await getCalendarClient(googleAccountId);
  const res = await calendarClient.events.list({
    calendarId: cal.calendar_id,
    timeMin: tMin,
    timeMax: tMax,
    maxResults: n,
    singleEvents: true,
    orderBy: 'startTime'
  });

  const items = res.data.items || [];
  const events = items.map((e) => ({
    summary: e.summary || '(No title)',
    start: e.start?.dateTime || e.start?.date || '',
    end: e.end?.dateTime || e.end?.date || ''
  }));
  const text =
    events.length > 0
      ? events.map((e, i) => `${i + 1}. ${e.summary} — ${e.start}${e.end ? ` → ${e.end}` : ''}`).join('\n')
      : 'No events in this time range.';

  return { ok: true, events, text };
}

export async function runCalendarCreateTool({
  userId,
  googleAccountId,
  calendarDbId,
  summary,
  description,
  startIso,
  endIso
}) {
  const cal = await loadCalendarForUser(userId, googleAccountId, calendarDbId);
  if (!cal) return { ok: false, error: 'Calendar not found' };

  let startDt = String(startIso || '').trim();
  let endDt = String(endIso || '').trim();
  if (!startDt) return { ok: false, error: 'start_iso is required' };
  if (!endDt) {
    const d = new Date(startDt);
    if (Number.isNaN(d.getTime())) return { ok: false, error: 'Invalid start_iso' };
    endDt = new Date(d.getTime() + 30 * 60 * 1000).toISOString();
  }

  const calendarClient = await getCalendarClient(googleAccountId);
  await calendarClient.events.insert({
    calendarId: cal.calendar_id,
    requestBody: {
      summary: summary || 'Event',
      description: description || undefined,
      start: { dateTime: startDt },
      end: { dateTime: endDt }
    }
  });
  return { ok: true, message: 'Event created.' };
}

export async function runCalendarDeleteTool({ userId, googleAccountId, calendarDbId, eventId }) {
  const cal = await loadCalendarForUser(userId, googleAccountId, calendarDbId);
  if (!cal) return { ok: false, error: 'Calendar not found' };

  const eid = String(eventId || '').trim();
  if (!eid) return { ok: false, error: 'event_id is required' };

  const calendarClient = await getCalendarClient(googleAccountId);
  await calendarClient.events.delete({
    calendarId: cal.calendar_id,
    eventId: eid
  });
  return { ok: true, message: 'Event deleted.' };
}

export async function runSheetsAppendTool({
  userId,
  googleAccountId,
  sheetDbId,
  sheetTabName,
  rowValues
}) {
  const sheet = await loadSheetForUser(userId, googleAccountId, sheetDbId);
  if (!sheet) return { ok: false, error: 'Spreadsheet not found' };

  const values = Array.isArray(rowValues) ? rowValues.map((v) => String(v ?? '')) : [];
  if (!values.length) return { ok: false, error: 'row_values must be a non-empty array' };

  const tab = String(sheetTabName || 'Sheet1').replace(/'/g, '');
  const sheetsClient = await getSheetsClient(googleAccountId);
  await sheetsClient.spreadsheets.values.append({
    spreadsheetId: sheet.sheet_id,
    range: `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] }
  });
  return { ok: true, message: 'Row appended.' };
}

export async function runSheetsReadTool({
  userId,
  googleAccountId,
  sheetDbId,
  sheetTabName,
  rangeA1
}) {
  const sheet = await loadSheetForUser(userId, googleAccountId, sheetDbId);
  if (!sheet) return { ok: false, error: 'Spreadsheet not found' };

  const tab = String(sheetTabName || 'Sheet1').replace(/'/g, '');
  const explicit = String(rangeA1 || '').trim();
  const range = explicit || `${tab}!A1:Z200`;

  const sheetsClient = await getSheetsClient(googleAccountId);
  const res = await sheetsClient.spreadsheets.values.get({
    spreadsheetId: sheet.sheet_id,
    range
  });
  const values = res.data.values || [];
  const text =
    values.length > 0
      ? values.map((row, i) => `${i + 1}: ${(row || []).join(' | ')}`).join('\n')
      : '(no data in range)';
  return { ok: true, values, text, range: res.data.range || range };
}

export async function runSheetsUpdateTool({
  userId,
  googleAccountId,
  sheetDbId,
  sheetTabName,
  rowNumber,
  rowValues
}) {
  const sheet = await loadSheetForUser(userId, googleAccountId, sheetDbId);
  if (!sheet) return { ok: false, error: 'Spreadsheet not found' };

  const row = parseInt(String(rowNumber), 10);
  if (!row || row < 1) return { ok: false, error: 'row_number must be a positive integer' };

  const values = Array.isArray(rowValues) ? rowValues.map((v) => String(v ?? '')) : [];
  if (!values.length) return { ok: false, error: 'row_values must be a non-empty array' };

  const tab = String(sheetTabName || 'Sheet1').replace(/'/g, '');
  const range = `${tab}!A${row}:ZZ${row}`;

  const sheetsClient = await getSheetsClient(googleAccountId);
  await sheetsClient.spreadsheets.values.update({
    spreadsheetId: sheet.sheet_id,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] }
  });
  return { ok: true, message: `Row ${row} updated.` };
}
