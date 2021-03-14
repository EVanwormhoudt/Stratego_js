let form = document.getElementById("log-form");
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");

form.addEventListener('submit', event => {
    event.preventDefault();

    socket.emit("password", [inputUser.value]);
    socket.on("resultPass", res => {
        if (res.length){
            socket.emit("decrypt", [inputPass.value, res]);
            socket.on("resultDecrypt", result => {
                if(result){
                    logger.sendLogin(inputUser.value);
                }
                else {
                    alert('Mot de passe incorrect.')
                }
            });
        }
        else {
            alert("Ce nom d'utilisateur n'existe pas.")
        }
    });
});

/* socket.emit("login",[inputUser.value, inputPass.value]);
socket.on("resultDecrypt", isSame => {
    console.log('something?');
    if(isSame == true){
        logger.sendLogin(inputUser.value);
    }
    else{
        alert('Wrong password')
    }
});
*/

/*
socket.on("resultLogin",result=>{
    if(result.length){
        logger.sendLogin(inputUser.value);
    }
    else{
        alert('Erreur de mot de passe')
    }
});
*/