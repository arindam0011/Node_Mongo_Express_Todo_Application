const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const cors = require('cors');
const userRouter = require("./routes/user.route.js");
const todoRouter = require("./routes/todo.route.js");


const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: "sessions",
});

// middleware
app.use(express.json());


app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: false,
    saveUninitialized: false,
}))

app.use(express.static("public"));

app.use(cors({
    origin: 'https://node-mongo-express-todo-application.onrender.com', 
    // origin: 'http://localhost:8000',
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  }));


app.use("/user", userRouter);
app.use("/todo", todoRouter);
// database connection

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error);
    });


// constants

app.set("view engine", "ejs");
const Port = process.env.PORT || 8000;

app.get("/", (req, res) => {
    res.redirect("/user/login");
})




app.listen(Port,  '0.0.0.0', () => {
    console.log(`Server is running at port http://localhost:${Port}`);
})