
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({ // alwayes use 'new' keyword in mongoose when creating schema
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isEmailVerify: {
        type: Boolean,
        default: false
    }
})

const UserModel = mongoose.models.User || mongoose.model('TodoUser', userSchema);
module.exports = UserModel