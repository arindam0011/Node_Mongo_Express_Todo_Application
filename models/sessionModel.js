const moongoose =require('mongoose');

const sessionSchima = new moongoose.Schema({
    _id :{
        type: String,
    }
},
{
    strict: false,
})

const sessionModel = moongoose.model('Session', sessionSchima);
module.exports = sessionModel;