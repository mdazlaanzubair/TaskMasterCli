# Test info

- Name: TODO App UI Tests - BDD Style >> GIVEN a user wants to add a todo, WHEN they enter 'Read a book', THEN it should appear in the list
- Location: /Users/home/Repositories/Personal Space/TaskMasterCli/tests/specs/todo-ui.spec.js:13:5

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#newTodo')

    at TodoPage.addTodo (/Users/home/Repositories/Personal Space/TaskMasterCli/tests/pages/TodoPage.js:17:22)
    at /Users/home/Repositories/Personal Space/TaskMasterCli/tests/specs/todo-ui.spec.js:17:22
```

# Page snapshot

```yaml
- textbox "Search"
- heading "~ /" [level=1]:
  - link "~":
    - /url: /
  - text: /
- list:
  - listitem:
    - link "allure-results 5/30/2025 11:18:45 PM":
      - /url: /allure-results
  - listitem:
    - link "backend 5/30/2025 10:58:45 PM":
      - /url: /backend
  - listitem:
    - link "frontend 5/30/2025 10:52:35 PM":
      - /url: /frontend
  - listitem:
    - link "node_modules 5/30/2025 11:03:52 PM":
      - /url: /node_modules
  - listitem:
    - link "test-results 5/30/2025 11:18:46 PM":
      - /url: /test-results
  - listitem:
    - link "tests 5/30/2025 10:57:50 PM":
      - /url: /tests
  - listitem:
    - link "package-lock.json 33968 5/30/2025 11:03:52 PM":
      - /url: /package-lock.json
  - listitem:
    - link "package.json 579 5/30/2025 11:03:52 PM":
      - /url: /package.json
  - listitem:
    - link "playwright.config.js 384 5/30/2025 11:04:22 PM":
      - /url: /playwright.config.js
  - listitem:
    - link "README.md 546 5/30/2025 10:23:09 PM":
      - /url: /README.md
  - listitem:
    - link "run-tests.sh 566 5/30/2025 11:16:37 PM":
      - /url: /run-tests.sh
```

# Test source

```ts
   1 | const { expect } = require('@playwright/test');
   2 |
   3 | exports.TodoPage = class TodoPage {
   4 |   constructor(page) {
   5 |     this.page = page;
   6 |     this.input = page.locator('#newTodo');
   7 |     this.addBtn = page.locator('#addTodo');
   8 |     this.todos = page.locator('#todoList li');
   9 |     this.filter = page.locator('.filter-tab');
  10 |   }
  11 |
  12 |   async goto() {
  13 |     await this.page.goto('/');
  14 |   }
  15 |
  16 |   async addTodo(text) {
> 17 |     await this.input.fill(text);
     |                      ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  18 |     await this.addBtn.click();
  19 |   }
  20 |
  21 |   async toggleTodo(index) {
  22 |     await this.todos.nth(index).locator('input[type="checkbox"]').click();
  23 |   }
  24 |
  25 |   async deleteTodo(index) {
  26 |     await this.todos.nth(index).locator('button').click();
  27 |   }
  28 |
  29 |   async applyFilter(filterType) {
  30 |     await this.filter.locator(`[data-filter="${filterType}"]`).click();
  31 |   }
  32 | };
```