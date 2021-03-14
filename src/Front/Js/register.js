let form = document.getElementById("reg-form");
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");
let inputConf = document.getElementById("passwordConf");
let inputMail = document.getElementById("email");


form.addEventListener('submit', event => {
    event.preventDefault();

    if (inputPass.value === inputConf.value) {
        socket.emit("username", inputUser.value);
        socket.on("resultUser", res => {
            if (res.length === 0) {
                socket.emit("crypt", inputPass.value);
                socket.on("resultCrypt", res => {
                    socket.emit("register", [inputUser.value, inputMail.value, res]);
                    logger.sendLogin(inputUser.value);
                    alert('Compte créé avec succès.');
                });
            }
            else {
                alert("Ce nom d'utilisateur est déjà utilisé");
                window.location.reload();
            }
        });
    }
    else {
        event.preventDefault();
        window.alert('Les mots de passe ne correspondent pas');
    }

});