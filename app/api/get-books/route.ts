import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const range = "A2:G"; // 2行目以降を取得

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    return NextResponse.json({ data: rows }, { status: 200 });

  } catch (error: any) {
    console.error("❌ 読み込みエラー:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "読み込みに失敗しました" },
      { status: 500 }
    );
  }
}
