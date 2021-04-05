(function(){

    console.log("Le script 'StartGame.js' est lancé.")

    tableauStratego = ()=> {

        let conteneurJeu = document.getElementById("conteneurDuJeu");
        let tbl = document.createElement('table')
        let tblTbody = document.createElement('tbody')

        for(let i=0;i<10;i++){
            let rowTbody = document.createElement('tr');
            for(let a=0;a<10;a++){
                let contentTD = document.createElement('td');
                contentTD.id=a+(i*10);

                rowTbody.appendChild(contentTD);
            }
            tblTbody.appendChild(rowTbody);
        }
        tbl.appendChild(tblTbody);
        tbl.id="tableauStratego";
        conteneurJeu.appendChild(tbl);
    }

    tableauStratego();

    socket.emit("game");

    socket.emit("introductionServer"); // Phrases d'introduction en fonction des 2 joueurs de la room

    socket.emit("caseGriseServer")

    socket.emit("tableauPionsServerBuild"); // Crée dynamiquement le tableau des pions du joueur

    socket.emit("tableauPionsServerContent"); // Affiche les valeurs pour le tableau des pions

    socket.emit("preparationListenersServer"); // Applique les listeners sur le tableau des pions et le plateau

    /* -------------------------------- Définitions des sockets coté client -------------------------------- */

    // Affiche correctement les données au dessus du plateau
    socket.on("introductionClient",(userName,userNumber,enemyName,enemyNumber,roomID)=>{
        console.log("Appel de la fonction 'introductionClient' coté client.");
        document.getElementById("currentPlayer").textContent=userName;
        document.getElementById('playerID').textContent=userNumber;
        document.getElementById('enemy').textContent=enemyName;
        document.getElementById('enemyID').textContent=enemyNumber;
        document.getElementById("roomNbr").textContent=roomID;
    });

    // Grise les cases adverses et non cliquables
    socket.on("caseGriseClientON",(deb,fin,playerNbr)=>{
        console.log("Appel de la fonction 'caseGriseClient' coté client pour le joueur",playerNbr,".");
        for(let i=deb;i<=fin;i++){
            document.getElementById(i).style.background="silver";
            document.getElementById(i).style.opacity=0.5;
        }
    })

    socket.on("caseGriseClientOFF",(deb,fin,playerNbr)=>{
        console.log("Appel de la fonction 'caseGriseClient' coté client pour le joueur",playerNbr,".");
        for(let i=deb;i<=fin;i++){
            document.getElementById(i).style.background="white";
            document.getElementById(i).style.opacity=0;
        }
    })

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

        tblcaption.textContent = "" // Sans caption NE PAS ENLEVER
        tblThead.innerHTML="<tr><td>Type</td><td>Nombre restant</td><td>Force</td></tr>"; // Mode barbare

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

    // Applique un listener sur les cases du tableau des pions du joueur ET du plateau Stratego
    socket.on('preparationListenersClient',(playerNbr)=>{
        console.log("Appel de la fonction 'preparationListenersClient' coté client pour le joueur",playerNbr,".");

        let tbodyPion = (playerNbr==1) ? document.getElementById("tableauPionsJ1").children[2] : document.getElementById("tableauPionsJ2").children[2];
        // let pieceActuelle = (playerNbr==1) ? document.getElementById("pieceActuelleRouge") : document.getElementById("pieceActuelleBleue");
        let pieceActuelle;
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
                // On demande au serveur si le type de pion de la case cliquée est encore disponible pour le joueur
                socket.emit("TypePionsDispoDemandeServer",tbodyPion.children[i].children[0].textContent,i);
                socket.on("TypePionsDispoReponseServer",(reponse,indice)=>{
                    if(i==indice){ // Sans ça, tous les sockets de ce type appelés précedemment sont appelés une fois de plus
                        if(reponse>0){ // Si oui, on effectue un certain nombre d'actions
                            message.textContent='';
                            if(precedentIndice == undefined){
                                precedentIndice = i;
                            } else {
                                tbodyPion.children[precedentIndice].style.background="white"; // Si precedentIndice existe, on met en blanc la case précédement cliquée
                                precedentIndice=i;
                            }
                            tbodyPion.children[i].style.background=playerColor; // On selectionne la case cliquée
                            pieceActuelle=tbodyPion.children[i].children[0].textContent; // On actualise
                        } else { // Sinon, on ne fait rien.
                            message.textContent="Vous ne pouvez pas selectionné un pion de type '"+tbodyPion.children[i].children[0].textContent+"' car le nombre restant de cette pièce est nul.";
                            //console.log("Vous ne pouvez plus selectionné cette pièce : nombre restant épuisé.");
                        }
                    }
                })
            })
        }
        // ---------------- Evenements sur le plateau Stratego ----------------
        let caseDispo = (playerNbr==1) ? 60 : 0;
        for(let idCaseStratego=caseDispo;idCaseStratego<(caseDispo+40);idCaseStratego++){
            document.getElementById(idCaseStratego).addEventListener("click",()=>{
                if(pieceActuelle!=undefined){ // Un type de pions a été préalablement selectionné
                    // On envoie la pièce actuellement selectionnée, l'id (1-100) de la case cliqué et le nombre de fois qu'on a cliqué sur cette case
                    socket.emit("decrementationTypePionJoueurServer",pieceActuelle,idCaseStratego,nbrClicsCase[idCaseStratego]);
                    // On reçoie si on peut poser la pièce, son image si oui, confirmation de l'id de la case, type de pièce selectionné,
                    // id du type de la pièce qu'il y avait avant sur cette case (joueur1.tableOfPawns) pour incrémentation vu qu'on l'a enlevée
                    // Ainsi que le nombre de clics sur la case cliquée
                    socket.on("decrementationTypePionJoueurClient",(possible,image,idCase,indiceDuTypePion,idPiecePop,nbrDeClicsServeur)=>{

                        if(idCaseStratego==idCase){ // Permet d'empecher l'interconnexion des sockets 'decrementationTypePionJoueur1Client' des cases différentes
                            if(nbrClicsCase[idCase]==nbrDeClicsServeur){ // Permet d'empecher l'interconnexion des sockets 'decrementationTypePionJoueur1Client' lorsqu'on clique plus d'une fois sur la MEME case
                                nbrClicsCase[idCase]++;
                                if(possible==true){ // Si (possible == true) ==> type.nbrRestant > 0, la decrementation en données a déjà été faite, on affiche donc l'image au client
                                    let img = document.createElement("img")
                                    img.src  = (playerNbr ===1) ? "../Images/icons/"+image+"r.svg":"../Images/icons/"+image+"b.svg";
                                    img.classList.add(image + "strength")
                                    img.style.height = "65px";
                                    img.style.width = "55px";

                                    if(!document.getElementById(idCaseStratego).children.length){
                                        document.getElementById(idCaseStratego).appendChild(img) // On affiche l'image dans la case du plateau Stratego
                                    } else {
                                        document.getElementById(idCaseStratego).replaceChild(img,document.getElementById(idCaseStratego).firstChild)
                                    }
                                    tbodyPion.children[indiceDuTypePion].children[1].textContent--;
                                    if(idPiecePop!=undefined){ // S'il y avait une pièce précédemment, on incremente sur le tableau le nbr restant de cette pièce
                                        tbodyPion.children[idPiecePop].children[1].textContent++; //
                                    }
                                }else{
                                    //console.log("Vous ne pouvez plus poser de pièce du type '"+pieceActuelle+"'.")
                                    document.getElementById("message").textContent="Vous ne pouvez plus poser de pièce du type '"+pieceActuelle+"'.";
                                }
                            }
                        }
                    });
                }
            })
        }
    });

    /* ---------------- Information pour débuger ---------------- */
    // Evenements sur les phrases 'Voir le tableau des pièces du joueur1' et 'Voir plateau Stratego en données.'

    /*
    socket.on("tableauPiecesJoueurClient",grille=>{
        console.table(grille);
    })
    socket.on("grilleCommuneClient",(grille)=>{
        console.table(grille);
    })
    */

    /* ---------------- Boutons cliquables ---------------- */

    socket.on("readyButtonClient",(ready)=>{
        if (ready) {
            document.getElementById("ready").style.background = "green";
            for (let i = 0; i < 100; i++) {
                let el = document.getElementById(i.toString()),
                    elClone = el.cloneNode(true);
                el.parentNode.replaceChild(elClone, el);
                if (i !== 52 && i !== 53 && i !== 57 && i !== 56 && i !== 42 && i !== 43 && i !== 47 && i !== 46) {
                    EventHandler.addCaseDrop(document.getElementById(i.toString()))
                } else {

                    document.getElementById(i.toString()).innerText = ' ';
                    document.getElementById(i.toString()).style.color = "pink"
                }
            }
        }else{document.getElementById("message").textContent="Veuillez poser toutes vos pièces avant d'appuyer sur le bouton 'Prêt'."}

    });

    socket.on("pieceAleatoireClient",(tableauPiece,caseIdDebut,playerID)=>{
        document.getElementById("message").textContent="";
        console.log("Appel de 'pieceAleatoireClient' coté client.")
        let color = (playerID==1) ? "r" : "b";
        let indice=0;
        // Affichage des images sur le plateau Stratego
        for(let i=caseIdDebut;i<(caseIdDebut+40);i++){
            if(!document.getElementById(i).children.length){
                let img = document.createElement("img")
                img.src  = "../Images/icons/"+tableauPiece[indice]+color+".svg";
                img.classList.add(tableauPiece[indice++] + "strength")
                img.style.height = "65px";
                img.style.width = "55px";
                document.getElementById(i).appendChild(img)
            }
        }
        // Mise à 0 de tous les pions dans le tableau des pions
        let tbodyPions = (playerID==1) ? document.getElementById("tableauPionsJ1") : document.getElementById("tableauPionsJ2")
        for(let i=0;i<12;i++){
            tbodyPions.children[2].children[i].children[1].textContent=0;
            tbodyPions.children[2].children[i].style.background="white";
        }
    })

    socket.on("gameBegin",(player)=> {
        document.getElementById("ready").parentNode.removeChild(document.getElementById("ready")); // Supprime le bouton "Prêt"
        document.getElementById("aleatoire").parentNode.removeChild(document.getElementById("aleatoire")); // Supprime le bouton "Pièces aléatoires"
        let tableID = (player === 1) ? "tableauPionsJ1" : "tableauPionsJ2";

        let tab = document.getElementById(tableID);
        tab.children = null;
        let caseDispo = (player === 1) ? 0 : 60;

        for (let i = caseDispo; i < caseDispo + 40; i++) {
            let img = document.createElement("img")
            if (player === 1) {
                img.src = "../Images/icons/blue.svg"

            } else{
                img.src = "../Images/icons/red.svg"

            }
            img.style.height = "60px";
            img.style.width = "60px";
            img.classList.add("enemy")
            img.addEventListener("dragenter",(event)=>{

                if(event.target.parentElement.style.backgroundImage != "") {
                    event.target.parentElement.style.backgroundColor = "white"
                    event.target.parentElement.style.opacity = "0.5"
                }
            })
            img.addEventListener("dragleave",(event)=>{

                if(event.target.parentElement.style.backgroundImage != "") {
                    event.target.parentElement.style.backgroundColor = ""
                    event.target.parentElement.style.opacity = ""
                }
            })


            let test = document.getElementById(i.toString())
            if(!test.firstChild)
                test.appendChild(img)
        }
        caseDispo = (player === 1) ? 60 : 0;
        for (let i = caseDispo; i < caseDispo + 40; i++) {
            if(document.getElementById(i.toString()).firstChild) {
                let td = document.getElementById(i.toString())
                EventHandler.addEvent(td.firstChild);
                td.firstChild.draggable = 'true';
            }
        }
        let deb = (player==1) ? 0 : 40;
        
        for(let i=deb;i<(deb+60);i++){
            document.getElementById(i).style.background="";
            document.getElementById(i).style.opacity='';
        }
    });
    socket.on("PieceMoved",(start,end)=>{
        let previousLocation = document.getElementById(start.toString()).firstChild
        let newLocation = document.getElementById(end.toString())
        newLocation.appendChild(previousLocation);
    });

    socket.on("attackLost",(start,end,piece,player)=>{
        document.getElementById(start).removeChild(document.getElementById(start).firstChild)
        let newLocation = document.getElementById(end.toString())
        newLocation.firstChild.src = (player === 1) ? "../Images/icons/"+piece+"b.svg" : "../Images/icons/"+ piece+"r.svg";
        newLocation.firstChild.style.height = "65px";
        newLocation.firstChild.style.width = "55px";
    })

    socket.on("attackWon",(start,end)=>{
        let previousLocation = document.getElementById(start.toString()).firstChild
        let newLocation = document.getElementById(end.toString())
        newLocation.removeChild(newLocation.firstChild)
        newLocation.appendChild(previousLocation);
    });

    socket.on("attackEven",(start,end)=>{
        document.getElementById(start).removeChild(document.getElementById(start).firstChild)
        document.getElementById(end).removeChild(document.getElementById(end).firstChild)
    });

    socket.on("defenseWon",(start)=>{
        document.getElementById(start).removeChild(document.getElementById(start).firstChild)
    })

    socket.on("defenseLost",(start,end,piece,player)=>{
        let previousLocation = document.getElementById(start.toString()).firstChild

        let newLocation = document.getElementById(end.toString())
        newLocation.removeChild(newLocation.firstChild)
        newLocation.appendChild(previousLocation);
        newLocation.firstChild.src = (player === 1) ?  "../Images/icons/"+piece+"r.svg" : "../Images/icons/"+ piece+"b.svg";
        newLocation.firstChild.style.height = "65px";
        newLocation.firstChild.style.width = "55px";
    });

    socket.on("Victory",()=>{
        //alert("Victory!")
        let modal = document.getElementById("modal");
        modal.style.display = "block";
        document.getElementById("modalText").innerHTML = 'Félicitations, vous avez gagné !';
        for (let i = 0; i < 100; i++) {
            let el = document.getElementById(i.toString()),
                elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);
        }
    })

    socket.on("Defeat",()=>{
        //alert("Defeat!")
        let modal = document.getElementById("modal");
        modal.style.display = "block";
        document.getElementById("modalText").innerHTML = 'Dommage, vous avez perdu !';
        for (let i = 0; i < 100; i++) {
            let el = document.getElementById(i.toString()),
                elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);
        }
    })

    socket.on("winByFF",()=>{
        //alert("Your opponent gave up!")
        let modal = document.getElementById("modal");
        modal.style.display = "block";
        document.getElementById("modalText").innerHTML = "Votre adversaire s'est rendu.";
        for (let i = 0; i < 100; i++) {
            let el = document.getElementById(i.toString()),
                elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);
        }
    })


})();

let testReady = 0;