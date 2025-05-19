import { NextRequest, NextResponse } from "next/server";
import { addRowToSheet } from "@/lib/googleSheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      isbn,
      title,
      author,
      date,
      memo,
      rating,
      image
    } = body;

    // 入力チェック（必要に応じて追加）
    if (!isbn || !title || !author || !date || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await addRowToSheet({ isbn, title, author, date, memo, rating, image });

    return NextResponse.json({ message: "Success" }, { status: 200 });

  } catch (error) {
    console.error("Error saving to sheet:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
