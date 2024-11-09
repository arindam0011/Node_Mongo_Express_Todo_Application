const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
const userDataValidation = ({ name, email, username, password }) => {
  // Email validation regex function

  return new Promise((resolve, reject) => {
    // Field existence validation
    if (!name || !email || !username || !password) {
      reject("Please fill all the fields");
    }

    // Data type validation
    if (typeof name !== "string") reject("Name must be a string");
    if (typeof email !== "string") reject("Email must be a string");
    if (typeof username !== "string") reject("Username must be a string");
    if (typeof password !== "string") reject("Password must be a string");

    // Length validation
    if (name.length < 3 || name.length > 20) reject("Name must be between 3 and 20 characters");
    if (username.length < 3 || username.length > 20) reject("Username must be between 3 and 20 characters");

    // Email format validation
    if (!validateEmail(email)) reject("Not a valid email address");

    resolve(); // Validation passed
  });
};

const generateJwtToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.VERIFICATION_EMAIL,
      pass: process.env.VERIFICATION_EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.VERIFICATION_EMAIL,
    to: email,
    subject: "Email Verification from Todo App",
    html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
              
              <h2 style="color: #333; text-align: center; font-size: 24px;">Welcome to Todo App!</h2>
              
              <p style="color: #555; text-align: center; font-size: 16px; line-height: 1.5;">
                We're thrilled to have you on board! To get started, please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:${process.env.PORT || 8000}/verify-email/${token}" style="display: inline-block; padding: 12px 25px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; transition: background-color 0.3s; box-shadow: 0 4px 8px rgba(0, 123, 255, 0.4);">
                  Verify Email
                </a>
              </div>
              
              <p style="color: #555; text-align: center; font-size: 14px; line-height: 1.5;">
                If you did not create an account, please ignore this email.
              </p>
              
              <p style="color: #555; text-align: center; font-size: 14px; line-height: 1.5;">
                Best regards,<br>The Todo App Team
              </p>
              
              <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #aaa;">
                <p>© 2024 Todo App. All rights reserved.</p>
              </div>
            </div>
          </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent on this email: "+ email+ "=>" + info.response);
    }
  });

}
const sendPasswordEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.VERIFICATION_EMAIL,
      pass: process.env.VERIFICATION_EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.VERIFICATION_EMAIL,
    to: email,
    subject: "Email Verification from Todo App",
    html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
              
              <h2 style="color: #333; text-align: center; font-size: 24px;">Welcome to Todo App!</h2>
              
              <p style="color: #555; text-align: center; font-size: 16px; line-height: 1.5;">
                Click below to reset your password!!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:${process.env.PORT || 8000}/newPassword" style="display: inline-block; padding: 12px 25px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; transition: background-color 0.3s; box-shadow: 0 4px 8px rgba(0, 123, 255, 0.4);">
                  Redirect to Login Page
                </a>
              </div>
              
              <p style="color: #555; text-align: center; font-size: 14px; line-height: 1.5;">
                If you don't want to reset your password, please use your previous password to login.
              </p>
              
              <p style="color: #555; text-align: center; font-size: 14px; line-height: 1.5;">
                Best regards,<br>The Todo App Team
              </p>
              
              <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #aaa;">
                <p>© 2024 Todo App. All rights reserved.</p>
              </div>
            </div>
          </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent on this email: "+ email+ "=>" + info.response);
    }
  });

}
module.exports = { userDataValidation, validateEmail, generateJwtToken, sendVerificationEmail, sendPasswordEmail };
