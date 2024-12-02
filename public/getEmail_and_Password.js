
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
        .post("/user/resend-verification-email", {email })
        .then((res) => {
            if(res.data.status===200) {
                alert(res.data.message);
                window.location.href = '/user/login'
            }
            else {
                alert(res.data.message);
            }
            
        })
        .catch((err) => {
            alert("Internal Server Error"); 
        })
    })

   