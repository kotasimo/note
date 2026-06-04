import { supabase } from "./supabase.js";

async function main() {
  const { data, error } = await supabase
    .from("note_article_snapshots")
    .select("*")
    .order("captured_at", { ascending: false })
    .limit(5);

  console.log(data);
  console.log(error);
}

main();
