class Pions{

    constructor(type,force,joueur,x,y){
        this.type=type; // Nom de la pièce
        this.force=force;
        this.joueur=joueur; // Joueur auquel est rattaché cette pièce, la couleur est déductible donc l'attribut "couleur" n'existe pas

        this.x=x; // Coordonnées en ligne de la pièce sur le plateau/grille
        this.y=y; // Coordonnées en colonne de la pièce sur le plateau/grille

        this.selected = false; // Attribut permettant le futur mouvement d'un pion
        this.discovered=false; // Attribut permettant de savoir si le joueur adverse connait cette pièce (suite à une préalable bataille)
        this.alive=true;
    }

}

class Player{
    constructor(name){
        this.name=name;
        this.color=undefined;
        // Tableau des pions du joueur
        this.tableOfPawns = [
            {name:"Bombes",nombreRestant:"6",force:"100"},
            {name:"Maréchal",nombreRestant:"1",force:"10"},
            {name:"Général",nombreRestant:"1",force:"9"},
            {name:"Colonels",nombreRestant:"2",force:"8"},
            {name:"Commandants",nombreRestant:"3",force:"7"},
            {name:"Capitaines",nombreRestant:"4",force:"6"},
            {name:"Lieutenants",nombreRestant:"4",force:"5"},
            {name:"Sergents",nombreRestant:"4",force:"4"},
            {name:"Démineurs",nombreRestant:"5",force:"3"},
            {name:"Eclaireurs",nombreRestant:"8",force:"2"},
            {name:"Espion",nombreRestant:"1",force:"1"},
            {name:"Drapeau",nombreRestant:"1",force:"0"},
        
        ];
    }
    getName(){
        return this.name;
    }
    getColor(){
        return this.color;
    }
    setColor(newColor){
        this.color=newColor;
    }
    viewTableOfPawns(){
        console.table(this.tableOfPawns);
    }
    tableOfPawnsView(){
        return this.tableOfPawns;
    }
    nombreRestantDuType(type){
        for(const element of this.tableOfPawns){
            if(element.name==type){
                return element.nombreRestant;
            }
        }
    }
    forceDuType(type){
        for(const element of this.tableOfPawns){
            if(element.name==type){
                return element.force;
            }
        }
    }
    decrNombreRestantDuType(type){
        for(const element of this.tableOfPawns){
            if(element.name==type){
                element.nombreRestant--;
            }
        }
    }
}

class Game{
    // Toutes les cases ont comme contenu "undefined"
    initGrille(){
        let grille = new Array(10);
        for(let i=0;i<10;i++){
            grille[i]= new Array(10);
        }
        return grille;
    }

    constructor(joueur1,joueur2){
        // Le 1er argument se verra affecter directement la couleur rouge (couleur pouvant potentiellement changer dans les prochaines versions)
        if(joueur1 instanceof Player){
            this.joueur1=joueur1;
            this.joueur1.setColor("Rouge")
        } else { 
            console.log("Le joueur 1 n'a pas pu être correctement enregistré.")
            // Trouver un moyen d'indiquer qu'il ne faut pas lancer la mise en place des pions.
        }

        // Le 2eme argument se verra affecter directement la couleur bleu (couleur pouvant potentiellement changer dans les prochaines versions)
        if(joueur2 instanceof Player){
            this.joueur2=joueur2;
            this.joueur2.setColor("Bleu")
        } else { 
            console.log("Le joueur 2 n'a pas pu être correctement enregistré.")
            // Trouver un moyen d'indiquer qu'il ne faut pas lancer la mise en place des pions.
        }

        this.grille=this.initGrille();
    }

    isGridEmpty(){
        for(let ligne=0;ligne<10;ligne++){
            for(let colonne=0;colonne<10;colonne++){
                if(this.grille[ligne][colonne]!=undefined){
                    return false;
                }         
            }
        }
        return true;
    }
    // Lorsque tous les joueurs ont posé leurs pièces, cette fonction retourne "true"
    isGridReady(){
        for(const element of this.tableOfPawnsOfPlayer(1)){
            if(element.nombreRestant!=0){
                return false;
            }
        }
        for(const element of this.tableOfPawnsOfPlayer(2)){
            if(element.nombreRestant!=0){
                return false;
            }
        }
        return true;
    }
    getBoxContent(x,y){
        return this.grille[x][y];
    }
    setBoxContent(x,y,newContent){
        this.grille[x][y]=newContent;
    }
    player1name(){
        return this.joueur1.getName();
    }
    player1color(){
        return this.joueur1.getColor();
    }
    player2name(){
        return this.joueur2.getName();
    }
    player2color(){
        return this.joueur2.getColor();
    }
    viewTable(){
        console.table(this.grille);
    }
    tableOfPawnsOfPlayer(playerNumber){
        if(playerNumber==1){
            return this.joueur1.tableOfPawns;
        } else if (playerNumber==2){
            return this.joueur2.tableOfPawns;
        }else{
            return false;
        }
    }
}