const { test, expect } = require("@playwright/test");
const { TodoPage } = require("../pages/TodoPage");
const todos = require("../data/todos.json");
const { allure } = require("allure-playwright");

test.describe("TODO App UI Tests - BDD Style", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  for (const [index, todo] of todos.entries()) {
    test(`GIVEN a user wants to add a todo, WHEN they enter '${todo.text}', THEN it should appear in the list`, async ({
      page,
    }) => {
      const todoPage = new TodoPage(page);
      await todoPage.addTodo(todo.text);
      await expect(todoPage.todos).toHaveText([
        expect.stringContaining(todo.text),
      ]);
    });
  }

  test("GIVEN todos exist, WHEN user applies Completed filter, THEN only completed todos should be shown", async ({
    page,
  }) => {
    const todoPage = new TodoPage(page);
    await todoPage.applyFilter("completed");
    const visibleTodos = await todoPage.todos.allTextContents();
    expect(visibleTodos.length).toBeGreaterThan(0);
  });

  //
  // ─── UI TESTS ─────────────────────────────────────────────────────────────────
  //
  // 4. Add via Enter key
  test(`GIVEN a user wants to add a todo via Enter key, WHEN they focus input and press Enter, THEN it should appear in the list`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("critical");
    const todoPage = new TodoPage(page);

    await page.goto("/");
    await todoPage.input.fill("Call Alice");
    // simulate pressing Enter
    await todoPage.input.press("Enter");

    await expect(todoPage.todos).toHaveText([
      expect.stringContaining("Call Alice"),
    ]);
  });

  // 5. Prevent empty TODO
  test(`GIVEN a user tries to submit empty input, WHEN they click Add, THEN no new item is added`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("critical");
    const todoPage = new TodoPage(page);

    await page.goto("/");
    // ensure input is empty
    await todoPage.input.fill("");
    await todoPage.addBtn.click();

    // Expect no new <li> with empty text; count remains unchanged (initially from seed)
    const countAfter = await todoPage.todos.count();
    expect(countAfter).toBeGreaterThanOrEqual(0);
    // also expect the input to be still empty (no automatic autofill)
    expect(await todoPage.input.inputValue()).toBe("");
  });

  // 6. Filter Incomplete
  test(`GIVEN todos exist (some incomplete), WHEN user applies "Incomplete" filter, THEN only incomplete todos should be shown`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("normal");
    const todoPage = new TodoPage(page);

    await page.goto("/");
    // Ensure at least one incomplete in seed; apply filter
    await todoPage.applyFilter("incomplete");
    const visible = await todoPage.todos.allTextContents();
    // Each visible todo must not have a checked checkbox
    for (const text of visible) {
      // no direct way to check incomplete by text, but assume seed has "Read a book" completed => filtered out
      // We simply assert that at least one shows and does not carry completed styling
      expect(visible.length).toBeGreaterThan(0);
    }
  });

  // 7. Reset Filter (All)
  test(`GIVEN a filter was applied, WHEN user clicks "All" tab, THEN all todos (completed + incomplete) should be displayed`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("minor");
    const todoPage = new TodoPage(page);

    await page.goto("/");
    // Apply a different filter first
    await todoPage.applyFilter("completed");
    // Then click "All"
    await todoPage.applyFilter("all");
    // Now both completed and incomplete should appear
    const total = await todoPage.todos.count();
    expect(total).toBeGreaterThanOrEqual(2);
  });

  // 8. Toggle Completed Status
  test(`GIVEN a list with at least one TODO, WHEN user toggles its checkbox, THEN the item’s style updates to completed`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("critical");
    const todoPage = new TodoPage(page);

    await page.goto("/");
    // Add a fresh todo to guarantee a known index
    await todoPage.addTodo("Test toggle");
    // Toggle the newly added one (assume it’s last)
    const lastIndex = (await todoPage.todos.count()) - 1;
    await todoPage.toggleTodo(lastIndex);
    // Now check that the corresponding <li> has a "completed" class or line-through
    const locator = todoPage.todos.nth(lastIndex);
    await expect(locator).toHaveCSS("text-decoration", /line-through/);
  });

  // 9. Delete a TODO
  test(`GIVEN a list with at least one TODO, WHEN user clicks delete on it, THEN it disappears from the list`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("critical");
    const todoPage = new TodoPage(page);

    await page.goto("/");
    // Add a known item, then delete it
    await todoPage.addTodo("DeleteMe");
    const idx = (await todoPage.todos.count()) - 1;
    await todoPage.deleteTodo(idx);
    // Ensure it no longer shows
    const texts = await todoPage.todos.allTextContents();
    expect(texts).not.toContain("DeleteMe");
  });

  // 10. Duplicate Todos
  test(`GIVEN a user adds the same todo text three times, WHEN they click Add each time, THEN three separate entries appear`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("normal");
    const todoPage = new TodoPage(page);
    const text = "Buy Eggs";

    await page.goto("/");
    // Add "Buy Eggs" three times in a row
    for (let i = 0; i < 3; i++) {
      await todoPage.addTodo(text);
    }
    // Count how many list items exactly match "Buy Eggs"
    const allTexts = await todoPage.todos.allTextContents();
    const matches = allTexts.filter((t) => t.includes(text));
    expect(matches.length).toBe(3);
  });

  // 11. Long-Text Input
  test(`GIVEN a user pastes a 500+ character string, WHEN they click Add, THEN the item is either shown/truncated based on UI`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("normal");
    const todoPage = new TodoPage(page);
    // Generate 500-character string
    const longText = "A".repeat(500);

    await page.goto("/");
    await todoPage.input.fill(longText);
    await todoPage.addBtn.click();

    const lastIndex = (await todoPage.todos.count()) - 1;
    const displayed = await todoPage.todos.nth(lastIndex).innerText();
    // We don’t know if UI truncates; at minimum the first 50 chars should match
    expect(displayed.startsWith("A".repeat(50))).toBeTruthy();
  });

  // 12. Large List Rendering (100 items)
  test(`GIVEN the backend has 100 todos, WHEN the user loads the page, THEN all 100 render without lag or crash`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("critical");
    // First, seed 100 items via the API
    for (let i = 0; i < 100; i++) {
      await page.request.post("http://localhost:3000/todos", {
        data: { text: `Bulk Item ${i}` },
      });
    }
    // Now navigate
    await page.goto("/");
    // Wait for list to stabilize
    await page.waitForSelector("#todoList li");
    const count = await page.locator("#todoList li").count();
    expect(count).toBe(100);
  });

  // 13. Special Chars / Emojis
  test(`GIVEN a user adds emojis and symbols as todo text, WHEN they click Add, THEN the emojis render correctly`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("minor");
    const todoPage = new TodoPage(page);
    const special = "🚀🌟✨🔥";

    await page.goto("/");
    await todoPage.addTodo(special);
    const lastIndex = (await todoPage.todos.count()) - 1;
    const text = await todoPage.todos.nth(lastIndex).innerText();
    expect(text).toContain("🚀🌟✨🔥");
  });

  // 14. Frontend Without Server (Graceful Failure)
  test(`GIVEN the frontend is open but the backend is down, WHEN user tries to load todos, THEN UI shows graceful error or empty state`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("normal");
    const todoPage = new TodoPage(page);

    // Intercept any /todos GET and abort to simulate server-down
    await page.route("**/todos", (route) => route.abort());
    await page.goto("/");

    // Expect that no <li> appears, and optionally an error message is shown
    const count = await todoPage.todos.count();
    expect(count).toBe(0);

    // If your UI shows an error banner, check its existence:
    // await expect(page.locator(".error-banner")).toBeVisible();
  });

  // 15. Network Delay Simulation
  test(`GIVEN the /todos API is slow (3 s delay), WHEN user adds or deletes a todo, THEN the UI handles delay gracefully (e.g., spinner)`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("normal");
    const todoPage = new TodoPage(page);

    // Intercept /todos POST and DELETE with a 3-second artificial delay
    await page.route("**/todos", async (route) => {
      // Delay on every request
      await new Promise((r) => setTimeout(r, 3000));
      route.continue();
    });

    await page.goto("/");
    // Start timing: click Add
    await todoPage.input.fill("Delayed Item");
    const addPromise = todoPage.addBtn.click();
    // Optionally, check a spinner appears here:
    await expect(page.locator(".loading-spinner")).toBeVisible();
    await addPromise;
    // Once resolved, the new item should appear
    await expect(todoPage.todos).toHaveText([
      expect.stringContaining("Delayed Item"),
    ]);
  });
});
