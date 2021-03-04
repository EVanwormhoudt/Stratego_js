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

        this.winner = undefined;
        this.time = new Date;
        this.time = this.time.getHours()* 3600+ this.time.getMinutes() * 60 + this.time.getSeconds();
        this.grille=this.initGrille();
        this.pieces = new Array(24);
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