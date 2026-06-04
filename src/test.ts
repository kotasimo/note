import { supabase } from "./supabase.js";

async function main() {
  const { error } = await supabase
    .from("note_article_snapshots")
    .insert([
      {
        captured_at: new Date().toISOString(),
        article_id: "test",
        title: "テスト記事",
        href: "/test",
        views: 123,
        likes: 5,
      },
    ])
    
  console.log(error);
}

main();