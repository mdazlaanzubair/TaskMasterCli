const BASE_URL = 'http://localhost:3000';

// Frontend JavaScript for TODO app
const newTodoInput = document.getElementById('newTodo');
const addTodoBtn = document.getElementById('addTodo');
const todoList = document.getElementById('todoList');
const filterTabs = document.querySelectorAll('.filter-tab');

let todos = [];
let currentFilter = 'all';

function fetchTodos() {
  fetch(`${BASE_URL}/todos`)
    .then(res => res.json())
    .then(data => {
      todos = data;
      renderTodos();
    });
}

function renderTodos() {
  todoList.innerHTML = '';
  const filtered = todos.filter(todo => {
    if (currentFilter === 'completed') return todo.completed;
    if (currentFilter === 'incomplete') return !todo.completed;
    return true;
  });

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-white px-4 py-2 rounded shadow';

    const label = document.createElement('label');
    label.className = 'flex items-center space-x-2';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const span = document.createElement('span');
    span.textContent = todo.text;
    if (todo.completed) span.classList.add('line-through', 'text-gray-500');

    label.appendChild(checkbox);
    label.appendChild(span);

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.className = 'text-red-500';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(label);
    li.appendChild(delBtn);
    todoList.appendChild(li);
  });
}

function addTodo() {
  const text = newTodoInput.value.trim();
  if (!text) return;
  fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
    .then(() => {
      newTodoInput.value = '';
      fetchTodos();
    });
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !todo.completed })
  })
    .then(fetchTodos);
}

function deleteTodo(id) {
  fetch(`${BASE_URL}/todos/${id}`, { method: 'DELETE' })
    .then(fetchTodos);
}

addTodoBtn.addEventListener('click', addTodo);
newTodoInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTodo();
});

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('bg-blue-500', 'text-white'));
    tab.classList.add('bg-blue-500', 'text-white');
    currentFilter = tab.dataset.filter;
    renderTodos();
  });
});

fetchTodos();
