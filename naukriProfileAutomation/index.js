const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const NAUKRI_EMAIL = process.env.NAUKRI_EMAIL;
const NAUKRI_PASSWORD = process.env.NAUKRI_PASSWORD;
const RESUME_PATH = process.env.RESUME_PATH;




async function login(page) {
  // Navigate directly to the login page
  console.log("Step 1: Navigating to login page...");
  await page.goto("https://login.naukri.com/nLogin/Login.php", { timeout: 30000 });
  await page.waitForLoadState("domcontentloaded");
  try { await page.waitForLoadState("networkidle", { timeout: 10000 }); } catch {}

  // Fill username
  console.log("Step 2: Entering credentials...");
  await page.waitForSelector('input#usernameField', { state: "visible", timeout: 15000 });
  await page.click('input#usernameField');
  await page.fill('input#usernameField', NAUKRI_EMAIL);

  // Fill password
  await page.waitForSelector('input#passwordField', { state: "visible", timeout: 15000 });
  await page.click('input#passwordField');
  await page.fill('input#passwordField', NAUKRI_PASSWORD);

  // Click Login button
  console.log("Step 4: Submitting login...");
  await page.waitForSelector('button[type="submit"]', { state: "visible", timeout: 15000 });
  await page.click('button[type="submit"]');

  // Wait for login to complete
  await page.waitForTimeout(5000);
  console.log("Login successful!");
}

async function navigateToProfile(page) {
  // Navigate directly to the profile page (avoids drawer click/navigation timeout issues)
  console.log("Step 5: Navigating to profile page...");
  await page.goto("https://www.naukri.com/mnjuser/profile?id=&altresid", { timeout: 30000, waitUntil: "domcontentloaded" });
  try { await page.waitForLoadState("networkidle", { timeout: 10000 }); } catch {}
  await page.waitForTimeout(3000);
}

async function updateResume(page) {
  const resumePath = path.resolve(RESUME_PATH);

  if (!fs.existsSync(resumePath)) {
    console.error(`Resume file not found: ${resumePath}`);
    process.exit(1);
  }

  // Upload resume directly via the hidden file input — do NOT click the button
  // (clicking "Update resume" opens the OS file dialog which blocks Playwright)
  console.log(`Step 7: Uploading resume from: ${resumePath}`);
  await page.setInputFiles('input[type="file"]', resumePath);
  await page.waitForTimeout(5000);
  console.log("Resume uploaded successfully!");
}

(async () => {
  if (!NAUKRI_EMAIL || !NAUKRI_PASSWORD) {
    console.error("Set NAUKRI_EMAIL and NAUKRI_PASSWORD in your .env file.");
    process.exit(1);
  }

  if (!RESUME_PATH) {
    console.error("Set RESUME_PATH in your .env file.");
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: false,
    args: ["--window-size=1920,1080"],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    await login(page);
    await navigateToProfile(page);
    await updateResume(page);
    console.log("\nProfile updated successfully! Your profile will now appear as recently updated to recruiters.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();
