"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type BookRow = [string, string, string, string, string, string, string];

export default function BookList() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [monthFilter, setMonthFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch("/api/get-books");
      const json = await res.json();
      setBooks(json.data);
    };
    fetchBooks();
  }, []);

  const uniqueMonths = Array.from(new Set(books.map((b) => b[3]?.slice(0, 7)))).sort();

  const filteredBooks = books.filter((book) => {
    const keyword = searchQuery.toLowerCase();
    const matchesKeyword =
      book[1]?.toLowerCase().includes(keyword) ||
      book[2]?.toLowerCase().includes(keyword);
    const matchesRating = Number(book[5]) >= ratingFilter;
    const matchesMonth = monthFilter === "" || book[3]?.startsWith(monthFilter);
    return matchesKeyword && matchesRating && matchesMonth;
  });

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const countByMonth: { [key: string]: number } = {};
  books.forEach((row) => {
    const date = row[3];
    const month = date?.slice(0, 7);
    if (month) {
      countByMonth[month] = (countByMonth[month] || 0) + 1;
    }
  });

  const chartData = Object.entries(countByMonth).map(([month, count]) => ({
    month,
    count,
  }));

  return (
    <main className="max-w-6xl mx-auto p-4 text-gray-900">
      <h1 className="text-2xl font-bold mb-2">📚 読書記録一覧</h1>
      <Link href="/" className="text-blue-500 underline text-sm mb-6 inline-block">
        → 本を新しく記録する
      </Link>

      {/* フィルター */}
      <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="タイトルや著者で検索"
          className="border px-3 py-2 w-full md:w-72 text-black bg-white placeholder-gray-500 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border px-3 py-2 w-full md:w-40 text-black bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value={0}>すべての評価</option>
          <option value={5}>★5 のみ</option>
          <option value={4}>★4以上</option>
          <option value={3}>★3以上</option>
          <option value={2}>★2以上</option>
          <option value={1}>★1以上</option>
        </select>

        <select
          value={monthFilter}
          onChange={(e) => {
            setMonthFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 w-full md:w-40 text-black bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">すべての年月</option>
          {uniqueMonths.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* 一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedBooks.map((book, i) => {
            const rawImage = book[6];

            const imageUrl = (() => {
            if (!rawImage || rawImage.trim() === "") return "/no-image.png";
            if (rawImage.includes("no-image")) return "/no-image.png";
            if (rawImage.startsWith("http")) return rawImage;
            return "/" + rawImage;
            })();

          return (
            <div key={i} className="border p-4 rounded shadow-sm bg-white">
              <img src={imageUrl} alt="表紙" className="w-24 mb-2" />
              <p className="text-lg font-semibold text-gray-900">{book[1]}</p>
              <p className="text-sm text-gray-700">{book[2]}</p>
              <p className="text-sm text-gray-600">📅 {book[3]}</p>
              <p className="text-yellow-500">{"★".repeat(Number(book[5]))}</p>
              {book[4] && <p className="text-sm mt-2 text-gray-700">{book[4]}</p>}
            </div>
          );
        })}
      </div>

      {/* ページネーション */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(filteredBooks.length / booksPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* グラフ */}
      {chartData.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">📊 月別読了数</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}
