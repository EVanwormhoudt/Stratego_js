let form = document.getElementById("reg-form");             //on récupère les différents éléments de la page web
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");
let inputConf = document.getElementById("passwordConf");
let inputMail = document.getElementById("email");

//code pour se créer un compte
form.addEventListener('submit', event => {
    event.preventDefault();
    if(inputUser.value.length > 2) {                //Pseudo de Plus de 3 caractères
        if (inputPass.value === inputConf.value) {              //verification que les mots de passes saisis correspondent
            socket.emit("username", inputUser.value);           //on demande si le nom existe bien
            socket.on("resultUser", res => {                       //si non, alors on peut creer le compte
                if (res.length === 0) {
                    socket.emit("crypt", inputPass.value);          //en le cryptant d'abord
                    socket.on("resultCrypt", res => {
                        socket.emit("register", [inputUser.value, inputMail.value, res]);    //puis en envoyant tt les données nécéssaires
                        logger.sendLogin(inputUser.value);                      //et enfin on connecte directement l'utilisateur
                        alert('Compte créé avec succès.');
                        window.location.href = "/";
                    });
                } else {
                    alert("Ce nom d'utilisateur est déjà utilisé");     //sinon on notifie que le nom est déja pris
                    window.location.reload();
                }
            });
        }
        else {
            event.preventDefault();
            window.alert('Les mots de passe ne correspondent pas');
        }
    }
    else {
        window.location.reload();
        window.alert("Le nom d'utilisateur doit faire minimum 3 caractères");
    }
});