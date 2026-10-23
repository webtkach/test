import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  offline: process.env.APP_OFFLINE === "1",
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const portable = process.env.APP_HTML
  ? await readFile(process.env.APP_HTML, "utf8")
  : null;
const base = portable
  ? "http://lapki.test/"
  : process.env.APP_URL || "http://127.0.0.1:5173";
async function configurePortable(target) {
  if (!portable) return;
  await target.route("**/*", async (route) => {
    if (route.request().url() === base)
      return route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: portable,
      });
    throw new Error(
      `Portable app unexpectedly requested an external resource: ${route.request().url()}`,
    );
  });
}
await configurePortable(page);
await mkdir("test-results", { recursive: true });
try {
  await page.goto(base);
  await page.locator(".reel-card").first().waitFor();
  assert.equal(await page.locator(".reel-card").count(), 6);
  assert.equal(await page.locator(".hero").count(), 0);
  assert.equal(await page.locator(".rank-number").first().textContent(), "01");
  const desktopRows = await page
    .locator(".reel-card")
    .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().top));
  assert(
    desktopRows.every(
      (top, index) => index === 0 || top > desktopRows[index - 1],
    ),
    "References must appear as vertically ranked rows",
  );
  await page
    .locator(".reel-card img")
    .first()
    .evaluate((img) => img.decode());
  for (const img of await page.locator("img").all())
    assert(
      await img.evaluate((el) => el.complete && el.naturalWidth > 0),
      "Every illustration must load",
    );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "test-results/desktop.png",
    fullPage: true,
    animations: "disabled",
  });

  await page.getByLabel("Поиск референсов", { exact: true }).fill("грумера");
  assert.equal(await page.locator(".reel-card").count(), 1);
  await page.getByLabel("Поиск референсов", { exact: true }).fill("");
  await page.getByLabel("Регион", { exact: true }).selectOption("world");
  assert.equal(await page.locator(".reel-card").count(), 4);
  await page.getByLabel("Регион", { exact: true }).selectOption("all");
  await page.getByRole("button", { name: "Юмор", exact: true }).click();
  assert.equal(await page.locator(".reel-card").count(), 2);
  await page.getByRole("button", { name: "Все идеи", exact: true }).click();

  await page
    .locator(".reel-card")
    .first()
    .getByRole("button", { name: "Сохранить в избранное" })
    .click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /Избранное/ })
    .click();
  assert.equal(await page.locator(".reel-card").count(), 1);
  await page.locator(".card-title").first().click();
  await page.getByRole("heading", { name: "План съёмки" }).waitFor();
  await page
    .getByRole("button", { name: "Редактировать сценарий", exact: true })
    .click();
  await page
    .getByLabel("Название", { exact: true })
    .fill("Мой пудель — звезда");
  await page
    .getByRole("textbox", { name: "Подпись", exact: true })
    .fill("Наша собственная подпись");
  await page.getByRole("button", { name: "Сохранить мой сценарий" }).click();
  await page
    .getByRole("heading", { name: "Мой пудель — звезда", exact: true })
    .waitFor();
  await page.reload();
  await page
    .getByRole("heading", { name: "Мой пудель — звезда", exact: true })
    .waitFor();
  assert(
    await page
      .getByText("Наша собственная подпись", { exact: true })
      .isVisible(),
  );
  await page.screenshot({ path: "test-results/detail.png", fullPage: true });

  await page
    .getByRole("button", { name: "Добавить референс", exact: true })
    .click();
  await page
    .getByLabel("Ссылка на Instagram", { exact: true })
    .fill("https://example.org/reel/abc");
  await page
    .getByLabel("Название идеи", { exact: true })
    .fill("Новый зарубежный рилс");
  await page.getByRole("button", { name: "Добавить в студию" }).click();
  assert(await page.getByRole("alert").isVisible());
  await page
    .getByLabel("Ссылка на Instagram", { exact: true })
    .fill("https://www.instagram.com/reel/Test123/?igsh=tracking");
  await page.getByRole("button", { name: "Добавить в студию" }).click();
  const link = page.getByRole("link", { name: "Открыть в Instagram" });
  await link.waitFor();
  assert.equal(
    await link.getAttribute("href"),
    "https://www.instagram.com/reel/Test123/",
  );
  await page.reload();
  await page.getByRole("heading", { name: "Новый зарубежный рилс" }).waitFor();

  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Авторы и источники" })
    .click();
  await page
    .getByRole("button", { name: "В список наблюдения" })
    .first()
    .click();
  assert(
    await page
      .locator(".saved-sources")
      .getByText("@tikatheiggy", { exact: true })
      .isVisible(),
  );
  await page.reload();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Авторы и источники" })
    .click();
  assert(
    await page
      .locator(".saved-sources")
      .getByText("@tikatheiggy", { exact: true })
      .isVisible(),
  );
  await page
    .getByLabel("Instagram-аккаунт")
    .fill("https://www.instagram.com/new_author/");
  await page
    .getByRole("button", { name: "Добавить автора", exact: true })
    .click();
  assert(
    await page
      .locator(".saved-sources")
      .getByText("@new_author", { exact: true })
      .isVisible(),
  );
  await page.locator(".saved-sources").getByLabel("Удалить new_author").click();
  assert.equal(
    await page
      .locator(".saved-sources")
      .getByText("@new_author", { exact: true })
      .count(),
    0,
  );

  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Настройки блога" })
    .click();
  await page.getByLabel("Название студии или имя питомца").fill("Тедди");
  await page.getByRole("button", { name: "Сохранить настройки" }).click();
  assert(
    await page
      .locator(".workspace")
      .getByText("Тедди", { exact: true })
      .isVisible(),
  );
  await page.reload();
  assert(
    await page
      .locator(".workspace")
      .getByText("Тедди", { exact: true })
      .isVisible(),
  );

  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Поиск идей" })
    .click();
  await page.getByRole("button", { name: "Как устроен рейтинг" }).click();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    offline: process.env.APP_OFFLINE === "1",
  });
  mobile.on("pageerror", (error) => errors.push(error.message));
  await configurePortable(mobile);
  await mobile.goto(base);
  await mobile.locator(".reel-card").first().waitFor();
  for (const width of [360, 390, 768]) {
    await mobile.setViewportSize({ width, height: 844 });
    const row = mobile.locator(".reel-card").first();
    assert(
      await row
        .getByRole("link", { name: "Сценарий", exact: true })
        .isVisible(),
      `Scenario action is visible at ${width}px`,
    );
    assert(
      await row
        .getByRole("button", { name: "Сохранить в избранное" })
        .isVisible(),
      `Bookmark is visible at ${width}px`,
    );
    assert.equal(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
      false,
      `No horizontal overflow at ${width}px`,
    );
  }
  await mobile.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
    "Mobile must not overflow horizontally",
  );
  await mobile.screenshot({
    path: "test-results/mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await mobile.getByRole("button", { name: "Открыть меню" }).click();
  await mobile
    .locator(".sidebar")
    .getByRole("button", { name: /Избранное/ })
    .click();
  await mobile.getByRole("heading", { name: "Сохранено на потом" }).waitFor();
  assert.equal(await mobile.locator(".sidebar.is-open").count(), 0);
  await mobile.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: desktop/mobile rendering, image loading, search, filters, favorites, editor persistence, import validation, source management, settings and modal keyboard dismissal; no browser errors.",
  );
} finally {
  await browser.close();
}
