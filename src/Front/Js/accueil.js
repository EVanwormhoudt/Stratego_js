let log = document.getElementById("lienLog")
let reg = document.getElementById("lienReg")
let game = document.getElementById("jouer")
let deco = document.getElementById("deconnexion")
let wel = document.getElementById("bonjour")

socket.emit("isSession","");


socket.on("onSession", data=>{              //affichage selon s'il y a une session d'active ou non
    console.log(data);
    if(data){
        log.style.display = "none";
        reg.style.display = "none";
        deco.style.display = "block";
        game.style.display = "block";
        wel.style.display = "block";
        document.getElementById("nomUtilisateur").innerHTML = data;
    }
    else{
        log.style.display = "block";
        reg.style.display = "block";
        game.style.display = "none";
        deco.style.display = "none";
        wel.style.display = "none";
    }
})

let formInvit = document.getElementById("loginForm");
let input = document.getElementById("invite");

formInvit.addEventListener('submit', event => {     // Pour jouer au jeu sans se connecter
    event.preventDefault();
    console.log('Invité connecté :', input.value);
    logger.sendLogin(input.value);

});