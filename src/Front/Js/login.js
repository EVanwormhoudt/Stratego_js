let form = document.getElementById("log-form");
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");

form.addEventListener('submit', event => {
    event.preventDefault();

    socket.emit("password", [inputUser.value]);
    socket.on("resultPass", res => {                // On demande au serveur de regarder si le pseudo existe
        if (res.length){
            socket.emit("decrypt", [inputPass.value, res]);         //si oui, on verifie que le mot de passe est le bon
            socket.on("resultDecrypt", result => {
                if(result){
                    logger.sendLogin(inputUser.value);              //et on connecte l'utilisateur
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