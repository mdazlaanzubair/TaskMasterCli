// Backend for TODO App using Node.js, Express, and JSON file storage
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'todos.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load todos from file
function readTodos() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Save todos to file
function writeTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// GET all todos
app.get('/todos', (req, res) => {
  res.json(readTodos());
});

// POST a new todo
app.post('/todos', (req, res) => {
  const todos = readTodos();
  const newTodo = {
    id: Date.now().toString(),
    text: req.body.text,
    completed: false
  };
  todos.push(newTodo);
  writeTodos(todos);
  res.status(201).json(newTodo);
});

// PUT to update a todo (toggle completed)
app.put('/todos/:id', (req, res) => {
  const todos = readTodos();
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    todos[index].completed = req.body.completed;
    writeTodos(todos);
    res.json(todos[index]);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

// DELETE a todo
app.delete('/todos/:id', (req, res) => {
  let todos = readTodos();
  todos = todos.filter(t => t.id !== req.params.id);
  writeTodos(todos);
  res.status(204).end();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
