class Pions{

    constructor(type,force,joueur,x,y){
        this.type=type;
        this.force=force;
        this.joueur=joueur;
        this.x=x;
        this.y=y;
    }

}

class Player{
    constructor(name){
        this.name=name;
        this.color=undefined;
        // Tableau des pions du joueur
        this.tableOfPawns = new Array(20);
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
    
        if(joueur1 instanceof Player){
            this.joueur1=joueur1;
            this.joueur1.setColor("Rouge")
        } else { 
            console.log("Le joueur 1 n'a pas pu être correctement enregistré.")
            // Trouver un moyen d'indiquer qu'il ne faut pas lancer la mise en place des pions.
        }
        
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
}