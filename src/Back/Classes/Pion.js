class Pion{
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
    typeDeLaPiece(){
        return this.type;
    }
    getForce(){
        return this.force
    }
}
module.exports = Pion;

