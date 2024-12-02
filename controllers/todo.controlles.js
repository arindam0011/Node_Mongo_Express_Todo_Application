require("dotenv").config();
const todoModel = require("../models/todoModel.js");
const { todoValidation } = require("../utill/todoValidation.js");

const createTodo = async (req, res) => {
    const username = req.session.user.username;
    const email = req.session.user.email;
    console.log("from create todo", req.body);
    const { newTodo } = req.body;
    const todo = req.body.newTodo;

    try {
        await todoValidation({ todo: newTodo });

    } catch (err) {
        return res.send({
            status: 400,
            message: err,
        });
    }

    try {
        let todoObj = new todoModel({
            todo: todo,
            userName: username,
            email: email
        })

        const todoDB = await todoObj.save();

        return res.send({
            status: 201,
            message: "Todo Created",
            data: todoDB
        })

    } catch (error) {
        res.send({
            status: 500,
            message: 'Iternal Server Error',
            error: error
        })
    }
}

const getTodo = async (req, res) => {
    const email = req.session.user.email;
    const SKIP = Number(req.query.skip) || 0;
    const Limit = 6;

    try {
        //1) const todolist = await todoModel.find({ userName: username });
        //2) const todolist = await todoModel.aggregate([
        //     {$match : { userName: username }},
        //     {$skip: SKIP},
        //     {$limit: Limit}
        // ])
        //3)(most resent first using non aggregation) 
        // const todolist = await todoModel.find({ userName: username }).sort({ createdAt: -1 }).limit(Limit).skip(SKIP);   

        //4) (most resent first using aggregation) 
        const todolist = await todoModel.aggregate([
            { $match: { email: email } },
            { $sort: { createdAt: -1 } },
            { $skip: SKIP },
            { $limit: Limit },
        ])

        if (!todolist || todolist.length === 0) {
            return res.send({
                status: 204,
                message: "No Todo Found",
                data: todolist
            })
        }
        return res.send({
            status: 200,
            message: "Todo List Found",
            data: todolist,
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: 'Iternal Server Error',
            error: error
        })
    }
}

const updateTodo = async (req, res) => {
    const todoId = req.body.todoId;
    const newTodo = req.body.newTodo;
    const todoStatusValue = req.body.todoStatusValue;
    const email = req.session.user.email;

    try {
        await todoValidation({ todo: newTodo });
    } catch (error) {
        res.send({
            status: 400,
            message: error,
        })
    }
    try {
        // Ownership check 
        const userCheckDB = await todoModel.findOne({ _id: todoId });
        if (userCheckDB.email !== email) {
            return res.send({
                status: 403,
                message: "You are not allowed to update this todo",
            })
        }

        // Update
        let todoDB = await todoModel.findOneAndUpdate({ _id: todoId }, { todo: newTodo, currentStatus: todoStatusValue }, { new: true });
        return res.send({
            status: 200,
            message: "Todo Updated",
            data: todoDB
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: 'Iternal Server Error',
            error: error
        })
    }
}

const deleteTodo = async (req, res) => {
    const todoId = req.body.todoId;
    const email = req.session.user.email;
    try {
        // Ownership check 
        const userCheckDB = await todoModel.findOne({ _id: todoId });
        if (userCheckDB.email !== email) {
            return res.send({
                status: 403,
                message: "You are not allowed to delete this todo",
            })
        }


        // Delete
        const todoDB = await todoModel.findByIdAndDelete({ _id: todoId });
        return res.send({
            status: 200,
            message: "Todo Deleted",
        })

    } catch (error) {
        return res.send({
            status: 500,
            message: 'Iternal Server Error',
            error: error
        })
    }
}

const todoCount = async (req, res) => {
    const email = req.session.user.email;
    try {
        const todolist = await todoModel.find({ email: email });
        if (todolist.length === 0 || !todolist) {
            return res.send({
                status: 204,
                message: "Hven't Any Todo yet!",
            })
        }
        return res.send({
            status: 200,
            message: "Todo List Found",
            count: todolist.length,
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: 'Iternal Server Error',
            error: error
        })
    }
}



module.exports = {
    createTodo,
    getTodo,
    updateTodo,
    deleteTodo,
    todoCount
}