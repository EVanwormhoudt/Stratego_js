class StrategoView{
	constructor(game){
		this.game=game;
		this.piecesActuelleRouge=undefined; 
		this.piecesActuelleBleue=undefined;
	}
	// Informations : tableau des pièces = 2ème tableau


	// ----------------------------------- Tout ce qui concerne le tableau des pièces -----------------------------------

	tableOfPiecesContent(){ // Affiche dans le tableau des pièces, les types et nombre restant des différentes pièces des 2 joueurs
		//playernumber
		let tbodyPionsRouges=document.getElementById("pionsRouges").children[1];
		let tbodyPionsBleus=document.getElementById("pionsBleus").children[1];
		for(let i=0;i<12;i++){
			let celluleRouge=tbodyPionsRouges.children[i]; // On se situe sur le i-ème + 1 <tr> 
			let celluleBleu=tbodyPionsBleus.children[i]; // On se situe sur le i-ème + 1 <tr> 

			celluleRouge.children[0].innerHTML=this.game.tableOfPawnsOfPlayer(1)[i].name;
			celluleRouge.children[1].innerHTML=this.game.tableOfPawnsOfPlayer(1)[i].nombreRestant;
			celluleRouge.children[2].innerHTML=this.game.tableOfPawnsOfPlayer(1)[i].force;

			celluleBleu.children[0].innerHTML=this.game.tableOfPawnsOfPlayer(2)[i].name;
			celluleBleu.children[1].innerHTML=this.game.tableOfPawnsOfPlayer(2)[i].nombreRestant;
			celluleBleu.children[2].innerHTML=this.game.tableOfPawnsOfPlayer(2)[i].force;
		}
	}
	piecesListener(){ // Evénements sur les cases du tableau des pièces
		let pieces = ["Bombes","Maréchal","Général","Colonels","Commandants","Capitaines","Lieutenants","Sergents","Démineurs","Eclaireurs","Espion","Drapeau"];
		let tablePiecesRouges=document.getElementById("pionsRouges");
		let tbodyTableRouge=tablePiecesRouges.children[1];

		let tablePiecesBleues=document.getElementById("pionsBleus");
		let tbodyTableBleu=tablePiecesBleues.children[1];

		let pieceActuelleRouge=document.getElementById("pieceActuelleRouge");
		let pieceActuelleBleue=document.getElementById("pieceActuelleBleue");

		for(let i=0;i<12;i++){
			let linesRouges=tbodyTableRouge.children[i];
			let linesBleues=tbodyTableBleu.children[i];

			linesRouges.addEventListener("click",()=>{
				if(this.piecesActuelleRouge!=undefined){
					tbodyTableRouge.children[pieces.indexOf(this.piecesActuelleRouge)].style.background="white"; // Déselectionne visuellement la case précédement cliquée dans le tableau
				}
				linesRouges.style.background="red"; // La case actuellement cliquée est selectionnée visuellement
				this.piecesActuelleRouge=pieces[i]; // L'attribut 'pieceActuelle' se voit affectée le type de la pièce correspondant à la case cliquée dans le tableau
				pieceActuelleRouge.innerHTML=pieces[i]; // Actualise textuellement le type de la pièce correspondant à la case cliquée
			})

			linesBleues.addEventListener("click",()=>{
				if(this.piecesActuelleBleue!=undefined){
					tbodyTableBleu.children[pieces.indexOf(this.piecesActuelleBleue)].style.background="white"; // Déselectionne visuellement la case précédement cliquée dans le tableau
				}
				linesBleues.style.background="blue"; // La case actuellement cliquée est selectionnée visuellement
				this.piecesActuelleBleue=pieces[i]; // L'attribut 'pieceActuelle' se voit affectée le type de la pièce correspondant à la case cliquée dans le tableau
				pieceActuelleBleue.innerHTML=pieces[i]; // Actualise textuellement le type de la pièce correspondant à la case cliquée
			})
		}
	}

	// ----------------------------------- Tout ce qui concerne le plateau stratego -----------------------------------

	lac(){ // Les cases des lacs sont visuellement discernables
		let lacCase=["43","44","47","48","53","54","57","58"];
		for(let i=0;i<lacCase.length;i++){
			// Visuellement
			let cellule=document.getElementById(lacCase[i]);
			cellule.style.background="black";
			// En données
			let x=lacCase[i]/10;
			let y=lacCase[i]%10-1;
			this.game.setBoxContent(Math.floor(x),y,null); // Math.floor(x) = arrondi à l'entier le plus proche SANS ALLER AU DESSUS
		}
	}

	plateauCaseListener(){ // Evenement sur les cases du plateau 
		for(let i=61;i<=100;i++){ // Il y a un événement uniquement sur les 4 premières rangées
			let celluleRouge=document.getElementById(i);
			let celluleBleue=document.getElementById(i-60);
			// Affichage en console ET en données parfait avec cette manière
			let w = (i-1)/10; // bizarrement cela renvoit un nombre décimal et non un entier, donc il faut arrondir avec toFixed() ensuite
			let z = (i-1)%10;

			celluleRouge.addEventListener('click',()=>{
				if(this.piecesActuelleRouge!=undefined){
					if(this.game.getBoxContent(Math.floor(w),z)==undefined){
						if(this.game.joueur1.nombreRestantDuType(this.piecesActuelleRouge)>0){
							console.log("Pièce rouge mise en : (",Math.floor(w+1),",",z+1,")."); // Vérifier la couleur
							this.game.setBoxContent(Math.floor(w),z,this.game.joueur1.forceDuType(this.piecesActuelleRouge)); // Actualisation en mémoire
							celluleRouge.innerHTML=this.game.joueur1.forceDuType(this.piecesActuelleRouge); // Affiche la force du type de la pièce selectionnée, dans le plateau
							this.game.joueur1.decrNombreRestantDuType(this.piecesActuelleRouge); // Décrémente en données le nombre restant de pièce que l'on peut poser, du type en question
							// Décrémente visuellement le nombre restant de pièce que l'on peut poser, du type en question, optimisable mais fonctionnel
							let tbodyPionsRouge = document.getElementById("pionsRouges").children[1];
							let i=0;
							while(tbodyPionsRouge.children[i].children[0].innerHTML!=this.piecesActuelleRouge){
								i++;
							}
							tbodyPionsRouge.children[i].children[1].innerHTML=--(tbodyPionsRouge.children[i].children[1].innerHTML);
							document.getElementById("error").innerHTML=""; // Supprime la préalable apparution du message d'erreur
						}else{
							document.getElementById("error").innerHTML="Vous ne pouvez plus poser de pièce rouge de ce type.";
							console.log("Vous ne pouvez plus poser de pièce rouge de ce type.");
						}
					}
					else { 
						document.getElementById("error").innerHTML="Il y a déjà une pièce rouge en ("+(Math.floor(w+1))+","+(z+1)+").";
						console.log("Il y a déjà une pièce rouge en (",Math.floor(w+1),",",z+1,").");
					}
				}else{
					document.getElementById("error").innerHTML="Vous n'avez pas saisi de pièce rouge à positionner. Veuillez en choisir une avant de cliquer sur une case du plateau.";
					console.log("Vous n'avez pas saisi de pièce rouge à positionner. Veuillez en choisir une avant de cliquer sur une case du plateau");
				}
			});

			celluleBleue.addEventListener('click',()=>{
				if(this.piecesActuelleBleue!=undefined){
					if(this.game.getBoxContent(Math.floor(w)-6,z)==undefined){
						if(this.game.joueur2.nombreRestantDuType(this.piecesActuelleBleue)>0){
							console.log("Pièce bleue mise en : (",Math.floor(w+1)-6,",",z+1,")."); // Vérifier la couleur
							this.game.setBoxContent(Math.floor(w)-6,z,this.game.joueur2.forceDuType(this.piecesActuelleBleue)); // Actualisation en mémoire
							celluleBleue.innerHTML=this.game.joueur2.forceDuType(this.piecesActuelleBleue); // Affiche la force du type de la pièce selectionnée, dans le plateau
							this.game.joueur2.decrNombreRestantDuType(this.piecesActuelleBleue); // Décrémente en données le nombre restant de pièce que l'on peut poser, du type en question
							// Décrémente visuellement le nombre restant de pièce que l'on peut poser, du type en question, optimisable mais fonctionnel
							let tbodyPionsBleue = document.getElementById("pionsBleus").children[1];
							let i=0;
							while(tbodyPionsBleue.children[i].children[0].innerHTML!=this.piecesActuelleBleue){
								i++;
							}
							tbodyPionsBleue.children[i].children[1].innerHTML=--(tbodyPionsBleue.children[i].children[1].innerHTML);
							document.getElementById("error").innerHTML=""; // Supprime la préalable apparution du message d'erreur
						}else{
							document.getElementById("error").innerHTML="Vous ne pouvez plus poser de pièce bleue de ce type.";
							console.log("Vous ne pouvez plus poser de pièce bleue de ce type.");
						}
					} else { 
						document.getElementById("error").innerHTML="Il y a déjà une pièce bleue en ("+(Math.floor(w+1)-6)+","+(z+1)+").";
						console.log("Il y a déjà une pièce bleue en (",Math.floor(w+1)-6,",",z+1,").");
					}
				}else{
					document.getElementById("error").innerHTML="Vous n'avez pas saisi de pièce bleue à positionner. Veuillez en choisir une avant de cliquer sur une case du plateau.";
					console.log("Vous n'avez pas saisi de pièce bleue à positionner. Veuillez en choisir une avant de cliquer sur une case du plateau");
				}
			});
		}
	}
	preparationListener(){ // Toutes les fonctions ici

	}
	// ----------------------------------- Fonctions pour phase de test -----------------------------------
	tabDesPions(){
		document.getElementById("tabDesPions").addEventListener('click',()=>{
			console.table(this.game.joueur1.tableOfPawns);
			console.table(this.game.joueur2.tableOfPawns);
		})
	}
	tabDuPlateau(){
		document.getElementById("tabDuPlateau").addEventListener('click',()=>{this.game.viewTable()});
	}
}