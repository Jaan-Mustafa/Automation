const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// Opens a real browser so you can log in to Naukri manually (including any
// captcha), then saves the authenticated cookies to auth-state/state.json.
// Use that file with NAUKRI_STORAGE_STATE so update-resume-api.js can skip
// the login step.

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--window-size=1280,900"],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  console.log("Opening Naukri login page...");
  await page.goto("https://www.naukri.com/nlogin/login", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  console.log("Log in manually (solve any captcha). Waiting up to 5 minutes...");

  const deadline = Date.now() + 5 * 60 * 1000;
  let loggedIn = false;
  while (Date.now() < deadline) {
    const cookies = await context.cookies("https://www.naukri.com");
    if (cookies.some((c) => c.name === "nauk_at")) {
      loggedIn = true;
      break;
    }
    await page.waitForTimeout(2000);
  }

  if (!loggedIn) {
    console.error("Login not detected (nauk_at cookie missing). Nothing saved.");
    await browser.close();
    process.exit(1);
  }

  const dir = path.resolve("auth-state");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "state.json");
  await context.storageState({ path: file });

  console.log(`Saved session to ${file}`);
  await browser.close();
})();
