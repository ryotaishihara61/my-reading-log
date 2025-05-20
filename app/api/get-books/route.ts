import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyBase64 = process.env.GOOGLE_PRIVATE_KEY_BASE64;

    // ✅ 環境変数のログ出力（Vercelログで確認）
    console.log("GOOGLE_SERVICE_ACCOUNT_EMAIL:", serviceAccountEmail);
    console.log("GOOGLE_PRIVATE_KEY_BASE64 exists:", !!privateKeyBase64);
    console.log(
      "GOOGLE_PRIVATE_KEY_BASE64 preview:",
      privateKeyBase64?.slice(0, 30)
    );

    if (!serviceAccountEmail || !privateKeyBase64) {
      throw new Error("Missing required environment variables.");
    }

    const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf-8");

    const auth = new google.auth.JWT(
      serviceAccountEmail,
      undefined,
      privateKey,
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
