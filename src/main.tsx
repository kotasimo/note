import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./supabase.js";
import "./App.css";

function App() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

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

            <ul>
              {history.map((item) => (
                <li key={item.id}>
                  {new Date(item.captured_at).toLocaleString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" "}
                  {item.views}
                </li>
              ))}
            </ul>
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
  </React.StrictMode>
);