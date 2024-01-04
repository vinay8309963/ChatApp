
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
            localStorage.setItem('userDetails', JSON.stringify(response.data.user))
            // window.location.href = "../Expense/index.html" // change the page on successful login
            document.body.innerHTML += `<div style="color:green;">Successfully Logged In<div>`;
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