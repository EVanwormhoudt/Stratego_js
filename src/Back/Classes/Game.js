class Game{
    initGrille(){
        let grille = new Array(10);
        for(let i=0;i<10;i++){
            grille[i]= new Array(10);
        }
        return grille;
    }

    constructor(joueur1,joueur2){
        this.joueur1=joueur1; // class Player
        this.joueur2=joueur2;
        this.grille=this.initGrille();
    }
    joueur1(){
        return this.joueur1;
    }
    joueur2(){
        return this.joueur2;
    }
    setCase(x,y,content){
        this.grille[x][y]=content;
    }
    getCase(x,y){
        return this.grille[x][y];
    }
    isCaseEmpty(x,y){
        if(this.grille[x][y]===undefined){
            return true;
        }else{return false;}
    }
    returnGrille(){
        return this.grille;
    }
    consoleLogTable(){
        console.log(this.grille);
    }

    exportData(){
        let data = {
            joueur1 : this.joueur1.getName(),
            joueur2 : this.joueur2.getName(),
            tabj1 : this.joueur1.tableOfPawnsView(),
            tabj2: this.joueur2.tableOfPawnsView(),
            time : this.time,
            winner : this.winner
        }
    }

}

module.exports = Game;

