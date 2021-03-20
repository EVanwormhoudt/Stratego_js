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
        // J1 : 0 et J2 : 0 correspondent aux pièces du type en question déjà posées
        /*
        this.pionsInfos = [
            {name:"Bombes",nombreRestant:"6",force:"100",j1:0,j2:0},
            {name:"Maréchal",nombreRestant:"1",force:"10",j1:0,j2:0},
            {name:"Général",nombreRestant:"1",force:"9",j1:0,j2:0},
            {name:"Colonels",nombreRestant:"2",force:"8",j1:0,j2:0},
            {name:"Commandants",nombreRestant:"3",force:"7",j1:0,j2:0},
            {name:"Capitaines",nombreRestant:"4",force:"6",j1:0,j2:0},
            {name:"Lieutenants",nombreRestant:"4",force:"5",j1:0,j2:0},
            {name:"Sergents",nombreRestant:"4",force:"4",j1:0,j2:0},
            {name:"Démineurs",nombreRestant:"5",force:"3",j1:0,j2:0},
            {name:"Eclaireurs",nombreRestant:"8",force:"2",j1:0,j2:0},
            {name:"Espion",nombreRestant:"1",force:"1",j1:0,j2:0},
            {name:"Drapeau",nombreRestant:"1",force:"0",j1:0,j2:0},
        ];
        */
    }
    test(){
        console.log("OKKKK")
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
    /*
    viewPionsInfos(){
        console.log(this.pionsInfos);
    }
    */
}

module.exports = Game;

