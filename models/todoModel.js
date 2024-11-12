const mongoose = require('mongoose')

const todoShema = new mongoose.Schema({
    todo : {
        type : String,
        required : true,
        trim : true,
        maxLength : 200,
        minLength : 5,
    },
    currentStatus : {
        type : String,
        default : "Not Done!",
    },
    userName : {
        type : String,
        required: true,
    },
    email:{
        type : String,
        required: true,
    }
},{
    timestamps: true,
})

const TodoModel = mongoose.model('Todo', todoShema);
module.exports = TodoModel