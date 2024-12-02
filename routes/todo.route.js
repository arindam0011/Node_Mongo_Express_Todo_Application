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


// Create Todo
todoRouter.post('/create-todo', isUserAuth, createTodo); // post:: /todo/create-todo

// Get Todo
todoRouter.get('/get-todo', isUserAuth, getTodo); // get:: /todo/get-todo

// Update Todo
todoRouter.post('/edit-todo', isUserAuth, updateTodo) // post:: /todo/edit-todo

// Delete Todo
todoRouter.post('/delete-todo', isUserAuth, deleteTodo) // post:: /todo/delete-todo

// todo count
todoRouter.get('/total-todo-count', isUserAuth, todoCount) // get:: /todo/total-todo-count





module.exports = todoRouter;