
function login(e) {
    e.preventDefault();
    console.log(e.target.name);
    const form = new FormData(e.target);

    const loginDetails = {
        email: form.get("email"),
        password: form.get("password")
    }
    console.log(loginDetails)
    axios.post('/user/login',loginDetails).then(response => {
        if(response.status === 200){
            console.log(response.data.token)
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userName', response.data.userDetails)
            localStorage.setItem('userId',response.data.userId)
            window.location.href = "../GroupChat/index.html" // change the page on successful login
        } else {
            throw new Error('Failed to login')
        }
    }).catch(err => {
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    })
}

// function forgotpassword() {
//     window.location.href = "../ForgotPassword/index.html"
// }