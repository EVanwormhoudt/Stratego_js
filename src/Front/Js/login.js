let form = document.getElementById("log-form");
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");


form.addEventListener('submit', event => {
    event.preventDefault();
    socket.emit("login",[inputUser.value, inputPass.value])
    logger.sendLogin(inputUser.value);
});

socket.on("testLogin",(result)=>{
    console.log(result)
});
