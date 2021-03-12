let form = document.getElementById("log-form");
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");

form.addEventListener('submit', event => {
    event.preventDefault();
    socket.emit("login",[inputUser.value, inputPass.value]);
});

socket.on("resultLogin",result=>{
    if(result.length){
        logger.sendLogin(inputUser.value);
    }
    else{
        alert('Erreur de mot de passe')
    }
});
