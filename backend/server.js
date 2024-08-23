const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let todos = [
  { id: 1, text: 'Learn Node.js' },
  { id: 2, text: 'Learn React.js' },
];

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Add a new todo
app.post('/api/todos', (req, res) => {
  const newTodo = {
    id: todos.length + 1,
    text: req.body.text,
  };
  todos.push(newTodo);
  res.json(newTodo);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
