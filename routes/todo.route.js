const express = require("express");
const todoRouter = express.Router();
const { isUserAuth } = require("../middlewares/isAuthMiddleware.js");
const { 
    createTodo,
    getTodo,
    updateTodo,
    deleteTodo,
    todoCount
} = require("../controllers/todo.controlles.js");



todoRouter.post('/create-todo', isUserAuth, createTodo);

// Get Todo
todoRouter.get('/get-todo', isUserAuth, getTodo);

// Update Todo
todoRouter.post('/edit-todo', isUserAuth, updateTodo)

// Delete Todo
todoRouter.post('/delete-todo', isUserAuth, deleteTodo)

todoRouter.get('/total-todo-count', isUserAuth, todoCount)





module.exports = todoRouter;