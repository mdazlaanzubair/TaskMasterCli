const { test } = require("@playwright/test");

test("Performance: Measure load time under 2s", async ({ page }) => {
  const start = Date.now();
  await page.goto("/");
  const duration = Date.now() - start;
  test
    .info()
    .annotations.push({
      type: "performance",
      description: `Page loaded in ${duration}ms`,
    });
  expect(duration).toBeLessThan(2000);
});
