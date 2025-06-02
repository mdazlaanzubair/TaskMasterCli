// Make sure to import anything you need:
const { test, expect } = require("@playwright/test");
const { allure } = require("allure-playwright");

// 1. Performance: Measure load time under 2s
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

// 2. GET /todos latency < 500ms
test("Performance: GET /todos latency should be under 500ms", async ({ request }) => {
  allure.label({ name: "feature", value: "Performance" });
  allure.severity("critical");
  const start = Date.now();
  const res = await request.get("http://localhost:3000/todos");
  const duration = Date.now() - start;
  expect(res.status()).toBe(200);
  expect(duration).toBeLessThan(500);
});

// 3. POST /todos latency < 300ms
test("Performance: POST /todos latency should be under 300ms", async ({ request }) => {
  allure.label({ name: "feature", value: "Performance" });
  allure.severity("normal");
  const start = Date.now();
  const res = await request.post("http://localhost:3000/todos", {
    data: { text: "Latency Test" },
  });
  const duration = Date.now() - start;
  expect(res.status()).toBe(201);
  expect(duration).toBeLessThan(300);
});

// 4. 50 parallel POST /todos
test("Concurrency: Simulate 50 parallel POST /todos calls without data corruption", async ({ request }) => {
  allure.label({ name: "feature", value: "Concurrency" });
  allure.severity("critical");
  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(
      request.post("http://localhost:3000/todos", {
        data: { text: `Concurrent Item ${i}` },
      })
    );
  }
  const results = await Promise.all(promises);
  for (const r of results) {
    expect(r.status()).toBe(201);
  }
  // Finally, GET and ensure at least 50 of those new items exist
  const getAll = await request.get("http://localhost:3000/todos");
  const allTodos = await getAll.json();
  const matches = allTodos.filter((t) =>
    t.text.startsWith("Concurrent Item")
  );
  expect(matches.length).toBe(50);
});

// 5. 100 simultaneous GET/POST loops
test("Concurrency: Interleave 100 GET and POST /todos calls without race errors", async ({ request }) => {
  allure.label({ name: "feature", value: "Concurrency" });
  allure.severity("critical");
  const tasks = [];
  for (let i = 0; i < 100; i++) {
    tasks.push(
      request.get("http://localhost:3000/todos"),
      request.post("http://localhost:3000/todos", {
        data: { text: `Mix ${i}` },
      })
    );
  }
  // Flattened array: 200 total Promises
  const flat = [];
  tasks.forEach((pair) => flat.push(pair));
  const results = await Promise.all(flat);
  // Ensure no GET fails
  for (const res of results) {
    expect([200, 201]).toContain(res.status());
  }
});