// const backendUrl = "http://localhost:8081";
const backendUrl = "https://web-socket-chat-application.onrender.com";
var stompClient = null;
const loginTime = Date.now();

document.getElementById("logout-button").addEventListener("click", (e) => {
    stompClient.disconnect();
    location.reload();
})

function connect() {
    var socket = new SockJS(backendUrl + '/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe(`/user/` + localStorage.getItem("wuId") + `/private`, onMessageReceivedData);
    });
}

function fetchUsersList() {
    fetch(backendUrl + `/user/getUserList/${localStorage.getItem('wuId')}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    }).then(response => {
        if (response.status == 200) {
            body = response.json();
            body.then(data => {
                let userListDiv = document.getElementById("user-list-id");
                messageBody = document.getElementById("message-body-id");
                data.forEach(element => {
                    let userChatListBody = document.createElement('div');
                    userChatListBody.classList.add('user-list-block');
                    var messageBodyIndividual = document.createElement('div');
                    messageBodyIndividual.setAttribute("id", element['id'] + "body");
                    // messageBodyIndividual.innerHTML = element['accountName'];
                    messageBodyIndividual.classList.add("message-body-individual");


                    messageBodyIndividual.addEventListener("scroll", function () {
                        const scrollTop = messageBodyIndividual.scrollTop;
                        if (scrollTop === 0) {
                            pageNumber = parseInt(localStorage.getItem(element['id'] + "pageNumber"));
                            fetch(backendUrl + `/user/getMessageList`, {
                                method: 'POST',
                                body: JSON.stringify({
                                    "senderId": localStorage.getItem("wuId"),
                                    "receiverId": element['id'],
                                    "pageNumber": pageNumber + 1,
                                    "numberOfRecords": 5,
                                    "dateAndTime": loginTime
                                }),
                                headers: {
                                    'Content-type': 'application/json; charset=UTF-8',
                                }
                            }).then(response => {
                                if (response.status == 200) {
                                    localStorage.setItem(element['id'] + "pageNumber", parseInt(localStorage.getItem(element['id'] + "pageNumber")) + 1);
                                    var body = response.json();
                                    body.then(data => {
                                        data.forEach(messageElement => {
                                            var messageBodyDiv = document.createElement('div');
                                            if (messageElement['sender'] == localStorage.getItem("wuId")) {
                                                messageBodyDiv.classList.add('message-sender');
                                            }
                                            else {
                                                messageBodyDiv.classList.add('message-receiver');
                                            }
                                            messageBodyDiv.innerHTML = `<p class="messageContent">${messageElement['content']}</p>
                                                <span class="timestamp">${extractDateAndTime(parseInt(messageElement['time']))}</span>`;
                                            messageBodyIndividual.prepend(messageBodyDiv);
                                        })
                                    })
                                }
                                else {
                                    // location.reload();
                                    console.log("not found");
                                }
                            })
                            // Your code here to handle reaching the top of the div
                        }
                    });
                    localStorage.setItem(element['id'] + "pageNumber", 1);

                    messageBody.appendChild(messageBodyIndividual);
                    fetch(backendUrl + `/user/getMessageList`, {
                        method: 'POST',
                        body: JSON.stringify({
                            "senderId": localStorage.getItem("wuId"),
                            "receiverId": element['id'],
                            "pageNumber": 1,
                            "numberOfRecords": 5,
                            "dateAndTime": loginTime
                        }),
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',
                        }
                    }).then(response => {
                        if (response.status == 200) {
                            var body = response.json();
                            body.then(data => {
                                data.forEach(messageElement => {
                                    var messageBodyDiv = document.createElement('div');
                                    if (messageElement['sender'] == localStorage.getItem("wuId")) {
                                        messageBodyDiv.classList.add('message-sender');
                                    }
                                    else {
                                        messageBodyDiv.classList.add('message-receiver');
                                    }
                                    messageBodyDiv.innerHTML = `<p class="messageContent">${messageElement['content']}</p>
                                        <span class="timestamp">${extractDateAndTime(parseInt(messageElement['time']))}</span>`;
                                    messageBodyIndividual.prepend(messageBodyDiv);
                                })
                            })
                        }
                        else {
                            // location.reload();
                            console.log("not found");
                        }
                    })
                    userChatListBody.onclick = function () {
                        selectCurrentUser(element['id'], element['accountName'], element['imageUrl']);
                    };
                    userChatListBody.innerHTML = `<div class="image-user-list"><img src='${element['imageUrl']}'></div><div class="name-user-list"><h4>${element['accountName']}</h4></div>`
                    userListDiv.appendChild(userChatListBody);
                });
            })
        }
        else {
            location.reload();
        }
    })
}

function selectCurrentUser(id, accountName, imageUrl) {
    var lastChatUser = localStorage.getItem("lastChatUser");
    if (lastChatUser != null) {
        document.getElementById(lastChatUser + "body").style.display = 'none';
    }
    localStorage.setItem("lastChatUser", id);
    localStorage.setItem("currentChatUser", id);
    document.getElementById(id + "body").style.display = 'block';
    let chatHeader = document.getElementById("header-id");
    chatHeader.childNodes[1].childNodes[1].innerText = accountName;
    chatHeader.children[1].childNodes[1].src = imageUrl;
}

document.getElementById("login-form-id").addEventListener("click", (e) => {
    e.preventDefault();
    let username = document.getElementById("login-user-name").value;
    let password = document.getElementById("login-user-password").value;
    fetch(backendUrl + `/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
            'username': username,
            'password': password
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    }).then(response => {
        if (response.status == 200) {
            body = response.json();
            body.then(data => {
                localStorage.setItem('wuId', data['id']);
                localStorage.setItem('accountName', data['accountName']);
                fetchUsersList();
                document.getElementById("login-formId").style.display = 'none';
                document.getElementById("main-container-id").style.display = 'block';
                document.getElementById("header-part-name-id-h1").innerText = data['accountName'];
                connect();
            })
        }
        else {
            document.getElementById("invalid-id").style.display = 'inline-block';
        }
    })
})

