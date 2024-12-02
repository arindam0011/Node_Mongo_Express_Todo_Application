const express = require('express');
const userRouter = express.Router();

const { isUserAuth } = require("../middlewares/isAuthMiddleware");
const { 
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


 } = require("../controllers/user.controlls.js");


// get register page
userRouter.get("/registration", renderRegistrationPage);  //get:: /user/registration


// User registration
userRouter.post("/registration", registration) // Post:: /user/registration

// verify email
userRouter.get("/verify-email/:token", varifyEmailToken);// get:: /user/verify-email


// login page render
userRouter.get("/login", renderLoginPage) // get:: /user/login

// user login
userRouter.post("/login", login) // post:: /user/login

// render change password page
userRouter.get("/Changepassword", rederChangePasswordPage) // get:: /user/Changepassword

// email page render
userRouter.get("/resendEmail", renderEmailpage) // get:: /user/resendEmail

// get new password page
userRouter.get("/newPassword", renderNewPasswordPage) // get:: /user/newPassword

// resend verification email
userRouter.post("/resend-verification-email", resendVerificationEmail); // post:: /user/resend-verification-email

// send Password to email
userRouter.post("/password-link", sendPasswordChangeLinkToEmail); // post:: /user/password-link

// change password
userRouter.post("/New-Password", setNewPassword) // post:: /user/New-Password

// Dashboard
userRouter.get("/dashboard", isUserAuth, renderDashboard) // get:: /user/dashboard

// logout
userRouter.post("/logout", isUserAuth, logout) // post:: /user/logout

// logout all
userRouter.post("/logoutAll", isUserAuth, logoutFromAlldevices); // post:: /user/logout

// get user
userRouter.get('/get-user', isUserAuth, getUser); // get:: /user/get-user

// upload DP
userRouter.post('/uploadDP', isUserAuth, uploadDp); // post:: /user/uploadDP

// get DP
userRouter.get('/get-userDP', isUserAuth, getDP); // get:: /user/get-userDP

// delete user
userRouter.post('/delete-user', isUserAuth, deleteUser); // post:: /user/delete-user

module.exports = userRouter;









