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
        .post("/password-link", { email })
        .then((res) => {
            alert("Check your email for password!!");
            window.location.href = '/login'
        })
        .catch((err) => {
            alert("Internal Server Error"); 
        })
    })