module.exports = {
  testDir: "./tests/specs",
  timeout: 30000,
  retries: 1,
  reporter: [["list"], ["allure-playwright"]],
  use: {
    baseURL: "http://192.168.0.100:8080",
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
