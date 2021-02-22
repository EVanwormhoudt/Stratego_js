class Game{
    initGrille(){
        let grille = new Array(10);
        for(let i=0;i<10;i++){
            grille[i]= new Array(10);
        }
        return grille;
    }

    constructor(joueur1,joueur2){
        this.joueur1=joueur1;
        this.joueur2=joueur2;
        this.grille=this.initGrille();
        this.time = new Date;
        this.time = this.time.getHours()* 3600+ this.time.getMinutes() * 60 + this.time.getSeconds();
        this.winner = undefined;
        this.pieces = new Array(24);

    }

    remplirValue(){
        this.time = 10
        this.winner = 1;
        for(let i = 0; i<= 23;i++){
            this.pieces[i] = 1;
        }
    }

    getPiece(i){
        return this.pieces[i]
    }

    viewTable(){
        console.table(this.grille);
    }
}

module.exports = Game;

