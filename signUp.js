// const backendUrl = "http://localhost:8080";
const backendUrl = "https://web-socket-chat-application.onrender.com";

document.getElementById("login-button-id").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "index.html";
})

document.getElementById("sign-up-id").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loader").style.display = "inline-block";
    fetch(link + "/user/signUp", {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            'username': document.getElementById("username").value,
            'accountName': document.getElementById("accountName").value,
            'imageUrl': document.getElementById("imageUrl").value,
            'password': document.getElementById("password").value
        })
    }).then(response => {
        document.getElementById("loader").style.display = "none";
        if (response.status == 200) {
            body = response.json();
            body.then(data => {
                if (data.message === "USER_NAME_ALREADY_EXIST") {
                    document.getElementById("sww-id").style.display = 'none';
                    document.getElementById("uae-id").style.display = 'block';
                }
                else {
                    document.getElementById("sww-id").style.display = 'none';
                    document.getElementById("uae-id").style.display = 'none';
                    document.getElementById("heading-signUp").innerText = "User Registred Successfully!!";
                    document.getElementById("heading-signUp").style.backgroundColor = "#215f4c";
                    document.getElementById("heading-signUp").style.color = "white";
                    document.getElementsByClassName("form-group")[0].style.display = 'none';
                    document.getElementsByClassName("form-group")[1].style.display = 'none';
                    document.getElementsByClassName("form-group")[2].style.display = 'none';
                    document.getElementsByClassName("form-group")[3].style.display = 'none';
                    document.getElementById("sign-up-id").style.display = 'none';
                    document.getElementById("between-line-id").style.display = 'none';
                }
            })
        }
        else {
            document.getElementById("sww-id").style.display = 'block';
            document.getElementById("uae-id").style.display = 'none';    
        }
    })
})