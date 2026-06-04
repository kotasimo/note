import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./supabase.js";

function App() {
  const [snapshots, setSnapshots] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("note_article_snapshots")
        .select("*")
        .limit(5);

      console.log(data);
      console.log(error);

      setSnapshots(data ?? []);
    }

    loadData();
  }, []);

  return (
    <main>
      <h1>noteanalys</h1>

      <ul>
        {snapshots.map((item) => (
          <li key={item.id}>
            {item.title} / {item.views} views / {item.likes} likes
          </li>
        ))}
      </ul>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);