const onMessageReceivedData = (payload) => {
    const body = JSON.parse(payload.body);
    var messageBodyDiv = document.createElement('div');
    console.log(body.date)
    messageBodyDiv.classList.add('message-receiver');
    messageBodyDiv.innerHTML = `<p class="messageContent">${body.message}</p>
                                        <span class="timestamp">${extractDateAndTime(parseInt(body.date))}</span>`;
    var currentChatScreen = document.getElementById(body.senderId + "body");
    currentChatScreen.appendChild(messageBodyDiv);
    currentChatScreen.scrollTop = currentChatScreen.scrollHeight;
}

document.getElementById("send-message-button-id").addEventListener("click", (e) => {
    e.preventDefault();
    const messageContent = document.getElementById("message-input-id").value;
    const dateAndTime = Date.now();
    stompClient.send("/app/private-message", {}, JSON.stringify({
        "senderId": localStorage.getItem("wuId"),
        "receiverId": localStorage.getItem("currentChatUser"),
        "message": messageContent,
        "date": dateAndTime
    }))
    var messageBodyDiv = document.createElement('div');

    messageBodyDiv.classList.add('message-sender');
    messageBodyDiv.innerHTML = `<p class="messageContent">${messageContent}</p>
                                        <span class="timestamp">${extractDateAndTime(parseInt(dateAndTime))}</span>`;
    var currentChatScreen = document.getElementById(localStorage.getItem("currentChatUser") + "body");
    currentChatScreen.appendChild(messageBodyDiv);
    document.getElementById("message-input-id").value = "";
    currentChatScreen.scrollTop = currentChatScreen.scrollHeight;
})

function extractDateAndTime(timestamp) {
    var currentDate = new Date(timestamp);

    var year = currentDate.getFullYear();
    var month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    var day = String(currentDate.getDate()).padStart(2, "0");
    var hours = String(currentDate.getHours()).padStart(2, "0");
    var minutes = String(currentDate.getMinutes()).padStart(2, "0");
    var seconds = String(currentDate.getSeconds()).padStart(2, "0");

    var formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
}

localStorage.clear();