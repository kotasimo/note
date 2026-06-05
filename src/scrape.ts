import { chromium } from "playwright";
import { supabase } from "./supabaseServer.js";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://note.com");

  await page.pause();

  const noteUpdatedText = await page
    .locator("text=最新集計時刻")
    .locator("xpath=..")
    .innerText();

  console.log("noteUpdatedText:", noteUpdatedText);

  const rows = await page.locator("tr").all();

  const articles = [];

  for (const row of rows) {
    const link = row.locator("a.o-statsContent__tableTitleLink");

    if ((await link.count()) === 0) continue;

    const title = await link.innerText();
    const href = await link.getAttribute("href");

    const articleId = href?.split("/n/")[1];

    const viewsText = await row
      .locator(".o-statsContent__tableStat--type_view")
      .innerText();

    const likesText = await row
      .locator(".o-statsContent__tableStat--type_suki")
      .innerText();

    const views = Number(viewsText);
    const likes = Number(likesText);

    articles.push({
      articleId,
      title,
      href,
      views,
      likes,
    });
  }

  const { data: latestSnapshot } = await supabase
    .from("note_article_snapshots")
    .select("note_updated_text")
    .not("note_updated_text", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestSnapshot?.note_updated_text === noteUpdatedText) {
    console.log("note側の集計時刻が変わっていないので保存しません");
    await browser.close();
    return;
  }
  const snapshot = {
    capturedAt: new Date().toISOString(),
    articles,
  };

  const rowsForDb = articles.map((article) => ({
    captured_at: new Date().toISOString(),
    article_id: article.articleId,
    title: article.title,
    href: article.href,
    views: article.views,
    likes: article.likes,
    note_updated_text: noteUpdatedText,
  }));

  const { error } = await supabase
    .from("note_article_snapshots")
    .insert(rowsForDb);

  console.log(error);

  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  const fileName = `data/${new Date().toISOString().replace(/:/g, "-")}.json`;

  fs.writeFileSync(fileName, JSON.stringify(snapshot, null, 2));

  console.log(`${fileName} に保存しました`);

  await browser.close();
}

main();
