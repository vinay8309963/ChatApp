document.addEventListener("DOMContentLoaded", function () {
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-btn");
    const chatMessages = document.getElementById("chat-messages");

    sendButton.addEventListener("click", function () {
        const messageText = messageInput.value.trim();

        if (messageText !== "") {
            displayMessage("You", messageText);
            messageInput.value = ""; // Clear the input field after sending the message
        }
    });

    function displayMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");

        const senderSpan = document.createElement("span");
        senderSpan.classList.add("sender");
        senderSpan.textContent = sender + ":";

        const messageBodySpan = document.createElement("span");
        messageBodySpan.classList.add("message-body");
        messageBodySpan.textContent = message;

        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(messageBodySpan);

        chatMessages.appendChild(messageDiv);
        // Scroll to the bottom to show the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
