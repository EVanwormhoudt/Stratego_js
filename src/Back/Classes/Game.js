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
        // J1 : 0 et J2 : 0 correspondent aux pièces du type en question déjà posées
        /*
        this.pionsInfos = [
            {name:"Bombes",nombreRestant:"6",force:"100",j1:0,j2:0},
            {name:"Maréchal",nombreRestant:"1",force:"10",j1:0,j2:0},
            {name:"Général",nombreRestant:"1",force:"9",j1:0,j2:0},
            {name:"Colonels",nombreRestant:"2",force:"8",j1:0,j2:0},
            {name:"Commandants",nombreRestant:"3",force:"7",j1:0,j2:0},
            {name:"Capitaines",nombreRestant:"4",force:"6",j1:0,j2:0},
me:"Lieutenants",nombreRestant:"4",force:"5",j1:0,j2:0},
            {name:"Sergents",nombreRestant:"4",force:"4",j1:0,j2:0},
            {name:"Démineurs",nombreRestant:"5",force:"3",j1:0,j2:0},
            {name:"Eclaireurs",nombreRestant:"8",force:"2",j1:0,j2:0},
            {name:"Espion",nombreRestant:"1",force:"1",j1:0,j2:0},
            {name:"Drapeau",nombreRestant:"1",force:"0",j1:0,j2:0},
        ];
        */
    }
    joueur1(){
        return this.joueur1;
    }
    joueur2(){
        return this.joueur2;

    }

    viewTable(){
        console.table(this.grille);
    }
    pionsInfos(){
        return this.pionsInfos;
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
    /*
    viewPionsInfos(){
        console.log(this.pionsInfos);
    }
    */

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

