import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();

app.use(cors());

app.post("/scrape", (req, res) => {
  console.log("scrape開始");

  exec("npx tsx src/scrape.ts", (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      res.status(500).json({
        ok: false,
        message: stderr,
      });
      return;
    }

    console.log(stdout);

    res.json({
      ok: true,
      message: stdout,
    });
  });
});

app.listen(3001, () => {
  console.log("server running on http://localhost:3001");
});
