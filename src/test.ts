import { supabase } from "./supabase.js";

async function main() {
  const { data, error } = await supabase
    .from("note_article_snapshots")
    .select("*")
    .limit(1);

  console.log(data);
  console.log(error);
}

main();