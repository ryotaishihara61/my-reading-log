import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ 環境変数のログ出力（Vercelのログに表示されます）
    console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log("GOOGLE_PRIVATE_KEY exists:", !!process.env.GOOGLE_PRIVATE_KEY);
    console.log("GOOGLE_PRIVATE_KEY preview:", process.env.GOOGLE_PRIVATE_KEY?.slice(0, 30));

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const range = "A2:G";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    return NextResponse.json({ data: rows }, { status: 200 });

  } catch (error) {
    console.error("❌ 読み込みエラー:", error);
    return NextResponse.json({ error: "読み込みに失敗しました" }, { status: 500 });
  }
}
