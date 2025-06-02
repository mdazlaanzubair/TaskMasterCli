// Make sure to import anything you need:
const { test, expect } = require("@playwright/test");

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

//
// ─── PERFORMANCE & CONCURRENCY TESTS ─────────────────────────────────────────────────
//

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

// 6. Persistence after “server restart” (simulated)
test("Persistence: Data should persist after renaming todos.json and restoring", async () => {
  allure.label({ name: "feature", value: "Persistence" });
  allure.severity("critical");

  // Step 1: Create a known todo
  const fs = require("fs");
  const path = require("path");
  const { chromium } = require("@playwright/test");
  const backendFile = path.resolve(__dirname, "../todos.json"); // adjust if todos.json lives elsewhere

  // Add a test‐item via direct HTTP
  const req = await chromium.launch().then((browser) => browser.newContext());
  const requestContext = await req.request.newContext();
  const postRes = await requestContext.post("http://localhost:3000/todos", {
    data: { text: "PersistTestItem" },
  });
  expect(postRes.status()).toBe(201);

  // Confirm it’s in todos.json on disk
  let raw = fs.readFileSync(backendFile, "utf-8");
  expect(raw).toContain("PersistTestItem");

  // Step 2: Simulate “restart” by renaming the file (so server starts with empty state)
  const backup = backendFile + ".bak";
  fs.renameSync(backendFile, backup);

  // Now “restart” server manually: wait 1 s, then rename back
  await new Promise((r) => setTimeout(r, 1000));
  fs.renameSync(backup, backendFile);

  // Step 3: Now GET /todos again
  const getRes = await requestContext.get("http://localhost:3000/todos");
  const todosList = await getRes.json();
  const found = todosList.find((t) => t.text === "PersistTestItem");
  expect(found).toBeTruthy();

  await requestContext.dispose();
  await req.close();
});

// 7. Handle missing/corrupt JSON file (empty state)
test("Persistence: If todos.json is missing or corrupt, server initializes empty state gracefully", async () => {
  allure.label({ name: "feature", value: "Persistence" });
  allure.severity("critical");

  const fs = require("fs");
  const path = require("path");
  const backendFile = path.resolve(__dirname, "../todos.json"); // adjust if path is different
  const backup = backendFile + ".corruptbak";

  // Simulate corruption: rename original, create an empty/corrupt file
  if (fs.existsSync(backendFile)) {
    fs.renameSync(backendFile, backup);
  }
  // Create a corrupt JSON (e.g., just a bracket)
  fs.writeFileSync(backendFile, "{ invalid JSON ", "utf-8");

  // Now attempt GET /todos: server should either recreate valid JSON or return [] 
  const { chromium } = require("@playwright/test");
  const reqCtx = await chromium.launch().then((b) => b.newContext());
  const requestContext = await reqCtx.request.newContext();
  const getRes = await requestContext.get("http://localhost:3000/todos");

  // Expect 200 with an empty array (no unhandled crash)
  expect(getRes.status()).toBe(200);
  const todosList = await getRes.json();
  expect(Array.isArray(todosList)).toBeTruthy();
  expect(todosList.length).toBe(0);

  // Cleanup: restore original file
  fs.unlinkSync(backendFile);
  if (fs.existsSync(backup)) {
    fs.renameSync(backup, backendFile);
  }
  await requestContext.dispose();
  await reqCtx.close();
});
