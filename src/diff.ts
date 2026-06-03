import fs from "fs";
import path from "path";

const files = fs
  .readdirSync("data")
  .filter((file) => file.endsWith(".json"))
  .sort();

console.log(files);

const latestFile = files[files.length - 1];
const previousFile = files[files.length - 2];

console.log("最新:", latestFile);
console.log("前回:", previousFile);

const latest = JSON.parse(
  fs.readFileSync(`data/${latestFile}`, "utf-8")
);

const previous = JSON.parse(
  fs.readFileSync(`data/${previousFile}`, "utf-8")
);

console.log(latest.articles.length);
console.log(previous.articles.length);

const previousMap = new Map();

for (const article of previous.articles) {
  previousMap.set(article.articleId, article);
}

const diffs = [];

for (const article of latest.articles) {
  const prev = previousMap.get(article.articleId);

  if (!prev) {
    diffs.push({
      title: article.title,
      views: article.views,
      viewsDiff: null,
      likes: article.likes,
      likesDiff: null,
      status: "new",
    });

    continue;
  }

  diffs.push({
    title: article.title,
    views: article.views,
    viewsDiff: article.views - prev.views,
    likes: article.likes,
    likesDiff: article.likes - prev.likes,
    status: "existing",
  });
}

console.table(diffs);

const activeDiffs = diffs.filter(
  (item) => item.viewsDiff !== 0 || item.likesDiff !== 0
);

console.table(activeDiffs);