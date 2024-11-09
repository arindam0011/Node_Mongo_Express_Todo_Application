
const ResendBtn = document.getElementById("Re-email-btn");
const ResendEmail = document.getElementById("Re-email");


ResendBtn.addEventListener("click", () => {
    const email = ResendEmail.value;
    if (!email) {
        alert("Please enter a valid email.");
        return;
    }
    console.log(email);
    axios
        .post("/resend-verification-email", {email })
        .then((res) => {
            alert("Verification email sent");
            window.location.href = '/login'
        })
        .catch((err) => {
            alert("Internal Server Error"); 
        })
    })

   