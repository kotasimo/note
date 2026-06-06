import express from "express";
import cors from "cors";
import { main } from "./scrape.js";

const app = express();

app.use(cors());

app.post("/scrape", async (req, res) => {
  console.log("scrape開始");

  try {
    const result = await main();

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "scrape失敗",
    });
  }
});

app.listen(3001, () => {
  console.log("server running on http://localhost:3001");
});
