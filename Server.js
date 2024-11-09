const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid')
const jwt = require("jsonwebtoken");

const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: "sessions",
});

// file import
const UserModel = require("./models/userModel");
const sessionModel = require("./models/sessionModel");
const todoModel = require("./models/todoModel");
const { userDataValidation, validateEmail, generateJwtToken, sendVerificationEmail, sendPasswordEmail } = require("./utill/userDataValidation");
const userDPModel = require("./models/userDPModel");
const { isUserAuth } = require("./middlewares/isAuthMiddleware");
const { todoValidation } = require("./utill/todoValidation")
const cloudinary = require("cloudinary").v2;

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

// database connection

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error);
    });

//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// constants

app.set("view engine", "ejs");
const Port = process.env.PORT || 8000;

app.get("/", (req, res) => {
    res.redirect("/login");
})
// registration
app.get("/registration", (req, res) => {
    return res.render("Registration");
});

app.post("/registration", async (req, res) => {
    const { name, email, username, password } = req.body;

    // validation
    try {
        await userDataValidation({ name, email, username, password });

    } catch (error) {
        return res.status(400).send({ message: error.message });
    }


    try {
        const exitingUser = await UserModel.findOne({ email: email });
        if (exitingUser) {
            return res.send({
                status: 409,
                message: "Email already exists! Please Login...."
            });
        }

        const existUsername = await UserModel.findOne({ username: username });
        if (existUsername) {
            return res.send({
                status: 409,
                message: "Username already exists! Please Login...."
            });
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT));
        // save user in DB
        const user = new UserModel({
            name: name,
            email: email,
            username: username,
            password: hashedPassword
        });
        const userDb = await user.save();
        const token = generateJwtToken(email);

        sendVerificationEmail(email, token);

        return res.redirect("/login");

    } catch (error) {
        return res.send({ status: 500, message: error.message });
    }


})

// verify email
app.get("/verify-email/:token", async (req, res) => {
    const { token } = req.params;
    const email = jwt.verify(token, process.env.JWT_SECRET).email;
    try {
        await UserModel.findOneAndUpdate({ email: email }, { isEmailVerify: true });
    } catch (error) {
        console.log(error);
    }
    res.redirect("/login");
})
// login
app.get("/login", (req, res) => {
    return res.render("Login");
})

app.post("/login", async (req, res) => {

    const { loginId, password } = req.body;
    if (!loginId || !password) {
        return res.send({
            status: 400,
            message: "Please fill all the fields"
        })
    }
    try {
        let user;
        if (validateEmail(loginId)) {
            user = await UserModel.findOne({ email: loginId });
        }
        else {
            user = await UserModel.findOne({ username: loginId });
        }

        if (!user) {
            return res.send({
                status: 404,
                message: "User not found"
            });
        }

        if (!user.isEmailVerify) {
            return res.send({
                status: 404,
                message: "Please verify your email"
            });
        }

        if (user && !bcrypt.compareSync(password, user.password)) {
            return res.send({
                status: 404,
                message: "Incorrect Password"
            });
        }

        req.session.isAuth = true;
        req.session.user = {
            userID: user._id,
            email: user.email,
            username: user.username
        }

        return res.redirect("/dashboard");
        // return res.send({
        //     status: 201,
        //     message: "Login Success",
        // });

    } catch (error) {
        return res.send({ status: 500, message: error.message });
    }

})

// change the page to get email for password change link
app.get("/Changepassword", (req, res) => {

    return res.render("Password_mail");
})

app.get("/resendEmail", (req, res) => {

    return res.render("Email");
})
// get new password page
app.get("/newPassword", (req, res) => {

    return res.render("Email_Password");
})
// resend verification email
app.post("/resend-verification-email", async (req, res) => {
    const email = req.body.email; // Use req.query for GET parameters
    console.log(email);

    if (!email) {
        return res.status(400).send('Email is required.');
    }

    try {
        const token = generateJwtToken(email);
        await sendVerificationEmail(email, token); // Ensure this function handles errors
        return res.redirect("/login");
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error.');
    }

});
// send Password to email
app.post("/password-link", async (req, res) => {

    const email = req.body.email;
    await sendPasswordEmail(email);

    return res.redirect("/login");
})
// change password

