const PasswordBtn = document.getElementById("pw-email-btn");
const PasswordEmail = document.getElementById("pw-email");

PasswordBtn.addEventListener("click", () => {
    const email = PasswordEmail.value;
    if (!email) {
        alert("Please enter a valid email.");
        return;
    }
    console.log(email);
    axios
        .post("/user/password-link", { email })
        .then((res) => {
            alert( res.data.message + "!! Check your email for password!!" || "Check your email for password!!");
            window.location.href = '/user/login'
        })
        .catch((err) => {
            alert("Internal Server Error"); 
        })
    })