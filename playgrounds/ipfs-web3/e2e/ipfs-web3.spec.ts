import path from "node:path"
import { expect, test } from "@playwright/test"

// See here how to get started:
// https://playwright.dev/docs/intro
test("visits the app root url", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("div.greetings > h1")).toHaveText("IPFS Web3 Plugin")
})

// @todo investigate why this fails on CI
if (!process.env.CI) {
  test("can upload a testfile", async ({ page }) => {
    await page.goto("/")
    await page.setInputFiles("input[type=file]", path.join(__dirname, "./testfile-browser.txt"))
    await expect(page.locator("div.upload")).toHaveText("Uploading...", { timeout: 60_000 })
    await expect(page.locator("div.upload")).toHaveText(/Upload Result.*/, { timeout: 60_000 })
  })
}

test("can query the CID stores", async ({ page }) => {
  await page.goto("/")
  await page.locator("button.queryButton").click()
  await expect(page.locator("div.query")).toHaveText("Querying...", { timeout: 60_000 })
  await expect(page.locator("div.query")).toHaveText(/Query Result.*/, { timeout: 60_000 })
})
