import { chromium } from "playwright"

async function main () {
    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto("https://note.com");

    await page.pause();

    const links = await page.locator(
        "a.o-statsContent__tableTitleLink"
    ).all();

    console.log("件数:", links.length);

    for (const link of links) {
        const title = await link.innerText();
        const href = await link.getAttribute("href");

        console.log({
            title,
            href,
        });
    }

    await browser.close();
}

main();