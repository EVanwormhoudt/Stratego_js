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
        let message=document.getElementById("message");
        let precedentIndice = undefined;
        let nbrClicsCase = new Array(100); // Important pour gérer les sockets lorsqu'il y a plus d'un clic sur une même case.
        for(let i=0;i<nbrClicsCase.length;i++){
            nbrClicsCase[i]=0;
        }

        // Evenement sur le plateau Stratego
        for(let idCaseStratego=61;idCaseStratego<=100;idCaseStratego++){
            document.getElementById(idCaseStratego).addEventListener("click",()=>{
                if(pieceActuelleRouge.textContent!="Aucune"){ // Un type de pions a été préalablement selectionné
                    // On envoie la pièce actuellement selectionnée, l'id (1-100) de la case cliqué et le nombre de fois qu'on a cliqué sur cette case
                   socket.emit("decrementationTypePionJoueur1Server",pieceActuelleRouge.textContent,idCaseStratego,nbrClicsCase[idCaseStratego-1]);
                   // On reçoie si on peut poser la pièce, son image si oui, confirmation de l'id de la case, type de pièce selectionné,
                   // id du type de la pièce qu'il y avait avant sur cette case (joueur1.tableOfPawns) pour incrémentation vu qu'on l'a enlevée
                   // Ainsi que le nombre de clics sur la case cliquée
                   socket.on("decrementationTypePionJoueur1Client",(possible,image,idCase,indiceDuTypePion,idPiecePop,nbrDeClicsServeur)=>{
                        if(idCaseStratego==idCase){ // Permet d'empecher l'interconnexion des sockets 'decrementationTypePionJoueur1Client' des cases différentes
                            if(nbrClicsCase[idCase-1]==nbrDeClicsServeur){ // Permet d'empecher l'interconnexion des sockets 'decrementationTypePionJoueur1Client' lorsqu'on clique plus d'une fois sur la MEME case
                                nbrClicsCase[idCase-1]++;
                                if(possible==true){ // Si (possible == true) ==> type.nbrRestant > 0, la decrementation en données a déjà été faite, on affiche donc l'image au client
                                    console.log("Le nombre de pièce restant est supérieur à 0.");
                                    console.log("La case "+idCase+" change de contenu et prend la valeur : ",image)
                                    document.getElementById(idCaseStratego).textContent=image; // On affiche l'image dans la case du plateau Stratego
                                    console.log("indicedutype : ",indiceDuTypePion);
                                    tbodyPionsJ1.children[indiceDuTypePion].children[1].textContent--;
                                    if(idPiecePop!=undefined){ // S'il y avait une pièce précédemment, on incremente sur le tableau le nbr restant de cette pièce
                                        tbodyPionsJ1.children[idPiecePop].children[1].textContent++; // 
                                    }
                                }else{
                                    console.log("Le joueur1 ne peut plus poser de pièce du type '"+pieceActuelleRouge.textContent+"'.")
                                    document.getElementById("message").textContent="Le joueur1 ne peut plus poser de pièce du type '"+pieceActuelleRouge.textContent+"'.";
                                }
                            }
                            
                        }
                    });
                    
                } else { console.log("Pas de pièce selectionnée.")}
            })
        }
        // Evenement sur le tableau des pions
        for(let i=0;i<12;i++){
            tbodyPionsJ1.children[i].addEventListener("click",()=>{    
                // On demande au serveur si le type de pion de la case cliquée est encore disponible pour le joueur1
                socket.emit("TypePionsJ1DispoDemandeServer",tbodyPionsJ1.children[i].children[0].textContent);
                socket.on("TypePionsJ1DispoReponseServer",(reponse)=>{
                    if(reponse>0){ // Si oui, on effectue un certain nombre d'actions
                        message.textContent='';
                        if(precedentIndice == undefined){
                            precedentIndice = i;
                        } else {
                            tbodyPionsJ1.children[precedentIndice].style.background="white"; // Si precedentIndice existe, on met en blanc la case précédement cliquée
                            precedentIndice=i;
                        }
                        tbodyPionsJ1.children[i].style.background="red"; // On selectionne la case cliquée
                        pieceActuelleRouge.textContent=tbodyPionsJ1.children[i].children[0].textContent; // On actualise 
                    } else { // Sinon, on ne fait rien.
                        message.textContent="Vous ne pouvez pas selectionné un pion de type '"+tbodyPionsJ1.children[i].children[0].textContent+"' car le nombre restant de cette pièce est nul.";
                        console.log("Vous ne pouvez plus selectionné cette pièce : nombre restant épuisé.");
                    }
                })
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
    
    /* ---------------- Information pour débuger ---------------- */
    socket.on("strategoDonneesClient",(grille)=>{
        console.table(grille);
    })
    socket.on("tableauPiecesJ1Client",grille=>{
        console.table(grille);
    })

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