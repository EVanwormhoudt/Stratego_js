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