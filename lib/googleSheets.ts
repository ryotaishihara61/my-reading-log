import { google } from "googleapis";

export async function addRowToSheet(data: {
  isbn: string;
  title: string;
  author: string;
  date: string;
  memo: string;
  rating: number;
  image: string;
}) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, "base64").toString("utf-8")
    : undefined;

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
  const range = "A1"; // 自動で行を追加

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        data.isbn,
        data.title,
        data.author,
        data.date,
        data.memo,
        data.rating,
        data.image
      ]]
    }
  });
}
