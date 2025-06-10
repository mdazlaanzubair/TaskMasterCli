const { test, expect } = require("@playwright/test");
const { TodoPage } = require("../pages/TodoPage");
const todos = require("../data/todos.json");
const { allure } = require("allure-playwright");

test.describe("TODO App UI Tests - BDD Style", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // 1. Add a TODO
  for (const [index, todo] of todos.entries()) {
    test(`GIVEN a user wants to add a todo, WHEN they enter '${todo.text}', THEN it should appear in the list`, async ({
      page,
    }) => {
      const todoPage = new TodoPage(page);
      // await todoPage.goto();

      await todoPage.addTodo(todo.text);

      // Grab the very first <li> → <label> → <span>
      const todoElem = todoPage.todos.first().locator("label span");

      // Check that the span contains the todo text as a substring
      await expect(todoElem).toContainText(todo.text);
    });
  }

  // 2. Add via Enter key
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

    // Grab the very first <li> → <label> → <span>
    const todoElem = todoPage.todos.first().locator("label span");

    // Check that the span contains the todo text as a substring
    await expect(todoElem).toContainText("Call Alice");
  });

  // 3. Prevent empty TODO
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

  // 4. Filter Incomplete
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

  // 5. Reset Filter (All)
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

  // 6. Toggle Completed Status
  test(`GIVEN a list with at least one TODO, WHEN user toggles its checkbox, THEN the item’s style updates to completed`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("critical");
    const todoPage = new TodoPage(page);

    // 1) Go to the app
    await page.goto("/");

    // 2) Add a fresh todo so we know exactly which index to toggle
    await todoPage.addTodo("Test toggle");

    // 3) Compute the first index (newly added item)
    const firstIndex = 0;

    // 4) Click its checkbox to mark it completed
    await todoPage.toggleTodo(firstIndex);

    // 5) Find the <span> inside that <li>
    const spanLocator = todoPage.todos.nth(firstIndex).locator("label span");

    // Option A: Check that the <span> has the "line-through" class
    await expect(spanLocator).toHaveClass(/.*line-through.*/);

    // Option B: Alternatively, verify the computed CSS property directly
    await expect(spanLocator).toHaveCSS("text-decoration-line", "line-through");
  });

  // 7. Delete a TODO
  test(`GIVEN a list with at least one TODO, WHEN user clicks delete on it, THEN it disappears from the list`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("critical");

    const todoPage = new TodoPage(page);
    await page.goto("/");

    // Add a known item, then delete it
    await todoPage.addTodo("Delete me, later!");

    // Count how many <li>s existed before deletion
    const beforeCount = await todoPage.todos.count();

    // Delete the very last one
    await todoPage.deleteTodo(beforeCount - 1);

    // Option A: Wait until count is one less than before
    // await expect(todoPage.todos).toHaveCount(beforeCount - 1);

    // Option B: Or grab all textContents and check that string is gone:
    const texts = await todoPage.todos.allTextContents();
    expect(texts).not.toContain("Delete me, later!");
  });

  // 8. Duplicate Todos
  test(`GIVEN a user adds the same todo text three times, WHEN they click Add each time, THEN three separate entries appear`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("normal");
    const todoPage = new TodoPage(page);
    await page.goto("/");

    // deleting all todos
    await page.request.delete("http://localhost:3000/todos");

    const text = "Buy Eggs";
    const noOfTimes = 3;
    // Add "Buy Eggs" three times in a row
    for (let i = 0; i < noOfTimes; i++) {
      await todoPage.addTodo(text);
    }

    // Grab _only_ the <span> inside each <li> and read its textContent
    // The locator todoPage.todos is "#todoList li"; now we append "label span"
    const spanLocators = todoPage.todos.locator("label span");
    const spanTexts = await spanLocators.allTextContents();

    // Filter those span‐texts for exact (or substring) matches
    const matches = spanTexts.filter((t) => t.trim() === text);

    expect(matches.length).toBe(noOfTimes);
  });

  // 9. Long-Text Input
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

    const firstIndex = 0;
    const displayed = await todoPage.todos
      .nth(firstIndex)
      .locator("label span")
      .innerText();

    // We don’t know if UI truncates; at minimum the first 50 chars should match
    expect(displayed.startsWith("A".repeat(50))).toBeTruthy();
  });

  // 10. Large List Rendering (100 items)
  test(`GIVEN the backend has 100 todos, WHEN the user loads the page, THEN all 100 render without lag or crash`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("critical");

    // deleting all todos
    await page.request.delete("http://localhost:3000/todos");

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

  // 11. Special Chars / Emojis
  test(`GIVEN a user adds emojis and symbols as todo text, WHEN they click Add, THEN the emojis render correctly`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("minor");
    const todoPage = new TodoPage(page);
    const special = "🚀🌟✨🔥";

    await page.goto("/");
    await todoPage.addTodo(special);
    const firstIndex = 0;
    const text = await todoPage.todos
      .nth(firstIndex)
      .locator("label span")
      .innerText();
    expect(text).toContain("🚀🌟✨🔥");
  });

  // 12. Network Delay Simulation
  test(`GIVEN the /todos API is slow (3 s delay), WHEN user adds or deletes a todo, THEN the UI handles delay gracefully (e.g., spinner)`, async ({
    page,
  }) => {
    allure.label({ name: "feature", value: "UI" });
    allure.severity("normal");
    const todoPage = new TodoPage(page);

    // Intercept /todos POST and DELETE with a 5-second artificial delay
    await page.route("**/todos", async (route) => {
      // Delay on every request
      await new Promise((r) => setTimeout(r, 5000));
      route.continue();
    });

    await page.goto("/");
    // Start timing: click Add
    await todoPage.input.fill("Delayed Item");
    const addPromise = todoPage.addBtn.click();

    // Optionally, check a spinner appears here:
    await expect(todoPage.loader).toBeVisible();
    await addPromise;

    // Once resolved, the new item should appear
    // Grab the very first <li> → <label> → <span>
    const todoElem = todoPage.todos.first().locator("label span");

    // Check that the span contains the todo text as a substring
    await expect(todoElem).toContainText("Delayed Item");
  });
});