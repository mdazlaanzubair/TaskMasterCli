const { test, expect, request } = require("@playwright/test");

const API_URL = "http://localhost:3000";

test.describe("TODO API Tests", () => {
  test("GET /todos should return 200 and an array", async ({ request }) => {
    const res = await request.get(`${API_URL}/todos`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("POST /todos should create a new todo", async ({ request }) => {
    const res = await request.post(`${API_URL}/todos`, {
      data: { text: "New API Todo" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.text).toBe("New API Todo");
  });
});
