function signup(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const signupDetails = {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        phoneNumber: form.get("phoneNumber")
    }
    console.log(signupDetails)
    axios.post('/user/signup',signupDetails).then(response => {
        if(response.status === 201){
            window.location.href = "../Login/login.html" // change the page on successful signup
        } else {
            throw new Error('Failed to login')
        }
    }).catch(err => {
        document.body.innerHTML = `<div style="color:red;">User Already Exists Please Login<div>`;
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    })
}