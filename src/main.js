(function() {
    // Initialisation du jeu
    let player1 = new Player("Samuel")
    let player2 = new Player("Géraldine")
    let game = new Game(player1,player2);
    

    console.log(game.joueur1)
    console.log("Le joueur 1 s'appelle :",game.player1name(),", il est de l'équipe :",game.player1color())
    console.log("Le joueur 2 s'appelle :",game.player2name(),", elle est de l'équipe :",game.player2color())
    game.viewTable();
    console.log("La case de coordonnées (2,3) a le statut : ",game.getBoxContent(5,3))
    console.log("Le plateau est-il vide ?",game.isGridEmpty());

    // Usage des différentes pièces
    let cavalier = new Pions("Cavalier",9,player1.getName(),2,3);

})();
