
const changePwBtn = document.getElementById('Re-email-btn');


changePwBtn.addEventListener('click', () => {
    console.log("clicked!")
    const Re_email = document.getElementById('Re-email');
    const New_password = document.getElementById('New-password');
    const email = Re_email.value;
    const password = New_password.value;
    if (!email) {
        alert("Please enter a valid email.");
        return;
    }
    else if (!password) {
        alert("Please enter your password.");
        return;
    }
    else if (password.length < 5) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    console.log(email, password);
    axios
        .post("/user/New-Password", { email, password })
        .then((res) => {
            if (res.data.status === 200) {
                alert(res.data.message);
                window.location.href = '/user/login'
            }
            else {
                alert(res.data.message);
            }
        })
        .catch((err) => {
            console.log(err);
            alert("Internal Server Error");
        })
})

const eyeIcon = document.getElementById('eye-icon');
const passwordInput = document.getElementById('New-password');

eyeIcon.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
});