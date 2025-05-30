module.exports = {
  testDir: "./tests/specs",
  timeout: 30000,
  retries: 1,
  reporter: [["list"], ["allure-playwright"]],
  use: {
    baseURL: "http://127.0.0.1:5500/frontend/index.html",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
};
