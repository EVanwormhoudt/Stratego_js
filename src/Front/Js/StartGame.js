(function(){

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

    tableauPionsPris = () => {

        let pieceName = ["Maréchal","Général","Colonels","Commandants","Capitaines","Lieutenants","Sergents","Démineurs","Eclaireurs","Espion","Drapeau","Bombes"];
        let pieceMax = [1,1,2,3,4,4,4,5,8,1,1];
        let conteneurJeu = document.getElementById("tableauDuJeu");
        conteneurJeu.style.padding="10px";

        let tbl = document.createElement('table')
        tbl.id="tableauPionsPris";

        let tblcaption = document.createElement('caption');
        tblcaption.textContent="";

        let tblThead= document.createElement('thead')
        let rowThead = document.createElement('tr');
        //rowThead.innerHTML="<td>Pièces Rouges prises</td><td>Pièces Bleues prises</td>";
        tblThead.appendChild(rowThead);

        let tblTbody= document.createElement('tbody');
        let compteur=0;

        for(let i=10;i>=0;i--){
            let rowTbody = document.createElement('tr');
            rowTbody.style.padding="10px";
            let typePiece = document.createElement("td");
            typePiece.textContent=pieceName[compteur];
            rowTbody.appendChild(typePiece);

            for(let a=0;a<2;a++){
                let colonneTbody = document.createElement("td");
                let img = document.createElement("img")
                let color = (a==1) ? "r" : "b";
                img.src  = "../Images/icons/"+i+color+".svg";
                img.classList.add(i + "strength")
                img.style.height = "65px";
                img.style.width = "55px";
                //console.log("")
                colonneTbody.appendChild(img);
                let txt = document.createElement("span");
                txt.innerHTML="<span id="+i+color+">0</span>/"+pieceMax[compteur];
                colonneTbody.appendChild(txt);

                rowTbody.appendChild(colonneTbody);
            }
            if(compteur!=pieceName.length)compteur++;
            tblTbody.appendChild(rowTbody);
        }

        let bombeRow = document.createElement('tr');
        let bomdeTd1 = document.createElement('td');
        bomdeTd1.textContent="Bombes";
        bombeRow.appendChild(bomdeTd1);

        for(let a=0;a<2;a++){
            let bombeTDnext = document.createElement("td");
            let img = document.createElement("img")
            let color = (a==1) ? "r" : "b";
            img.src  = "../Images/icons/100"+color+".svg";
            img.classList.add(100 + "strength")
            img.style.height = "65px";
            img.style.width = "55px";
            bombeTDnext.appendChild(img);
            let txt = document.createElement("span");
            txt.innerHTML="<span id="+100+color+">0</span>/6";
            bombeTDnext.appendChild(txt);
            bombeRow.appendChild(bombeTDnext);
        }
        tblTbody.appendChild(bombeRow);

        tbl.appendChild(tblcaption);
        tbl.appendChild(tblThead);
        tbl.appendChild(tblTbody);

        conteneurJeu.appendChild(tbl);
    }

    /* -------------------------------- Ce qui s'exécute lors de l'arrivée sur game.html -------------------------------- */

    tableauStratego(); // Affichage du plateau Stratego

    socket.emit("game");

    socket.emit("introductionServer"); // Phrases d'introduction en fonction des 2 joueurs de la room

    socket.emit("caseGriseServer") // Grise les cases sur lesquelles le joueur ne peut cliquer

    socket.emit("tableauPionsServerBuild"); // Crée dynamiquement le tableau des pions du joueur

    socket.emit("tableauPionsServerContent"); // Affiche les valeurs pour le tableau des pions du joueur

    socket.emit("preparationListenersServer"); // Applique les listeners sur le tableau des pions et le plateau

    /* -------------------------------- Définitions des sockets coté client -------------------------------- */

    // Affiche correctement les données au dessus du plateau
    socket.on("introductionClient",(userName,userNumber,enemyName,enemyNumber,roomID)=>{
        console.log("Appel de la fonction 'introductionClient' coté client.");
        document.getElementById("currentPlayer").textContent=userName;
        //document.getElementById('playerID').textContent=userNumber;
        document.getElementById('enemy').textContent=enemyName;
        //document.getElementById('enemyID').textContent=enemyNumber;
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
        let tableauDuJeu = document.getElementById('tableauDuJeu');
        let color = (playerNbr==1) ? "red" : "blue";
        tableauDuJeu.style.border="1px solid "+color;
        tableauDuJeu.style.padding="10px";

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
                column.style.width="300px";
                column.classList.add("tdTaille")
                column.textContent="";
                row.appendChild(column);
            }
            tblTbody.appendChild(row);
        }

        tbl.appendChild(tblcaption);
        tbl.appendChild(tblThead);
        tbl.appendChild(tblTbody);
        tableauDuJeu.appendChild(tbl);
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
    socket.on('preparationListenersClient',(playerNbr)=>{
        console.log("Appel de la fonction 'preparationListenersClient' coté client pour le joueur",playerNbr,".");

        let tbodyPion = (playerNbr==1) ? document.getElementById("tableauPionsJ1").children[2] : document.getElementById("tableauPionsJ2").children[2];
        let pieceActuelle;
        let message=document.getElementById("message");
        let precedentIndice = undefined;
        let nbrClicsCase = new Array(150); // Important pour gérer les sockets lorsqu'il y a plus d'un clic sur une même case.
        for(let i=0;i<nbrClicsCase.length;i++){
            nbrClicsCase[i]=0;
        }

        // ---------------- Evenements sur le tableau des pions ----------------
        let playerColor = (playerNbr==1) ? "#cc0011ff" : "#0000ccff";
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
                                tbodyPion.children[precedentIndice].style.background="black"; // Si precedentIndice existe, on met en blanc la case précédement cliquée
                                precedentIndice=i;
                            }
                            tbodyPion.children[i].style.background=playerColor; // On selectionne la case cliquée
                            pieceActuelle=tbodyPion.children[i].children[0].textContent; // On actualise
                        } else { // Sinon, on ne fait rien.
                            message.textContent="Vous ne pouvez pas selectionné un pion de type '"+tbodyPion.children[i].children[0].textContent+"' car le nombre restant de cette pièce est nul.";
                            console.log("Vous ne pouvez plus selectionné cette pièce : nombre restant épuisé.");
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
                                    // a modifier pour que la taille de l'image soit régie par la taille de la case dans laquelle elle se trouve


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
                                    console.log("Vous ne pouvez plus poser de pièce du type '"+pieceActuelle+"'.")
                                    document.getElementById("message").textContent="Vous ne pouvez plus poser de pièce du type '"+pieceActuelle+"'.";
                                }
                            }
                        }
                    });
                }
            })
        }
    });

    /* ---------------- Boutons cliquables ---------------- */
    //socket pour quand le joueur appuie sur le bouton ready,  on retire les évenements qui servaient à placer les pièces, et on définit les lacs
    socket.on("readyButtonClient",(ready)=>{
        if (ready) {
            console.log("Vous êtes prêt. En attente de l'autre joueur.");
            document.getElementById("message").textContent="Vous êtes prêt. En attente de l'autre joueur.";
            document.getElementById("ready").style.background = "yellowgreen";
            document.getElementById("ready").style.color = "black";
            for (let i = 0; i < 100; i++) {
                let el = document.getElementById(i.toString()),
                    elClone = el.cloneNode(true);
                el.parentNode.replaceChild(elClone, el);
                if (i !== 52 && i !== 53 && i !== 57 && i !== 56 && i !== 42 && i !== 43 && i !== 47 && i !== 46) {
                    EventHandler.addCaseDrop(document.getElementById(i.toString()))
                } else {

                    document.getElementById(i.toString()).innerText = ' ';
                    document.getElementById(i.toString()).style.color = "pink"; //ça marche et c'est efficace critiquez pas
                }
            }
        }else{document.getElementById("message").textContent="Veuillez poser toutes vos pièces avant d'appuyer sur le bouton 'Prêt'."}

    });

    //fonction qui va remplir chez le client mais aussi pour le serveur le tableau de pionts de manière aléatoire
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
            tbodyPions.children[2].children[i].style.background="black";
        }
    })

    //Fonction qui gère le début de la partie, cad qu'elle ajoute les pionts d'en face,
    //Et ajoute les nouveaux evenements. On retire aussi le fond qui indiquait où placer les pièces
    socket.on("gameBegin",(player)=> {
        let tableauDuJeu = document.getElementById("tableauDuJeu");
        tableauDuJeu.removeChild(document.getElementById("tableauPionsJ"+player)); // Supprime le tableau des pions à poser
        document.getElementById("message").textContent="";

        tableauPionsPris(); // Affichage du tableau des pions pris

        document.getElementById("ready").parentNode.removeChild(document.getElementById("ready")); // Supprime le bouton "Prêt"
        document.getElementById("aleatoire").parentNode.removeChild(document.getElementById("aleatoire")); // Supprime le bouton "Pièces aléatoires"

        let tourDeQui = (player==1) ? "C'est à votre tour de jouer" : "C'est au tour du joueur adverse";
        document.getElementById("phase").textContent=tourDeQui;

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

    //Reception coté client du déplacement
    socket.on("PieceMoved",(start,end,turnOf)=>{
        let previousLocation = document.getElementById(start.toString()).firstChild
        let newLocation = document.getElementById(end.toString())
        newLocation.appendChild(previousLocation);
        let message = (turnOf=="you") ? document.getElementById("phase").textContent="C'est à votre tour de jouer" : document.getElementById("phase").textContent="C'est au tour du joueur adverse";
    });
    //lorsque le joueur a attaqué et qu'il a perdu
    socket.on("attackLost",(start,end,piece,player,looser)=>{
        let playerColor = (player==1) ? "r" : "b";
        document.getElementById(looser+playerColor).textContent++;
        console.log("attackLost : La pièce de couleur ",playerColor," et de force ",looser," meurt.")

        document.getElementById(start).removeChild(document.getElementById(start).firstChild)
        let newLocation = document.getElementById(end.toString())
        newLocation.firstChild.src = (player === 1) ? "../Images/icons/"+piece+"b.svg" : "../Images/icons/"+ piece+"r.svg";
        newLocation.firstChild.style.height = "65px";
        newLocation.firstChild.style.width = "55px";
        document.getElementById("phase").textContent="C'est au tour du joueur adverse";
    })

    //lorsque le joueur a attaqué et qu'il a gagné
    socket.on("attackWon",(start,end,looser,player)=>{
        let ennemyColor = (player==1) ? "b" : "r";
        document.getElementById(looser+ennemyColor).textContent++;
        console.log("attackWon : La pièce de couleur ",ennemyColor," et de force ",looser," meurt.")

        let previousLocation = document.getElementById(start.toString()).firstChild
        let newLocation = document.getElementById(end.toString())
        newLocation.removeChild(newLocation.firstChild)
        newLocation.appendChild(previousLocation);
        document.getElementById("phase").textContent="C'est au tour du joueur adverse";
    });

    //lorsqu'un des deux joueurs a attaqué et que c'était la même pièce
    socket.on("attackEven",(start,end,looser,player)=>{
        document.getElementById(looser+"b").textContent++;
        document.getElementById(looser+"r").textContent++;
        console.log("attackEven : La pièce rouge et la pièce bleue, de force ",looser," meurent.")

        document.getElementById(start).removeChild(document.getElementById(start).firstChild)
        document.getElementById(end).removeChild(document.getElementById(end).firstChild)
        document.getElementById("phase").textContent="C'est au tour du joueur adverse";
    });

    //Evenement quand l'adversaire à attaquer une pièce et le joueur a gagné
    socket.on("defenseWon",(start,looser,ennemyPlayer)=>{
        let ennemyColor = (ennemyPlayer==1) ? "r" : "b";
        document.getElementById(looser+ennemyColor).textContent++;
        console.log("defenseWon : La piece de couleur ",ennemyColor," et de force ",looser," meurt.")

        document.getElementById(start).removeChild(document.getElementById(start).firstChild)
        document.getElementById("phase").textContent="C'est à votre tour de jouer";
    })

    //Evenement quand l'adversaire à attaquer une pièce et le joueur a perdu
    socket.on("defenseLost",(start,end,piece,ennemyPlayer,looser)=>{
        let playerColor = (ennemyPlayer==1) ? "b" : "r";
        document.getElementById(looser+playerColor).textContent++;
        console.log(" defenseLost : La piece de couleur ",playerColor," et de force ",looser," meurt.")

        let previousLocation = document.getElementById(start.toString()).firstChild

        let newLocation = document.getElementById(end.toString())
        newLocation.removeChild(newLocation.firstChild)
        newLocation.appendChild(previousLocation);
        newLocation.firstChild.src = (ennemyPlayer === 1) ?  "../Images/icons/"+piece+"r.svg" : "../Images/icons/"+ piece+"b.svg";
        newLocation.firstChild.style.height = "65px";
        newLocation.firstChild.style.width = "55px";
        document.getElementById("phase").textContent="C'est à votre tour de jouer";

    });

    //Evenement quand le joueur a gagné la partie
    socket.on("Victory",(data)=>{
        //alert("Victory!")
        let winner,looser;
        if (data.winner === 1){
            winner = data.joueur1;
            looser = data.joueur2;
        }
        else{
            winner = data.joueur2;
            looser = data.joueur1;
        }
        document.getElementById("winner").innerHTML ="Le gagnant est " +winner;
        document.getElementById("looser").innerHTML = "Le perdant est " + looser;
        document.getElementById("time").innerHTML = "temps : " + Math.trunc(data.time / 3600)+"h " + Math.trunc((data.time% 3600) / 60)+"m " +  data.time% 60+"s";
        let modal = document.getElementById("modal");
        modal.style.display = "block";
        document.getElementById("modalText").innerHTML = 'Félicitations, vous avez gagné !';
        for (let i = 0; i < 100; i++) {
            let el = document.getElementById(i.toString()),
                elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);
        }
    })

    //Evenement quand le joueur a perdu la partie
    socket.on("Defeat",(data)=>{
        //alert("Defeat!")
        let winner,looser;
        if (data.winner === 1){
            winner = data.joueur1;
            looser = data.joueur2;
        }
        else{
            winner = data.joueur2;
            looser = data.joueur1;
        }
        document.getElementById("winner").innerHTML ="Le gagnant est " +winner;
        document.getElementById("looser").innerHTML = "Le perdant est " + looser;
        document.getElementById("time").innerHTML = "temps : " + Math.trunc(data.time / 3600)+"h " + Math.trunc((data.time% 3600) / 60)+"m " +  data.time% 60+"s";
        let modal = document.getElementById("modal");
        modal.style.display = "block";

        document.getElementById("modalText").innerHTML = 'Dommage, vous avez perdu !';
        for (let i = 0; i < 100; i++) {
            let el = document.getElementById(i.toString()),
                elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);
        }
    })

    //Evenement quand l'adversaire s'est déconnecté ou a abandonné
    socket.on("winByFF",(data)=>{
        //alert("Your opponent gave up!")
        if(data) {
            let winner, looser;
            if (data.winner === 1) {
                winner = data.joueur1;
                looser = data.joueur2;
            } else {
                winner = data.joueur2;
                looser = data.joueur1;
            }
            document.getElementById("winner").innerHTML = "Le gagnant est " + winner;
            document.getElementById("looser").innerHTML = "Le perdant est " + looser;
            document.getElementById("time").innerHTML = "temps : " + Math.trunc(data.time / 3600)+"h " + Math.trunc((data.time% 3600) / 60)+"m " +  data.time% 60+"s";
        }
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