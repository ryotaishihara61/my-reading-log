import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("📥 /api/get-books: 開始");

    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!serviceEmail || !privateKey || !spreadsheetId) {
      console.error("❌ 環境変数が不足しています");
      return NextResponse.json(
        { error: "Missing environment variables" },
        { status: 500 }
      );
    }

    const auth = new google.auth.JWT(
      serviceEmail,
      undefined,
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    console.log("✅ Google Sheets API クライアント初期化完了");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:G",
    });

    console.log("✅ データ取得成功");

    const rows = response.data.values || [];
    return NextResponse.json({ data: rows }, { status: 200 });

  } catch (error: any) {
    console.error("❌ 認証または取得エラー:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json(
      { error: "読み込みに失敗しました" },
      { status: 500 }
    );
  }
}
