//import { isObject } from "util";

(function(){
    // Ne pas oublier le 'socket.emit("startGame");'

    console.log("Le script 'StartGame.js' est lancé.")
    socket.emit("emitInfo");
    socket.on("getInfo",(socketEntiere,roomEntiere,currentUser,currentUserPlayerNbr,roomNbr)=>{
        
        console.log("La socket entière : ",socketEntiere)
        console.log("La room entière : ",roomEntiere)
        console.log("currentUser : ",currentUser)
        console.log("currentUserPlayerNbr: ",currentUserPlayerNbr)
        console.log("Numero de la room : ",roomNbr)

        

        socket.emit("newgame",roomEntiere[1],roomEntiere[2],socketEntiere.room);

        socket.emit("introductionServer",socketEntiere,roomEntiere); // Phrases d'introduction en fonction des 2 joueurs de la room

        socket.emit("tableauPionsServerBuild",socketEntiere.player); // Crée dynamiquement le tableau des pions du joueur

        socket.emit("tableauPionsServerContent",socketEntiere.player); // Affiche les valeurs pour le tableau des pions

        socket.emit('preparationListenersServer',socketEntiere.player); // Applique les listeners sur le tableau des pions et le plateau

        // Devrait faire "socket.handshake.session.game[0]=9"
        socket.emit("changeLe");

    })


    // Affiche correctement les données au dessus du plateau
    socket.on("introductionClient",(userSocket,userRoom)=>{
        document.getElementById("roomNbr").textContent=userSocket.room;
        document.getElementById("currentPlayer").textContent=userSocket.username;
        document.getElementById('playerID').textContent=userSocket.player;
        let ennemyID = (userSocket.player==1) ? 2 : 1;
        document.getElementById('enemy').textContent=userRoom[ennemyID];
        document.getElementById('enemyID').textContent=ennemyID;
    });

    // Crée dynamiquement le tableau des pions du joueur en question
    socket.on("tableauPionsClientBuild",(playerNbr)=>{
        console.log("Appel de la fonction 'tableauPionsClientBuild' coté client pour le joueur",playerNbr,".");
        let tableID = (playerNbr==1) ? "tableauPionsJ1" : "tableauPionsJ2";
        let conteneurDuJeu = document.getElementById('conteneurDuJeu');

        let tbl = document.createElement("table");
        tbl.id=tableID;
        let tblcaption = document.createElement("caption")
        let tblThead = document.createElement("thead");
        let tblTbody = document.createElement("tbody");

        tblcaption.textContent = "" // Sans caption
        tblThead.innerHTML="<tr><td>Type</td><td>Nombre restant</td><td>Force</td></tr>"; // Mode barbare t'as vu

        for(let i=0;i<12;i++){
            let row = document.createElement("tr");
            for(let a=0;a<3;a++){
                let column = document.createElement("td");
                column.textContent="";
                row.appendChild(column);
            }
            tblTbody.appendChild(row);
        }

        tbl.appendChild(tblcaption);
        tbl.appendChild(tblThead);
        tbl.appendChild(tblTbody);
        conteneurDuJeu.appendChild(tbl);
    })

    /* ---------------------- Implémentation des sockets coté client ---------------------- */

    // Remplit d'après les informations du server (game.joueurX.tableOfPawns()) les informations dans le tableau des pions
    socket.on("tableauPionsClientContent",(tableOfPawns,playerNbr)=>{
        console.log("Appel de la fonction 'tableauPionsClientContent' coté client pour le joueur",playerNbr,".");
        let tbodyPion = (playerNbr==1) ? document.getElementById("tableauPionsJ1").children[2] : document.getElementById("tableauPionsJ2").children[2] ;
        let i=0;
        for(element of tableOfPawns){
            tbodyPion.children[i].children[0].textContent=element.name;
            tbodyPion.children[i].children[1].textContent=element.nombreRestant;
            tbodyPion.children[i++].children[2].textContent=element.force;
        }
    })

    // Applique un listener sur les cases du tableau des pions du joueur ET du plateau Stratego
    socket.on('preparationListenersClient',(playerNbr)=>{
        console.log("Appel de la fonction 'preparationListenersClient' coté client pour le joueur",playerNbr,".");
        
        let tbodyPion = (playerNbr==1) ? document.getElementById("tableauPionsJ1").children[2] : document.getElementById("tableauPionsJ2").children[2];
        let pieceActuelle = (playerNbr==1) ? document.getElementById("pieceActuelleRouge") : document.getElementById("pieceActuelleBleue");
        let message=document.getElementById("message");
        let precedentIndice = undefined;
        let nbrClicsCase = new Array(100); // Important pour gérer les sockets lorsqu'il y a plus d'un clic sur une même case.
        for(let i=0;i<nbrClicsCase.length;i++){
            nbrClicsCase[i]=0;
        }

        // ---------------- Evenements sur le tableau des pions ----------------
        let playerColor = (playerNbr==1) ? "red" : "lightblue";
        for(let i=0;i<12;i++){
            tbodyPion.children[i].addEventListener("click",()=>{    
                // On demande au serveur si le type de pion de la case cliquée est encore disponible pour le joueur1
                socket.emit("TypePionsJ1DispoDemandeServer",tbodyPion.children[i].children[0].textContent);
                socket.on("TypePionsJ1DispoReponseServer",(reponse)=>{
                    if(reponse>0){ // Si oui, on effectue un certain nombre d'actions
                        message.textContent='';
                        if(precedentIndice == undefined){
                            precedentIndice = i;
                        } else {
                            tbodyPion.children[precedentIndice].style.background="white"; // Si precedentIndice existe, on met en blanc la case précédement cliquée
                            precedentIndice=i;
                        }
                        tbodyPion.children[i].style.background=playerColor; // On selectionne la case cliquée
                        pieceActuelle.textContent=tbodyPion.children[i].children[0].textContent; // On actualise 
                    } else { // Sinon, on ne fait rien.
                        message.textContent="Vous ne pouvez pas selectionné un pion de type '"+tbodyPion.children[i].children[0].textContent+"' car le nombre restant de cette pièce est nul.";
                        console.log("Vous ne pouvez plus selectionné cette pièce : nombre restant épuisé.");
                    }
                })
            })
        }
        // ---------------- Evenements sur le plateau Stratego ----------------
        let caseDispo = (playerNbr==1) ? 61 : 1;
        for(let idCaseStratego=caseDispo;idCaseStratego<(caseDispo+40);idCaseStratego++){
            document.getElementById(idCaseStratego).addEventListener("click",()=>{
                if(pieceActuelle.textContent!="Aucune"){ // Un type de pions a été préalablement selectionné

                    /* ---- ATTENTION : potentiellement une histoire de socket.to("room"+roomNbr).emit("") à ajouter qlq part, pour que le fait de poser une pièce
                                        soit appliqué aussi bien pour celui qui emet la socket que l'autre joueur (faut rajouter roomNbr en argument de 'preparationListenersClientJ1' auquel cas) */

                    // On envoie la pièce actuellement selectionnée, l'id (1-100) de la case cliqué et le nombre de fois qu'on a cliqué sur cette case
                   socket.emit("decrementationTypePionJoueur1Server",pieceActuelle.textContent,idCaseStratego,nbrClicsCase[idCaseStratego-1]);
                   // On reçoie si on peut poser la pièce, son image si oui, confirmation de l'id de la case, type de pièce selectionné,
                   // id du type de la pièce qu'il y avait avant sur cette case (joueur1.tableOfPawns) pour incrémentation vu qu'on l'a enlevée
                   // Ainsi que le nombre de clics sur la case cliquée
                   socket.on("decrementationTypePionJoueur1Client",(possible,image,idCase,indiceDuTypePion,idPiecePop,nbrDeClicsServeur)=>{
                        if(idCaseStratego==idCase){ // Permet d'empecher l'interconnexion des sockets 'decrementationTypePionJoueur1Client' des cases différentes
                            if(nbrClicsCase[idCase-1]==nbrDeClicsServeur){ // Permet d'empecher l'interconnexion des sockets 'decrementationTypePionJoueur1Client' lorsqu'on clique plus d'une fois sur la MEME case
                                nbrClicsCase[idCase-1]++;
                                if(possible==true){ // Si (possible == true) ==> type.nbrRestant > 0, la decrementation en données a déjà été faite, on affiche donc l'image au client
                                    /*console.log("Le nombre de pièce restant est supérieur à 0.");
                                    console.log("La case "+idCase+" change de contenu et prend la valeur : ",image)
                                    console.log("indicedutype : ",indiceDuTypePion);*/
                                    document.getElementById(idCaseStratego).textContent=image; // On affiche l'image dans la case du plateau Stratego
                                    
                                    tbodyPion.children[indiceDuTypePion].children[1].textContent--;
                                    if(idPiecePop!=undefined){ // S'il y avait une pièce précédemment, on incremente sur le tableau le nbr restant de cette pièce
                                        tbodyPion.children[idPiecePop].children[1].textContent++; // 
                                    }
                                }else{
                                    console.log("Le joueur1 ne peut plus poser de pièce du type '"+pieceActuelle.textContent+"'.")
                                    document.getElementById("message").textContent="Le joueur1 ne peut plus poser de pièce du type '"+pieceActuelleRouge.textContent+"'.";
                                }
                            }
                            
                        }
                    });
                    
                } else { console.log("Pas de pièce selectionnée.")}
            })
        }
    });
    
    /* ---------------- Information pour débuger ---------------- */
    // Evenements sur les phrases 'Voir le tableau des pièces du joueur1' et 'Voir plateau Stratego en données.'
    socket.on("strategoDonneesClient",(grille)=>{
        console.table(grille);
    })
    socket.on("tableauPiecesJ1Client",grille=>{
        console.table(grille);
    })

})();