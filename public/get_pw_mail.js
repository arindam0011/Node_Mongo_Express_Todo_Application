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
            if(res.data.status===200) {
                alert( res.data.message);
                window.location.href = '/user/login'
            }
            else {
                alert(res.data.message);
            }
        })
        .catch((err) => {
            alert(err.message); 
        })
    })