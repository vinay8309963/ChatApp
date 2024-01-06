const token = localStorage.getItem('token');
const u_name = localStorage.getItem('userName')
const username = u_name.replace(/"/g, '');

function sendMessage(e) {
    console.log(token)
    e.preventDefault();
    const form = new FormData(e.target);
    const message = form.get("message"); // Fix typo here
    console.log(message);
    axios.post('http://localhost:3000/chat/sendMessage', { message }, { headers: { "Authorization": token } })
        .then(response => {
            console.log(response.data.messages)
            e.target.reset()
            addNewMessage(response.data.messages)
            setTimeout(scrollToBottom, 100);
        })
        .catch(error => {
            console.error('Error in sending message:', error);
        });
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('messages');
    const lastMessage = messagesContainer.lastElementChild;

    if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    }
}

function addNewMessage(msg) {

    const parentElement = document.getElementById('messages');
    const newRow = document.createElement('tr');
    newRow.setAttribute('id', `message-${msg.id}`)

    if(msg.name == username){
        newRow.innerHTML = `<td>You : ${msg.message}</td>`;
    }
    else {
        newRow.innerHTML = `<td>${msg.name} : ${msg.message}</td>`;
    }

    parentElement.appendChild(newRow);
}

function getMessages() {
    console.log(token);
    axios.get('http://localhost:3000/chat/getMessages', { headers: { "Authorization": token } })
        .then(response => {
            response.data.messages.forEach(element => {
                addNewMessage(element)
                scrollToBottom();
            });
        })
        .catch(error => {
            console.error('Error in getting messages:', error);
        });
}

function getUsers() {
    return new Promise((resolve, reject) => {
        axios.get('http://localhost:3000/chat/getUsers', { headers: { "Authorization": token } })
            .then(response => {
                document.getElementById('username').innerHTML = `<strong>Hi, ${response.data.you}</strong>.<br> Welcome To Group Chat`
                response.data.users.forEach(ele => {
                    const parentElement = document.getElementById('messages');
                    const newRow = document.createElement('tr');
                    newRow.setAttribute('id', `user-${ele.id}`)
                    if (response.data.you == ele.name) {
                        newRow.innerHTML = `<td>You joined</td>`;
                    } else {
                        newRow.innerHTML = `<td> ${ele.name} joined</td>`;
                    }
                    parentElement.appendChild(newRow);
                })
                resolve(1)
            })
            .catch(err => {
                document.body.innerHTML += `<div style="color:red;">${err} <div>`;
                reject(0)
            })
    })

}


window.onload = async () => {
    await getUsers();
    getMessages();
}