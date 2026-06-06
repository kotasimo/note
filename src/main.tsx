import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./supabase.js";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function App() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const [history, setHistory] = useState<any[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("note_article_snapshots")
        .select("*")
        .order("captured_at", { ascending: false })
        .limit(100);

      console.log(data);
      console.log(error);

      const latestByArticle = new Map();

      for (const item of data ?? []) {
        if (!latestByArticle.has(item.article_id)) {
          latestByArticle.set(item.article_id, item);
        }
      }

      const articles = Array.from(latestByArticle.values());

      articles.sort((a, b) => b.views - a.views);

      setSnapshots(articles);
    }

    loadData();
  }, []);

  async function loadHistory(articleId: string) {
    setSelectedArticleId(articleId);

    const { data, error } = await supabase
      .from("note_article_snapshots")
      .select("*")
      .eq("article_id", articleId)
      .order("captured_at", { ascending: true });

    console.log(data);
    console.log(error);

    setHistory(data ?? []);
  }

  const totalViews = snapshots.reduce((sum, item) => sum + item.views, 0);
  const totalLikes = snapshots.reduce((sum, item) => sum + item.likes, 0);

  return (
    <main className="page">
      <section className="left">
        <h1>noteanalys</h1>

        <button
          disabled={isScraping}
          onClick={async () => {
            setIsScraping(true);
            setMessage("取得中...");

            try {
              const res = await fetch("http://localhost:3001/scrape", {
                method: "POST",
              });

              const result = await res.json();

              setMessage(result.message);
            } catch (error) {
              setMessage("エラーが発生しました");
            }

            setIsScraping(false);
          }}
        >
          {isScraping ? "取得中..." : "データ取得"}
        </button>

        {message && <p>{message}</p>}

        <div className="summary">
          <div className="summary-card">
            <div className="icon">👁</div>
            <div className="summary-number">{totalViews}</div>
            <div className="summary-label">全体ビュー</div>
          </div>

          <div className="summary-card">
            <div className="icon like">♥</div>
            <div className="summary-number like">{totalLikes}</div>
            <div className="summary-label">スキ</div>
          </div>
        </div>

        <table className="article-table">
          <thead>
            <tr>
              <th>記事</th>
              <th>ビュー</th>
              <th>スキ</th>
            </tr>
          </thead>

          <tbody>
            {snapshots.map((item) => (
              <tr key={item.id} onClick={() => loadHistory(item.article_id)}>
                <td className="title">{item.title}</td>
                <td>{item.views}</td>
                <td className="like">{item.likes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <aside className="right">
        {history.length > 0 ? (
          <>
            <h2>{history[0].title}</h2>

            <LineChart width={500} height={260} data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="note_updated_text"
                tickFormatter={(value) => value.replace("最新集計時刻 ", "")}
              />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" />
            </LineChart>

            <table className="history-table">
              <thead>
                <tr>
                  <th>時刻</th>
                  <th>ビュー</th>
                  <th>Δ</th>
                  <th>スキ</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, index) => {
                  const previous = history[index - 1];

                  const delta = previous ? item.views - previous.views : null;

                  return (
                    <tr key={item.id}>
                      <td>
                        {new Date(item.captured_at).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td>{item.views}</td>

                      <td>{delta === null ? "-" : `+${delta}`}</td>

                      <td>{item.likes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <p>記事を選択してください</p>
        )}
      </aside>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
