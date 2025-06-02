const { test, expect, request } = require("@playwright/test");
const { allure } = require("allure-playwright");

const API_URL = "http://localhost:3000";

test.describe("TODO API Tests", () => {
  test("GET /todos should return 200 and an array", async ({ request }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("critical");
    const res = await request.get(`${API_URL}/todos`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test("POST /todos should create a new todo", async ({ request }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("critical");
    const res = await request.post(`${API_URL}/todos`, {
      data: { text: "New API Todo" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.text).toBe("New API Todo");
  });

  // 3. POST empty text => 400
  test("GIVEN empty text, WHEN POST /todos with { text: '' }, THEN respond 400 Bad Request", async ({
    request,
  }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("normal");
    const res = await request.post(`${API_URL}/todos`, {
      data: { text: "" },
    });
    expect([400, 422]).toContain(res.status());
  });

  // 4. GET includes newly created
  test("GIVEN a newly created todo via API, WHEN GET /todos, THEN the newly created item appears in array", async ({
    request,
  }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("critical");
    // Create a fresh todo
    const postRes = await request.post(`${API_URL}/todos`, {
      data: { text: "API Inclusion Test" },
    });
    expect(postRes.status()).toBe(201);
    const body = await postRes.json();
    const newId = body.id;

    // Now GET /todos
    const getRes = await request.get(`${API_URL}/todos`);
    expect(getRes.status()).toBe(200);
    const todos = await getRes.json();
    const found = todos.find((t) => t.id === newId);
    expect(found).toBeTruthy();
    expect(found.text).toBe("API Inclusion Test");
  });

  // 5. PUT valid toggle => 200
  test("GIVEN an existing todo, WHEN PUT /todos/:id with { completed: true }, THEN respond 200 and updated todo", async ({
    request,
  }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("critical");
    // First create
    const post = await request.post(`${API_URL}/todos`, {
      data: { text: "Toggle via API" },
    });
    const created = await post.json();
    const id = created.id;

    // Now toggle
    const putRes = await request.put(`${API_URL}/todos/${id}`, {
      data: { completed: true },
    });
    expect(putRes.status()).toBe(200);
    const updated = await putRes.json();
    expect(updated.completed).toBe(true);
  });

  // 6. PUT invalid ID => 404
  test("GIVEN a non-existent ID, WHEN PUT /todos/invalid, THEN respond 404 Not Found", async ({
    request,
  }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("normal");
    const putRes = await request.put(`${API_URL}/todos/invalid-id`, {
      data: { completed: false },
    });
    expect(putRes.status()).toBe(404);
  });

  // 7. DELETE valid => 204
  test("GIVEN an existing todo ID, WHEN DELETE /todos/:id, THEN respond 204 No Content", async ({
    request,
  }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("critical");
    // Create a todo to delete
    const post = await request.post(`${API_URL}/todos`, {
      data: { text: "To Be Deleted" },
    });
    const id = (await post.json()).id;

    const delRes = await request.delete(`${API_URL}/todos/${id}`);
    expect(delRes.status()).toBe(204);

    // Confirm GET /todos no longer returns it
    const getRes = await request.get(`${API_URL}/todos`);
    const all = await getRes.json();
    expect(all.find((t) => t.id === id)).toBeUndefined();
  });

  // 8. DELETE invalid ID => 404 (or 204)
  test("GIVEN a non-existent todo ID, WHEN DELETE /todos/fake-id, THEN respond 404 or 204", async ({
    request,
  }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("normal");
    const delRes = await request.delete(`${API_URL}/todos/fake-id`);
    expect([204, 404]).toContain(delRes.status());
  });

  // 9. XSS/HTML Injection Saved as Plain Text
  test("GIVEN a <script> payload, WHEN POST /todos with { text: '<script>alert(1)</script>' }, THEN GET /todos should show it as plain text", async ({
    request,
  }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("critical");
    const payload = "<script>alert('XSS')</script>";
    const postRes = await request.post(`${API_URL}/todos`, {
      data: { text: payload },
    });
    expect(postRes.status()).toBe(201);

    const getRes = await request.get(`${API_URL}/todos`);
    const all = await getRes.json();
    const found = all.find((t) => t.text === payload);
    expect(found).toBeTruthy();
    // The frontend must render as text, not execute. This test only ensures backend saved it verbatim.
  });

  // 10. Malformed JSON => 400
  test("GIVEN malformed JSON body, WHEN POST /todos with invalid JSON, THEN respond 400 Bad Request", async ({
    request,
  }) => {
    allure.label({ name: "feature", value: "API" });
    allure.severity("normal");
    // Directly use fetch on invalid JSON (Playwright’s request requires well-formed data, so use fetch-like)
    const rawFetch = await request.fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // missing closing quote on text
      postData: `{ "text": "Unclosed string }`,
    });
    expect(rawFetch.status()).toBe(400);
  });
});
