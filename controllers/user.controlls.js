require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const UserModel = require("../models/userModel");
const sessionModel = require("../models/sessionModel");
const userDPModel = require("../models/userDPModel");
const formidable = require("formidable");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const moongoose = require("mongoose");


const session = require("express-session");

const { userDataValidation, validateEmail, generateJwtToken, sendVerificationEmail, sendPasswordEmail } = require("../utill/userDataValidation");
const { get } = require("http");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// render registration page
const renderRegistrationPage = (req, res) => {
    return res.render("Registration");
}

// user registration
const registration = async (req, res) => {
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
        
        return res.status(201).send({
            status: 201,
            message: "User Created Successfully",
            data: userDb
        });

    } catch (error) {
        return res.send({ status: 500, message: error.message });
    }


}

// render login page
const renderLoginPage = (req, res) => {
    return res.render("Login");
}

// user login
const login= async (req, res) => {

    const { loginId, password } = req.body;
   
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

        return res.redirect("/user/dashboard");

    } catch (error) {
        return res.send({ status: 500, message: error.message });
    }

}

const getUser =  async (req, res) => {
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
}

const deleteUser = async (req, res) => {
    const email = req.session.user.email;

    try {
        await UserModel.findOneAndDelete({ email: email });
        return res.redirect('/user/login');
    } catch (error) {
        return res.send({
            status: 500,
            message: 'Iternal Server Error',
            error: error
        })
    }
}

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json("Unable to logout!");

        return res.redirect("/user/login");
    });
}

const logoutFromAlldevices = async (req, res) => {

    try {
        const dltDB = await sessionModel.deleteMany({ "session.user.username": req.session.user.username });
        return res.redirect("/user/login");
    } catch (err) {
        return res.status(500).json(err);
    }
}

const rederChangePasswordPage = (req, res) => {

    return res.render("Password_mail");
}

const renderEmailpage = (req, res) => {

    return res.render("Email");
}


const renderNewPasswordPage = (req, res) => {

    return res.render("Email_Password");
}

const resendVerificationEmail = async (req, res) => {
    const email = req.body.email; // Use req.query for GET parameters

    if (!email) {
        return res.status(400).send('Email is required.');
    }

    try {
        const token = generateJwtToken(email);
        await sendVerificationEmail(email, token); // Ensure this function handles errors
        return res.redirect("/user/login");
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error.');
    }

}
const varifyEmailToken = async (req, res) => {
    const { token } = req.params;
    const email = jwt.verify(token, process.env.JWT_SECRET).email;
    try {
        await UserModel.findOneAndUpdate({ email: email }, { isEmailVerify: true });
    } catch (error) {
        console.log(error);
    }
    res.redirect("/user/login");
}

const sendPasswordChangeLinkToEmail = async (req, res) => {

    const email = req.body.email;
    const userDB = await UserModel.findOne({ email: email });
    if (!userDB) {
        return res.send({
            status: 403,
            message: "Forbidden Access"
        });
    }
    await sendPasswordEmail(email);

    return res.redirect("/user/login");
}

const setNewPassword =async (req, res) => {

    const { email, password } = req.body;
   
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
            message: error || error.message
        });
    }
}

const uploadDp =  (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).send({ status: 401, message: "User not authenticated." });
    }
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

                fs.unlinkSync(Path);
            
            return res.status(200).send({
                status: 200,
                message: "Profile picture uploaded successfully.",
                data: userDB
            });
        } catch (error) {
            console.log("upload Dp error"+error);
            return res.status(500).send({
                status: 500,
                message: 'Internal Server Error',
                error: error.message || 'An error occurred while uploading the profile picture.'
            });
        }
    });
}
const renderDashboard = (req, res) => {

    return res.render("Dashboard");
}

const getDP = async (req, res) => {
    const username = req.session.user.username;
    try {
        const userDB = await userDPModel.findOne({ username: username });
        if (!userDB || userDB === null) return res.send({
            status: 204,
            message: "User Not Found",
        });

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
}


module.exports = {
    renderRegistrationPage,
    registration,
    renderLoginPage,
    login,
    getUser,
    deleteUser,
    logout,
    logoutFromAlldevices,
    rederChangePasswordPage,
    renderEmailpage,
    renderNewPasswordPage,
    resendVerificationEmail,
    varifyEmailToken,
    sendPasswordChangeLinkToEmail,
    setNewPassword,
    renderDashboard,
    uploadDp,
    getDP,


};