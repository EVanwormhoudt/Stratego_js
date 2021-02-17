class Game{
    initGrille(){
        let grille = new Array(10);
        for(let i=0;i<10;i++){
            grille[i]= new Array(10);
        }
        console.log('JS');
        return grille;
    }

    constructor(joueur1,joueur2){
        this.joueur1=joueur1;
        this.joueur2=joueur2;
        this.grille=this.initGrille();
    }

    viewTable(){
        console.table(this.grille);
    }
}

class Pions{

    constructor(type,force,joueur,x,y){
        this.type=type;
        this.force=force;
        this.joueur=joueur;
        this.x=x;
        this.y=y;
    }

}