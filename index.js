var stompClient = null;

function connect() {
    // var socket = new SockJS('https://f53a-103-31-40-38.ngrok-free.app/ws');
    var socket = new SockJS('http://localhost:8081/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/chatroom/public', onMessageReceived);
    });
}

function sendMessage() {
    var message = document.getElementById('messageInput').value;
    var currentUsername = localStorage.getItem("currentUser");
    messageObject = {
        senderName: currentUsername,
        message: message
    }
    stompClient.send("/app/message", {}, JSON.stringify(messageObject));
    document.getElementById('messageInput').value = "";
}

const loginForm = document.getElementById("login-form-id");

loginForm.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("message-container").style.display = 'block';
    let loginUsername = document.getElementById("login-user-name").value;
    localStorage.setItem("currentUser", loginUsername);
    document.getElementById("login-formId").style.display = 'none';
    connect();
})

const messageContainer = document.getElementById("message-container");

const chatBox = document.getElementById("chats-id");

const onMessageReceived = (payload) => {
    body = JSON.parse(payload.body);
    let chatDiv = document.createElement('div');
    chatDiv.classList.add('chat-div');
    let senderNameDiv = document.createElement('div');
    senderNameDiv.classList.add('sender-name');
    let messageDiv = document.createElement('div');
    messageDiv.classList.add('message-class');
    if (body.senderName === localStorage.getItem("currentUser")) {
        chatDiv.classList.add('chat-div-right');
        senderNameDiv.innerHTML = "you";
    }
    else {
        chatDiv.classList.add('chat-div-left');
        senderNameDiv.innerHTML = body.senderName;
    }
    messageDiv.innerText = body.message;
    chatDiv.appendChild(senderNameDiv);
    chatDiv.appendChild(messageDiv);
    chatBox.appendChild(chatDiv);
}