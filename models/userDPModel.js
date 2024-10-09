const moongoose = require('mongoose');

const userDPSchema = new moongoose.Schema({
    username: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: false
    }
})

const userDPModel = moongoose.models.UserDP || moongoose.model('UserDP', userDPSchema);

module.exports = userDPModel;