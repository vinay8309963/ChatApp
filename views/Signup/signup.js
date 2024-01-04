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
    axios.post('http://localhost:3000/user/signup',signupDetails).then(response => {
        if(response.status === 201){
            document.body.innerHTML += `<div style="color:red;">Signup Successful<div>`
        } else {
            throw new Error('Failed to login')
        }
    }).catch(err => {
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    })
}