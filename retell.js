import { chromium } from "playwright";

const run = async () => {
  const userDataDir = "./chrome-session";
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    viewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.goto("https://dashboard.retellai.com");
  await page.waitForURL("**/agents", { timeout: 0 });

  await page.getByText("Test Agent", { exact: true }).click();
  await page.waitForTimeout(1000);

  const nodeTitle = "Test Node";

  const titleLocator = page.locator(`text=${nodeTitle}`).first();
  const nodeContainer = titleLocator.locator(
    'xpath=ancestor::div[contains(@class,"react-flow__node")]'
  );

  const textarea = nodeContainer.locator("textarea:not([placeholder])").first();
  await textarea.waitFor({ state: "visible", timeout: 5000 });

  await textarea.fill("nuevo texto del menú");

  await page.getByRole("button", { name: "Save" }).click();
  console.log("Menú actualizado correctamente");

  await browser.close();
};

run();
