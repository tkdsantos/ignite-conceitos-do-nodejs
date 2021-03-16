const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: 'User not found',
      statusCode: 404
    })
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.some(user => user.username === username);

  if (user) {
    return response.status(400).json({
      error: 'User already exist',
      statusCode: 400
    })
  }

  const userCreate = {
    id: uuid(),
    name,
    username,
    todos: []
  }

  users.push(userCreate)

  response.status(201).json(userCreate);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found',
      statusCode: 404
    })
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  const todoUpdate = user.todos.find(todo => todo.id === id);

  response.json(todoUpdate);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found',
      statusCode: 404
    })
  }

  todo.done = true;

  const todoDone = user.todos.find(todo => todo.id === id);


  response.json(todoDone);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const indexTodo = user.todos.findIndex(todo => todo.id === id);

  if (indexTodo === -1) {
    return response.status(404).json({
      error: 'Todo not found',
      statusCode: 404
    })
  }

  user.todos.splice(indexTodo, 1);

  response.status(204).send();
});

module.exports = app;