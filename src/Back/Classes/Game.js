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
        this.ready = 0;
        let now = new Date();
        this.time = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() ;  //faut pas jouer a minuit lol
        this.winner = undefined;
        this.turn = 1;
    }
    getjoueur1(){
        return this.joueur1;
    }
    getjoueur2(){
        return this.joueur2;

    }
    getTurn(){
        return this.turn;
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

    attack(start,end,player){
        let s = parseInt(start)
        let e = parseInt(end)
        this.turn = this.turn %2 +1;
        if(this.grille[Math.trunc(s/10)][s%10].getForce() == 3 && this.grille[Math.trunc(e/10)][e%10].getForce() == 100 ){
            if(player === 1){
                this.joueur2.tableOfPawns = this.joueur2.decrNombreRestantDuType('100')
            }
            else{
                this.joueur1.tableOfPawns = this.joueur1.decrNombreRestantDuType('100')
            }
            this.grille[Math.trunc(e/10)][e%10] = this.grille[Math.trunc(s/10)][s%10];
            this.grille[Math.trunc(e/10)][e%10].discovered = true;
            this.grille[Math.trunc(s/10)][s%10] = null;
            return 1;
        }
        else if(this.grille[Math.trunc(s/10)][s%10].getForce() == 1 && this.grille[Math.trunc(e/10)][e%10].getForce() == 10 ){
            if(player == 1){
                this.joueur2.tableOfPawns = this.joueur2.decrNombreRestantDuType('10')
            }
            else{
                this.joueur1.tableOfPawns = this.joueur1.decrNombreRestantDuType('10')
            }
            this.grille[Math.trunc(e/10)][e%10] = this.grille[Math.trunc(s/10)][s%10];
            this.grille[Math.trunc(e/10)][e%10].discovered = true;
            this.grille[Math.trunc(s/10)][s%10] = null;
            return 1;
        }
        else if(parseInt(this.grille[Math.trunc(s/10)][s%10].getForce()) < parseInt(this.grille[Math.trunc(e/10)][e%10].getForce())){
            if(player == 1){
                this.joueur1.tableOfPawns = this.joueur1.decrNombreRestantDuType(this.grille[Math.trunc(s/10)][s%10].getForce())
            }
            else{
                this.joueur2.tableOfPawns = this.joueur2.decrNombreRestantDuType(this.grille[Math.trunc(s/10)][s%10].getForce())
            }
            this.grille[Math.trunc(s/10)][s%10] = null;
            this.grille[Math.trunc(e/10)][e%10].discovered = true;
            return -1;
        }
        else if(parseInt(this.grille[Math.trunc(s/10)][s%10].getForce()) === parseInt(this.grille[Math.trunc(e/10)][e%10].getForce())){
            this.joueur1.tableOfPawns = this.joueur1.decrNombreRestantDuType(this.grille[Math.trunc(s/10)][s%10].getForce())
            this.joueur2.tableOfPawns = this.joueur2.decrNombreRestantDuType(this.grille[Math.trunc(e/10)][e%10].getForce())
            this.grille[Math.trunc(s/10)][s%10] = null;
            this.grille[Math.trunc(e/10)][e%10] = null;
            return 0
        }
        else if(parseInt(this.grille[Math.trunc(start/10)][start%10].force) > parseInt(this.grille[Math.trunc(e/10)][e%10].force)){
            if(player == 1){
                this.joueur2.tableOfPawns = this.joueur2.decrNombreRestantDuType(this.grille[Math.trunc(e/10)][e%10].force)
            }
            else{
                this.joueur1.tableOfPawns = this.joueur1.decrNombreRestantDuType(this.grille[Math.trunc(s/10)][s%10].force)
            }
            this.grille[Math.trunc(e/10)][e%10] = this.grille[Math.trunc(s/10)][s%10];
            this.grille[Math.trunc(e/10)][e%10].discovered = true;
            this.grille[Math.trunc(s/10)][s%10] = null;
            return 1;
        }

    }

    move(start,end,player){
        let s = parseInt(start)
        let e = parseInt(end)
        this.turn = this.turn %2 +1;
        this.grille[Math.trunc(e/10)][e%10] = this.grille[Math.trunc(s/10)][s%10];
        this.grille[Math.trunc(s/10)][s%10] = null;
    }


    verifMove(player,start,end){

        let s = parseInt(start)
        let e = parseInt(end)
        if(this.grille[Math.trunc(s/10)][(s%10)].force == 0 ||this.grille[Math.trunc(s/10)][(s%10)].force == 100){
            return false;
        }
        if(this.grille[Math.trunc(start/10)][start%10].force === 2){
            if(!(Math.trunc(start/10) === Math.trunc(end/10) || start%10 === end%10) ){
                return false
            }
        }
        else{
            if(e != s + 1 || e != s -1 || e != s -10 || e != s + 10){
                return false;
            }
        }

        return true;

    }
    isFinished(){

        if(this.joueur1.tableOfPawnsView()[11].nombreRestant =='0'){
            this.winner = 2;
            return true;
        }
        if(this.joueur2.tableOfPawnsView()[11].nombreRestant == '0'){
            this.winner = 1;
            return true;
        }
        let nbr = 10;
        for(let i of this.joueur1.tableOfPawnsView()){
            if(!(i == this.joueur1.tableOfPawnsView()[0] || i == this.joueur1.tableOfPawnsView()[11])){
                if(i.nombreRestant == 0)
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
                if(i.nombreRestant == 0)
                    nbr--;
            }
        }
        if(!nbr){
            this.winner = 1;
            return true;
        }
        return false;
    }
    setTime(){
        let now = new Date();
        let gameTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() ;
        if( gameTime - this.time < 0){
            this.time = gameTime + 3600*24 - this.time;
        }
        else {
            this.time = gameTime - this.time;
        }
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

