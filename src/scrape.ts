import { chromium } from "playwright"

async function main () {
    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto("https://note.com");

    await page.pause();

    await browser.close();
}

main();