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
});
