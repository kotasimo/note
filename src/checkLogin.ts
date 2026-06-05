import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    storageState: "auth.json",
  });

  const page = await context.newPage();

  await page.goto("https://note.com/sitesettings/stats");

  await page.waitForLoadState("networkidle");

  for (let i = 0; i < 10; i++) {
    const before = await page.locator("tr").count();

    const moreButton = page.getByRole("button", { name: "もっとみる" });

    if ((await moreButton.count()) === 0) {
      console.log("もっとみるボタンがないので終了");
      break;
    }

    console.log("もっとみるクリック:", i + 1);

    await moreButton.click();
    await page.waitForTimeout(1500);

    const after = await page.locator("tr").count();

    console.log("行数:", before, "→", after);

    if (after === before) {
      console.log("行数が増えなかったので終了");
      break;
    }
  }

  console.log("全部表示しました");

  await page.pause();

  await browser.close();
}

main();
