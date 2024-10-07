const todoValidation = ({todo}) => {
    return new Promise((resolve, reject) => {
        
        if (!todo) {
            return reject("Please enter a task!");
        }
        if (typeof todo !== "string") {
            return reject("Todo must be a string");
        }
        if (todo.length < 5 || todo.length > 50) {
            return reject("Todo must be between 5 and 50 characters");
        }
        resolve();
    });
};

module.exports = { todoValidation };
