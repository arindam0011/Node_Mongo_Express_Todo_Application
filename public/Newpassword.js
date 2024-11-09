const Re_email= document.getElementById('Re-email');
const New_password= document.getElementById('New-password');
const changePwBtn = document.getElementById('Re-email-btn');


changePwBtn.addEventListener('click', () => {
    const email = Re_email.value;
    const password = New_password.value;
    if (!email) {
        alert("Please enter a valid email.");
        return;
    }
    console.log(email, password);
    axios
        .post("/New-Password", { email, password })
        .then((res) => {
            console.log(res);
            alert(res.data.message);
            window.location.href = '/login'
        })
        .catch((err) => {
            alert("Internal Server Error"); 
        })
    })