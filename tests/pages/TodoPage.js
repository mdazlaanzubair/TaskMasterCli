const { expect } = require('@playwright/test');

exports.TodoPage = class TodoPage {
  constructor(page) {
    this.page = page;
    this.input = page.locator('#newTodo');
    this.addBtn = page.locator('#addTodo');
    this.todos = page.locator('#todoList li');
    this.filter = page.locator('.filter-tab');
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTodo(text) {
    await this.input.fill(text);
    await this.addBtn.click();
  }

  async toggleTodo(index) {
    await this.todos.nth(index).locator('input[type="checkbox"]').click();
  }

  async deleteTodo(index) {
    await this.todos.nth(index).locator('button').click();
  }

  async applyFilter(filterType) {
    await this.filter.locator(`[data-filter="${filterType}"]`).click();
  }
};