app.post("/New-Password", async (req, res) => {

    const { email, password } = req.body;
    console.log(email, password);
    try {
        const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT));
        await UserModel.findOneAndUpdate({ email: email }, { password: hashedPassword });
        return res.send({
            status: 200,
            message: "Password Changed Successfully"
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: error.message
        });
    }
})
// Dashboard
app.get("/dashboard", isUserAuth, (req, res) => {

    return res.render("Dashboard");
})

// logout
app.post("/logout", isUserAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json("Unable to logout!");

        return res.redirect("/login");
    });
})

// logout all
app.post("/logoutAll", isUserAuth, async (req, res) => {

    try {
        const dltDB = await sessionModel.deleteMany({ "session.user.username": req.session.user.username });
        return res.redirect("/login");
    } catch (err) {
        return res.status(500).json(err);
    }
})

// Create Todo
app.post('/create-todo', isUserAuth, async (req, res) => {
    const username = req.session.user.username;
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
});

// Get Todo
app.get('/get-todo', isUserAuth, async (req, res) => {
    const username = req.session.user.username;
    const SKIP = Number(req.query.skip) || 0;
    const Limit = 7;

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
            { $match: { userName: username } },
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
})

// Update Todo
app.post('/edit-todo', isUserAuth, async (req, res) => {
    const todoId = req.body.todoId;
    const newTodo = req.body.newTodo;
    const todoStatusValue = req.body.todoStatusValue;
    const username = req.session.user.username;

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
        if (userCheckDB.userName !== username) {
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
})

// Delete Todo
app.post('/delete-todo', isUserAuth, async (req, res) => {
    const todoId = req.body.todoId;
    const username = req.session.user.username;
    try {
        // Ownership check 
        const userCheckDB = await todoModel.findOne({ _id: todoId });
        if (userCheckDB.userName !== username) {
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
})

app.get('/total-todo-count', isUserAuth, async (req, res) => {
    const username = req.session.user.username;

    try {
        const todolist = await todoModel.find({ userName: username });
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
})

app.get('/get-user', isUserAuth, async (req, res) => {
    const username = req.session.user.username;
    try {
        const userDB = await UserModel.findOne({ username: username });
        return res.send({
            status: 200,
            message: "User Found",
            data: userDB
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: 'Iternal Server Error',
            error: error
        })
    }
})

app.post('/uploadDP', isUserAuth, (req, res) => {
    const username = req.session.user.username;

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({ status: 400, message: "Error parsing the form." });
        }

        const file = files.profilePic[0];

        // Check if a file is uploaded and its MIME type
        if (!file || !file.filepath) {
            return res.status(400).json({ status: 400, message: "No file uploaded." });
        }

        const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({ status: 400, message: "Only image files are allowed." });
        }

        const Path = file.filepath;
        const public_id = uuidv4();

        try {
            const result = await cloudinary.uploader.upload(Path, {
                folder: "Profile",
                public_id: public_id,
            });

            const userDB = await userDPModel.findOneAndUpdate(
                { username: username },
                { img: result.secure_url },
                { new: true, upsert: true, useFindAndModify: false }
            );

            if (!userDB) {
                fs.unlinkSync(Path);
            }
            return res.status(200).send({
                status: 200,
                message: "Profile picture uploaded successfully.",
                data: userDB
            });
        } catch (error) {
            return res.status(500).send({
                status: 500,
                message: 'Internal Server Error',
                error: error.message || 'An error occurred while uploading the profile picture.'
            });
        }
    });
});

app.get('/get-userDP', isUserAuth, async (req, res) => {
    const username = req.session.user.username;
    try {
        const userDB = await userDPModel.findOne({ username: username });
        return res.send({
            status: 200,
            message: "User Found",
            data: userDB
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: 'Iternal Server Error',
            error: error
        })
    }
})


app.listen(Port, () => {
    console.log(`Server is running at port http://localhost:${Port}`);
})