import { chromium } from "playwright";

async function main() {
    const browser = await chromium.launch({
        headless: false,
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    await page.goto("https://note.com");

    console.log("ログインしてください");

    await page.pause();

    await context.storageState({
        path: "auth.json",
    });

    console.log("auth.json保存完了");

    await browser.close();
}

main();