const BASE_URL = "http://localhost:3000";

// Frontend JavaScript for TODO app
const newTodoInput = document.getElementById("newTodo");
const addTodoBtn = document.getElementById("addTodo");
const todoList = document.getElementById("todoList");
const filterTabs = document.querySelectorAll(".filter-tab");

let todos = [];
let currentFilter = "all";

function fetchTodos() {
  showLoader(true);

  fetch(`${BASE_URL}/todos`)
    .then((res) => res.json())
    .then((data) => {
      todos = data;
      renderTodos();
    })
    .catch((err) => {
      console.error("Error fetching todos:", err);
    })
    .finally(() => {
      showLoader(false);
    });
}

function renderTodos() {
  todoList.innerHTML = "";
  const filtered = todos.filter((todo) => {
    if (currentFilter === "completed") return todo.completed;
    if (currentFilter === "incomplete") return !todo.completed;
    return true;
  });

  filtered.reverse().forEach((todo) => {
    const li = document.createElement("li");
    li.className =
      "flex items-start justify-between bg-white px-4 py-2 rounded shadow";

    const label = document.createElement("label");
    label.className = "flex items-start space-x-2";

    const checkbox = document.createElement("input");
    checkbox.className = "mt-[6px]";
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const span = document.createElement("span");
    span.style.whiteSpace = "normal";
    span.style.wordBreak = "break-word"; // Wrap long words
    span.style.overflowWrap = "break-word"; // Fallback
    span.textContent = todo.text;
    if (todo.completed) span.classList.add("line-through", "text-gray-500");

    label.appendChild(checkbox);
    label.appendChild(span);

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.className = "inline-block text-red-500 cursor-pointer";
    delBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(label);
    li.appendChild(delBtn);
    todoList.appendChild(li);
  });
}

function addTodo() {
  const text = newTodoInput.value.trim();
  if (!text) return;
  showLoader(true);
  fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
    .then(async (res) => {
      // Make this callback async
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const newTodo = await res.json(); // Await the resolution of res.json()
      todos.push(newTodo);
      renderTodos();
      newTodoInput.value = "";
    })
    .catch((err) => {
      console.error("Error adding todo:", err);
    })
    .finally(() => {
      showLoader(false);
    });
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  showLoader(true);
  fetch(`${BASE_URL}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !todo.completed }),
  })
    .then(fetchTodos)
    .catch((err) => {
      console.error("Error toggling todo:", err);
    })
    .finally(() => {
      showLoader(false);
    });
}

function deleteTodo(id) {
  showLoader(true);

  fetch(`${BASE_URL}/todos/${id}`, { method: "DELETE" })
    .then(fetchTodos)
    .catch((err) => {
      console.error("Error deleting todo:", err);
    })
    .finally(() => {
      showLoader(false);
    });
}

addTodoBtn.addEventListener("click", addTodo);
newTodoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTodo();
});

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    showLoader(true);
    filterTabs.forEach((t) => t.classList.remove("bg-blue-500", "text-white"));
    tab.classList.add("bg-blue-500", "text-white");
    currentFilter = tab.dataset.filter;
    renderTodos();
    showLoader(false);
  });
});

fetchTodos();

// function to show loader
function showLoader(status = true) {
  if (status) {
    document.getElementById("loader").classList.remove("hidden");
    return;
  }
  document.getElementById("loader").classList.add("hidden");
}
