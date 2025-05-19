"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  const [isbn, setIsbn] = useState("");
  const [bookInfo, setBookInfo] = useState<{ title: string; author: string; image: string } | null>(null);
  const [memo, setMemo] = useState("");
  const [rating, setRating] = useState(3);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");

  const fetchBookInfo = async () => {
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const volume = data.items[0].volumeInfo;
        console.log("imageLinks:", volume.imageLinks);  // 👈 ここ追加

        const image = (volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || "/no-image.png")
          .replace(/^http:\/\//, "https://");
          console.log("image URL:", image);  // 👈 ここも追加

        setBookInfo({
          title: volume.title || "",
          author: volume.authors?.[0] || "",
          image,
        });
        setMessage("");
      } else {
        setBookInfo(null);
        setMessage("書籍が見つかりませんでした。");
      }
    } catch (_err) {
      setMessage("検索に失敗しました。");
    }
  };

  const submit = async () => {
    if (!bookInfo) return;
    console.log("保存データ:", {
      isbn,
      title: bookInfo.title,
      author: bookInfo.author,
      date,
      memo,
      rating,
      image: bookInfo.image,
    }); 
    try {
      await axios.post("/api/save-book", {
        isbn,
        title: bookInfo.title,
        author: bookInfo.author,
        date,
        memo,
        rating,
        image: bookInfo.image,
      });
      setMessage("保存しました！");
      setIsbn("");
      setBookInfo(null);
      setMemo("");
      setRating(3);
    } catch (_err) {
      setMessage("保存に失敗しました。");
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📚 読書記録アプリ</h1>
      <Link href="/books" className="text-blue-500 underline text-sm mb-4 inline-block">
  読了一覧を見る →
</Link>

      <label className="block mb-1">ISBN-13:</label>
      <div className="flex gap-2 mb-4">
        <input
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          className="border px-2 py-1 flex-1"
          placeholder="例: 9784763141880"
        />
        <button onClick={fetchBookInfo} className="bg-blue-500 text-white px-3 py-1 rounded">
          書籍検索
        </button>
      </div>

      {bookInfo && (
        <div className="border p-4 mb-4">
          <p><strong>タイトル:</strong> {bookInfo.title}</p>
          <p><strong>著者:</strong> {bookInfo.author}</p>
          {bookInfo.image && <img src={bookInfo.image} alt="表紙" className="my-2 w-32" />}
        </div>
      )}

      {bookInfo && (
        <>
          <label className="block mt-4 mb-1">読了日:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-2 py-1 mb-4"
          />

          <label className="block mb-1">評価（★）:</label>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer text-xl ${star <= rating ? "text-yellow-500" : "text-gray-400"}`}
              >
                ★
              </span>
            ))}
          </div>

          <label className="block mb-1">メモ・感想:</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="border w-full p-2 mb-4"
            rows={3}
          />

          <button
            onClick={submit}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            保存する
          </button>
        </>
      )}

      {message && <p className="mt-4 text-sm text-blue-600">{message}</p>}
    </main>
  );
}
