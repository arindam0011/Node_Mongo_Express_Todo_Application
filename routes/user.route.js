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
userRouter.get("/registration", renderRegistrationPage);
// registration
userRouter.post("/registration", registration)

// verify email
userRouter.get("/verify-email/:token", varifyEmailToken);
// login page render
userRouter.get("/login", renderLoginPage)

// login
userRouter.post("/login", login)

// render change password page
userRouter.get("/Changepassword", rederChangePasswordPage)

// email page render
userRouter.get("/resendEmail", renderEmailpage)
// get new password page
userRouter.get("/newPassword", renderNewPasswordPage)
// resend verification email
userRouter.post("/resend-verification-email", resendVerificationEmail);
// send Password to email
userRouter.post("/password-link", sendPasswordChangeLinkToEmail);
// change password

userRouter.post("/New-Password", setNewPassword)
// Dashboard
userRouter.get("/dashboard", isUserAuth, renderDashboard)

// logout
userRouter.post("/logout", isUserAuth, logout)

// logout all
userRouter.post("/logoutAll", isUserAuth, logoutFromAlldevices);

// get user
userRouter.get('/get-user', isUserAuth, getUser);

// upload DP
userRouter.post('/uploadDP', isUserAuth, uploadDp);

// get DP
userRouter.get('/get-userDP', isUserAuth, getDP);

// delete user
userRouter.post('/delete-user', isUserAuth, deleteUser);

module.exports = userRouter;









