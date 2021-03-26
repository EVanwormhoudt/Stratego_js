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
        this.time = 0;
        this.winner = undefined;
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

    verifMove(player,start,end){
        if(this.grille[Math.trunc(start/10)][start%10].force === 0 ||this.grille[Math.trunc(start/10)][start%10].force === 100){
            return false;
        }
        if(this.grille[Math.trunc(start/10)][start%10].force === 2){
            if(!(Math.trunc(start/10) === Math.trunc(end/10) || start%10 === end%10) ){
                return false
            }
        }
        else{
            if(end !== start + 1 || end !== start -1 || end !== start -10 || end !== start + 10){
                return false;
            }
        }
        if(this.grille[Math.trunc(end/10)][end%10].player === player){
            return false;
        }
        return true;

    }
    isFinished(){
        if(!this.joueur1.tableOfPawnsView()[12].nombreRestant){
            this.winner = 2;
            return true;
        }
        if(!this.joueur2.tableOfPawnsView()[12].nombreRestant){
            this.winner = 1;
            return true;
        }
        let nbr = 10;
        for(let i of this.joueur1.tableOfPawnsView()){
            if(!(i == this.joueur1.tableOfPawnsView()[0] || i == this.joueur1.tableOfPawnsView()[11])){
                if(i.nombreRestant === 0)
                    nbr--;
            }
        }
        if(!nbr) {
            this.winner = 2;
            return true;
        }
        nbr = 10;
        for(let i of this.joueur2.tableOfPawnsView()){
            if(!(i == this.joueur2.tableOfPawnsView()[0] || i == this.joueur2.tableOfPawnsView()[11])){
                if(i.nombreRestant === 0)
                    nbr--;
            }
        }
        if(!nbr){
            this.winner = 1;
            return true;
        }

        return false;
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

