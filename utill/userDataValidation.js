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

module.exports = {userDataValidation, validateEmail};
