//import { Socket } from "socket.io";

(function(){
    let joueur1name = "Mathieu";
    let joueur2name = "Annie";
    let room = 1;

    console.log("Joueur 1 : ",joueur1name,"\nJoueur 2 : ",joueur2name);

    
    socket.emit("newgame",joueur1name,joueur2name,room);

    // Ces sockets coté serveur appellent les sockets homonymes (à la différence près du 'Server'/'Client') coté Client
    socket.emit("tableauPionsServer");
    socket.emit('tableauPionsListenerServerJ1');
    socket.emit('tableauPionsListenerServerJ2');
    socket.emit('strategoListenerServerJ1');
    socket.emit('strategoListenerServerJ2');
    
    /* ---------------------- Implémentation des sockets coté client ---------------------- */

    // Remplit d'après les informations du server (game.joueur1.tableOfPawns()) les tableaux des pions des 2 joueurs. 
    socket.on("tableauPionsClient",(tableOfPawnsJ1,tableOfPawnsJ2)=>{
        console.log("Appel de la fonction 'tableauPionsClient' coté client.");
        let tbodyPionsJ1 = document.getElementById("tableauPionsJ1").children[2];
        let tbodyPionsJ2 = document.getElementById("tableauPionsJ2").children[2];
        let i=0;
        for(element of tableOfPawnsJ1){
            tbodyPionsJ1.children[i].children[0].textContent=element.name;
            tbodyPionsJ1.children[i].children[1].textContent=element.nombreRestant;
            tbodyPionsJ1.children[i++].children[2].textContent=element.force;
        }
        i=0;
        for(element of tableOfPawnsJ2){
            tbodyPionsJ2.children[i].children[0].textContent=element.name;
            tbodyPionsJ2.children[i].children[1].textContent=element.nombreRestant;
            tbodyPionsJ2.children[i++].children[2].textContent=element.force;
        }
        
    })

    /* ---------------------- Joueur1 ----------------------*/

    // Applique un listener sur les cases du tableau des pions du joueur1
    socket.on('tableauPionsListenerClientJ1',(joueur1)=>{
        console.log("Appel de la fonction 'tableauPionsListenerClientJ1' coté client.");
        let tbodyPionsJ1 = document.getElementById("tableauPionsJ1").children[2];
        let pieceActuelleRouge = document.getElementById("pieceActuelleRouge");
        for(let i=0;i<12;i++){
            tbodyPionsJ1.children[i].addEventListener("click",()=>{
                tbodyPionsJ1.children[i].style.background="red";
                console.log(joueur1.getName());
                //tbodyPionsJ1.children[game.joueur1.indiceDuType(pieceActuelleRouge.textContent)].style.background="white";
                
                // Mettre ici l'histoire du strategoView.pièceActuRouge

                pieceActuelleRouge.textContent=tbodyPionsJ1.children[i].children[0].textContent;
            })
        }
    });
    // Applique un listener sur les cases du Stratego accessibles uniquement au joueur1
    socket.on('strategoListenerClientJ1',()=>{
        console.log("Appel de la fonction 'strategoListenerClientJ1' coté client.");

    });
    
    /* ---------------------- Joueur2 ----------------------*/

    socket.on('tableauPionsListenerClientJ2',()=>{
        console.log("Appel de la fonction 'tableauPionsListenerClientJ2' coté client.");
        let tbodyPionsJ2 = document.getElementById("tableauPionsJ2").children[2];
        for(let i=0;i<12;i++){
            tbodyPionsJ2.children[i].addEventListener("click",()=>{
                tbodyPionsJ2.children[i].style.background="lightblue";
            })
        }
    });

    socket.on('strategoListenerClientJ2',()=>{
        console.log("Appel de la fonction 'strategoListenerClientJ2' coté client.");

    });
    
})();

// socket.emit("startGame");
/*(function() {
    // Initialisation du jeu
    let player1 = new Player("Samuel")
    let player2 = new Player("Géraldine")
    let game = new Game(player1,player2); // Jeu en mémoire
    let gameView = new StrategoView(game); // Jeu sur l'interface, événements lors du clic etc..

    console.log(game.joueur1)
    console.log("Le joueur 1 s'appelle :",game.player1name(),", il est de l'équipe :",game.player1color())
    console.log("Le joueur 2 s'appelle :",game.player2name(),", elle est de l'équipe :",game.player2color())
    game.viewTable();
    console.log("La case de coordonnées (2,3) a le statut : ",game.getBoxContent(5,3))
    console.log("Le plateau est-il vide ?",game.isGridEmpty());

    // Usage des différentes pièces
    let cavalier = new Pions("Cavalier",9,player1.getName(),2,3);

    // Initialisation des informations visuelles
    gameView.lac();
    gameView.piecesListener();

    let test=document.getElementById("ready");
    test.addEventListener("click",()=>{
        if(game.isGridReady()){
            console.log("La partie peut commencer.")
        } else { console.log("La phase de préparation n'est pas encore terminée.")}
    })
    gameView.tableOfPiecesContent();
    gameView.tabDesPions(); // A supprimer un jour
    gameView.tabDuPlateau(); // A supprimer un jour
    gameView.plateauCaseListener();

    //gameView.piecesListener();
})();
*/
// socket.emit("startGame");