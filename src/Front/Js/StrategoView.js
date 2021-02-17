class TicTacToeView
{
	constructor(game, name)
	{
		this.game = game;
        this.name = name;
        this.listeners();
        this.player();
	}
	
	listeners() 
	{
        let tab = document.getElementById("morpion");
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                tab.rows[i].cells[j].addEventListener('click', () => {
                    this.click_event(i, j);
                });
            }
        }
		let button = document.getElementById("reset");
        
                button.addEventListener('click', () => {
				window.location.reload();
            })
		}
	
	click_event(x, y) 
	{
		this.game.play(x, y);
		this.turn();
		if (this.game.hasWinner() || this.game.numberMove == 9) { this.displayWinner(); }
		if (!this.game.isFinished()) { this.player(); }
    }
	
	turn() 
	{
        let tab = document.getElementById("morpion");
        let img;
        for (let i = 0; i < 3; ++i) 
		{
            for (let j = 0; j < 3; ++j) 
			{

                for (let enfants = 0; enfants < tab.rows[i].cells[j].childElementCount; ++enfants)
				{
                    tab.rows[i].cells[j].removeChild(tab.rows[i].cells[j].firstChild);
                }

                if (this.game.grid[i][j] != null) 
				{
					let img = document.createElement('img');
					tab.rows[i].cells[j].appendChild(img);
					img.id='image';
					this.game.grid[i][j] == 0 ? img.src='cercle.png' : img.src='croix.png';
				}
				
            }
        }
    }
	
	player()
	{
		let playerName = document.getElementById("player_number");
		this.game.currentPlayer == 0  ? playerName.textContent = "C'est au joueur Nemo": playerName.textContent = "C'est au joueur Doris";
	}
	
	displayWinner() 
	{
		let playerName = document.getElementById("player_number");
        if (this.game.isFinished()) {
          let playerWinner = "";
            !this.game.getWinner() ? playerWinner = " Nemo": playerWinner = "Doris";
            playerName.textContent = playerWinner + " a gagné !";
        }
        else { playerWinner.textContent = "Il y a égalité !"; }
    }
	
}