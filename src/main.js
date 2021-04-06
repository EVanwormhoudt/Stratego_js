/**** Import npm libs ****/

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require("express-session")({
    // CIR2-chat encode in sha256
    secret: "eb8fcc253281389225b4f7872f2336918ddc7f689e1fc41b64d5c4f378cdc438",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000,
        secure: false
    }
});



const sharedsession = require("express-socket.io-session");
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const mysql = require('mysql');
const fs = require('fs');
const bcrypt = require('bcrypt');

const urlencodedParser = bodyParser.urlencoded({ extended: false });


const Game = require('./Back/Classes/Game')
const Pion = require('./Back/Classes/Pion')
const Player = require('./Back/Classes/Player')
const scoreHandler = require("./Back/Modules/scoreHandler")


app.use(express.static(__dirname + '/front/'));
app.use(urlencodedParser);
app.use(session);

const roomnbr = 10
let rooms = new Array(roomnbr)
let games =  new Array(roomnbr)

for(let i = 0;i<roomnbr;i++){
    rooms[i] = new Array(3);
    rooms[i][0] = 0;
}
scoreHandler.readScore()

// Le serveur ecoute sur ce port
http.listen(8880, () => {
    console.log('Serveur lancé sur le port 8880');
})

// Connexion à la base de donnée
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stratego"
});

con.connect( err => {
    if (err) throw err;
    else console.log('Connexion a mysql effectuee');
});
/***************/

io.use(sharedsession(session, {
    // Session automatiquement sauvegardée en cas de modification
    autoSave: true
}));

// redirige vers la page d'accueil
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/accueil.html');
    let sessionData = req.session;
});

// redirige vers la page de connexion si l'URL contient '/login'
app.get("/login", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/login.html');
});


// redirige vers la page d'enregistrement si l'URL contient '/register'
app.get("/register", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/register.html');
});


// redirige vers la page d'accueil si l'URL contient '/logout'
app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});

// redirige vers la page d'attente si l'URL contient '/waitingRoom'
app.get('/waitingRoom', (req,res) => {

    if(req.session.username) {
        res.sendFile(__dirname + '/Front/Html/salleAttente.html');
    }
    else{
        res.sendFile(__dirname + '/Front/Html/accueil.html');
    }
});

// redirige vers la page de jeu si l'URL contient '/game'
app.get('/game',(req,res)=>{
    if(req.session.username && req.session.player) {
        res.sendFile(__dirname + '/Front/Html/Game.html');
    }
    else
        res.redirect('/');

});

/******************/

// Directement après la connexion d'un socket au serveur
io.on('connection', (socket) => {
    socket.on("register", (info) => {
        let sql = "INSERT INTO users VALUES (default,?,?,?)";
        con.query(sql, [info[0], info[1],info[2]], (err, res)=> {
            if (err)throw err;

            console.log("personne ajouté")
        });
    });

    socket.on("isSession",()=>{
        socket.emit("onSession",socket.handshake.session.username)
    });

    socket.on("username", (info) => {
        let sql = "SELECT username FROM users WHERE username = ?";
        con.query(sql, [info[0]], (err, res) => {
            if (err) throw err;
            socket.emit("resultUser",res)
        });
    });
    socket.on("password", (info) => {
        let sql = "SELECT password FROM users WHERE username = ?";
        con.query(sql, [info[0]], (err, res) => {
            if (err) throw err;
            socket.emit("resultPass", res[0].password);
        });
    });

    socket.on("crypt", (info) =>{
        bcrypt.hash(info,10, function (err, res){
            if (err) throw err;
            socket.emit("resultCrypt",res);
        });
    });

    socket.on("decrypt", (info) => {
        bcrypt.compare(info[0], info[1], function (err, res) {
            if (err) throw err;
            socket.emit("resultDecrypt", res);
        });
    });

    socket.on("getRoom",()=>{
        for(let i = 0;i<roomnbr;i++){
            if(rooms[i][0] !== 2 && (i === 0||rooms[i-1][0]===2)){
                rooms[i][0] +=1; // Nbr de joueurs
                socket.handshake.session.player = rooms[i][0];
                socket.join("room"+i);
                rooms[i][rooms[i][0]] = socket.handshake.session.username
                socket.handshake.session.room = i;
                if(rooms[i][0] === 2){
                    let joueur1 = new Player(rooms[socket.handshake.session.room][1])
                    let joueur2 = new Player(rooms[socket.handshake.session.room][2]);
                    games[socket.handshake.session.room] = new Game(joueur1,joueur2);
                    games[socket.handshake.session.room].ready = 0;
                    socket.to("room"+i).broadcast.emit("redirectJ1"); // Envoie uniquement à l'autre joueur cette socket
                    socket.emit("redirectJ2"); // socket envoyé uniquement à l'emetteur
                }
                i = roomnbr;
            }
        }
    });

    socket.on('disconnect', () => {
        if(socket.handshake.session.room !== undefined && !games[socket.handshake.session.room]){
            rooms[socket.handshake.session.room][0] = 0;
            rooms[socket.handshake.session.room][1] = null;
        }
        if(socket.handshake.session.room !== undefined && games[socket.handshake.session.room] && socket.handshake.session.ready !==undefined){
            if( games[socket.handshake.session.room].ready === 2){
                socket.broadcast.to("room"+socket.handshake.session.room).emit("winByFF")
                games[socket.handshake.session.room].setTime();
                games[socket.handshake.session.room].winner = socket.handshake.session.player % 2 + 1;
                scoreHandler.writePersonnalScore(games[socket.handshake.session.room].exportData());
                scoreHandler.writeScore(games[socket.handshake.session.room].exportData());
            }
            games[socket.handshake.session.room][0] = 0
            games[socket.handshake.session.room][1] = null;
            games[socket.handshake.session.room][2] = null;
            let srvSockets = io.sockets.sockets;
            srvSockets.forEach(user => {
                if (user.handshake.session.room === socket.handshake.session.room){
                    user.handshake.session.player = undefined;
                    user.handshake.session.room = undefined;
                    user.handshake.session.ready = undefined;
                }
            });
            socket.handshake.session.player = undefined;
            socket.handshake.session.room = undefined;
            socket.handshake.session.ready = undefined;

        }
    });

    // --------------- Socket pour la page game.html ---------------

    socket.on("game",()=>{
        socket.join("room"+socket.handshake.session.room);
        socket.handshake.session.ready = false;

        // Affiche les informations générales (joueur adverse,room, phase de préparation)
        socket.on("introductionServer",()=>{
            console.log("Appel de la fonction 'introduction' dans la room "+socket.handshake.session.room+" coté serveur pour le joueur",socket.handshake.session.player,"(",socket.handshake.session.username,").")
            let enemyID = (socket.handshake.session.player==1) ? 2 : 1;
            socket.emit("introductionClient",socket.handshake.session.username,socket.handshake.session.player,rooms[socket.handshake.session.room][enemyID],enemyID,socket.handshake.session.room ); // NomDuJoueur,idDuJoueur,NomJoueurEnnemi,IdJoueurEnnemi,idRoom
        })
        
        // Grise les cases adverses, question d'intuitivité 
        socket.on("caseGriseServer",()=>{
            console.log("Appel de la fonction 'caseGriseServer' dans la room "+socket.handshake.session.room+" coté serveur pour le joueur",socket.handshake.session.player,"(",socket.handshake.session.username,").")
            let deb = (socket.handshake.session.player==1) ? 0 : 40;
            let fin = (socket.handshake.session.player==1) ? 59 : 99;
            socket.emit("caseGriseClientON",deb,fin),socket.handshake.session.player;
        })

        // Appelle la socket coté client qui crée dynamiquement le tableau des pions du joueur, en fonction de 'playerNbr' (J1 ou J2)
        socket.on("tableauPionsServerBuild",()=>{
            console.log("Appel de la fonction 'tableauPionsServerBuild' dans la room "+socket.handshake.session.room+" coté serveur pour le joueur",socket.handshake.session.player,"(",socket.handshake.session.username,").")
            socket.emit("tableauPionsClientBuild",socket.handshake.session.player);
        })

        // Appelle la socket coté client qui remplit le tableau des pions des 2 joueurs
        socket.on("tableauPionsServerContent",()=>{
            console.log("Appel de la fonction 'tableauPionsServerContent' dans la room "+socket.handshake.session.room+" coté serveur pour le joueur",socket.handshake.session.player,"(",socket.handshake.session.username,").")
            let tableauDesPionsJoueur = (socket.handshake.session.player==1) ? games[socket.handshake.session.room].joueur1.tableOfPawns : games[socket.handshake.session.room].joueur2.tableOfPawns;
            socket.emit('tableauPionsClientContent',tableauDesPionsJoueur,socket.handshake.session.player);
       })

        // Appelle la socket coté client qui applique des listeners sur le tableau des pions du joueur
        socket.on('preparationListenersServer',()=>{
            console.log("Appel de la fonction 'preparationListenersServer' dans la room "+socket.handshake.session.room+" coté serveur pour le joueur",socket.handshake.session.player,"(",socket.handshake.session.username,").")
            socket.emit('preparationListenersClient',socket.handshake.session.player);
        })

        // Reçois le type de la pièce actuellement selectionnée par le joueur et renvoie le nombre restant du type de cette pièce dispo
        socket.on("TypePionsDispoDemandeServer",(typePions,i)=>{
            if(socket.handshake.session.player == 1){
            socket.emit("TypePionsDispoReponseServer",games[socket.handshake.session.room].joueur1.nombreRestantDuType(typePions),i);
            }else{socket.emit("TypePionsDispoReponseServer",games[socket.handshake.session.room].joueur2.nombreRestantDuType(typePions),i);}
        });

        // Lors du clic sur une case, on vérifie si 'nbrRestant' de la pièce est > 0 (possible), s'il y avait déjà une pièce sur la case auquel cas on la suppr du plateau en données 
        // et incrémente nbrRestant de cette pièce, etc...
        socket.on("decrementationTypePionJoueurServer",(typePiece,idCaseStratego,nbrDeClics)=>{
            let possible;
            let x = Math.floor((idCaseStratego)/10);
            let y = (idCaseStratego)%10;
            let idPiecePop = undefined;
            let gameJoueur = (socket.handshake.session.player == 1) ? games[socket.handshake.session.room].joueur1 : games[socket.handshake.session.room].joueur2;
           
            if(gameJoueur.tableOfPawns[gameJoueur.indiceDuType(typePiece)].nombreRestant>0){
                if(games[socket.handshake.session.room].grille[x][y]!=null){ // S'il y a déjà une pièce là où on clique
                    let typePrecedentePiece = games[socket.handshake.session.room].grille[x][y].typeDeLaPiece(); // On recupère le type de cette pièce
                    gameJoueur.tableOfPawns[gameJoueur.indiceDuType(typePrecedentePiece)].nombreRestant++; // On incrémente en données le nbr restant de cette pièce
                    idPiecePop = gameJoueur.indiceDuType(typePrecedentePiece);
                }
                gameJoueur.tableOfPawns[gameJoueur.indiceDuType(typePiece)].nombreRestant--;
                // Transmission en données de la case où mettre la pièce
                let piece = new Pion(typePiece,gameJoueur.forceDuType(typePiece),gameJoueur.getName(),x,y);
                games[socket.handshake.session.room].grille[x][y]=piece;
                possible=true;
            } else { 
                possible=false;
                //console.log("Le joueur "+socket.handshake.session.username+" ne peut plus poser de pièce du type "+typePiece)
            }
            socket.emit("decrementationTypePionJoueurClient",possible,gameJoueur.forceDuType(typePiece),idCaseStratego,gameJoueur.indiceDuType(typePiece),idPiecePop,nbrDeClics);
        });

        /* -------------------------------- Effets des boutons cliquables -------------------------------- */

        // Bouton 'Pret' 
        socket.on('readyButtonServer',()=>{
            if(!socket.handshake.session.ready){ // Pour empecher games[roomNbr].ready==2 à partir d'une seule fenetre
                let joueurGrille = (socket.handshake.session.player==1) ? games[socket.handshake.session.room].joueur1.tableOfPawns : games[socket.handshake.session.room].joueur2.tableOfPawns;
                let joueurReady = joueurGrille.every(elem=>elem.nombreRestant==0);

                if(joueurReady){
                    games[socket.handshake.session.room].ready++;
                    socket.handshake.session.ready=true;
                }

                socket.emit("readyButtonClient",joueurReady);

                if(games[socket.handshake.session.room].ready === 2){
                    games[socket.handshake.session.room].getjoueur1().Remplirtab();
                    games[socket.handshake.session.room].getjoueur2().Remplirtab()
                    socket.emit("gameBegin",(socket.handshake.session.player))
                    socket.broadcast.to("room"+socket.handshake.session.room).emit("gameBegin",((socket.handshake.session.player)%2 +1));
                }
            }
        })

        // Bouton 'Mise en place des pièces aléatoires' : place aléatoirement les pièces non posées du joueur
        socket.on('pieceAleatoireServer',()=>{
            //console.log("Appel de 'pieceAleatoireServer' coté serveur.")
            let joueur = (socket.handshake.session.player==1) ? games[socket.handshake.session.room].joueur1 : games[socket.handshake.session.room].joueur2;
            let start = (socket.handshake.session.player==1) ? 60 : 0;
            let start2 = start;
            let pieceArray=new Array;

            function getRandomArbitrary(min, max) { // Renvoie une valeur pseudo-aléatoire entre min compris et max exclu
                return Math.floor( (Math.random() * (max - min) + min) ) ;
            }

            while(!joueur.tableOfPawns.every(element=>element.nombreRestant==0)){
                let x = Math.floor((start)/10);
                let y = start%10;
                let indice=getRandomArbitrary(0,12);

                if(games[socket.handshake.session.room].grille[x][y]==undefined){
                    if(joueur.nombreRestantIndice(indice)==0){
                        do{indice=getRandomArbitrary(0,12)}while(joueur.nombreRestantIndice(indice)==0);
                    }
                    games[socket.handshake.session.room].grille[x][y] = new Pion(joueur.typeDeLaPiece(indice),joueur.forceDuType(joueur.typeDeLaPiece(indice)),joueur.getName(),x,y);
                    pieceArray.push(joueur.forceDuType(joueur.typeDeLaPiece(indice)));
                    joueur.tableOfPawns[indice].nombreRestant--;
                }
                start++;
            }
            socket.emit("pieceAleatoireClient",pieceArray,start2,socket.handshake.session.player);
        })
    })

    // ------------------------------ Sockets pour la phase de jeu ------------------------------

    socket.on("giveUp",()=>{
        //console.log("giveUp")
        socket.broadcast.to("room"+socket.handshake.session.room).emit("winByFF")
        games[socket.handshake.session.room].setTime();
        games[socket.handshake.session.room].winner = socket.handshake.session.player % 2 + 1;
        scoreHandler.writePersonnalScore(games[socket.handshake.session.room].exportData());
        scoreHandler.writeScore(games[socket.handshake.session.room].exportData());
        games[socket.handshake.session.room][0] = 0
        games[socket.handshake.session.room][1] = null;
        games[socket.handshake.session.room][2] = null;
        let srvSockets = io.sockets.sockets;
        srvSockets.forEach(user => {
            if (user.handshake.session.room === socket.handshake.session.room){
                user.handshake.session.player = undefined;
                user.handshake.session.room = undefined;
                user.handshake.session.ready = undefined;
            }
        });
        socket.handshake.session.player = undefined;
        socket.handshake.session.room = undefined;
        socket.handshake.session.ready = undefined;

    })

    socket.on("getTurn",()=>{
        socket.emit("sendTurn",(games[socket.handshake.session.room].turn ===socket.handshake.session.player) );
    })

    socket.on("move",(start,end)=>{
        // console.log("Move")

        if(!games[socket.handshake.session.room].verifMove(socket.handshake.session.player,start,end)) {
            socket.emit("moveImpossible");
            // console.log("moveImpossible")
            return
        }
        games[socket.handshake.session.room].move(start,end,socket.handshake.session.player);
        socket.broadcast.to("room"+socket.handshake.session.room).emit("PieceMoved",start,end);
        socket.emit("PieceMoved",start,end);
    });

    socket.on("attack",(start,end)=>{
        if(!games[socket.handshake.session.room].verifMove(socket.handshake.session.player,start,end)) {
            socket.emit("moveImpossible");
            //console.log("moveImpossible")
            return
        }
        let result = games[socket.handshake.session.room].attack(start,end,socket.handshake.session.player);
        if(result[0]===-1){
            // console.log("attackLost")
            socket.emit("attackLost",start,end,
                games[socket.handshake.session.room].getCase(Math.trunc(end/10),end%10).force,socket.handshake.session.player,result[1]);
            socket.broadcast.to("room"+socket.handshake.session.room).emit("defenseWon",start,result[1],socket.handshake.session.player);
        }
        if(result[0] ===0){
            // console.log("attackEven")
            socket.emit("attackEven",start,end,result[1],socket.handshake.session.player);
            socket.broadcast.to("room"+socket.handshake.session.room).emit("attackEven",start,end,result[1],socket.handshake.session.player);
        }
        if(result[0] ===1){
            // console.log("attackWon")
            socket.emit("attackWon",start,end,result[1],socket.handshake.session.player);
            socket.broadcast.to("room"+socket.handshake.session.room).emit("defenseLost",start,end
                ,games[socket.handshake.session.room].getCase(Math.trunc(end/10),end%10).force,socket.handshake.session.player,result[1]);
        }
        if(games[socket.handshake.session.room].isFinished()){
            games[socket.handshake.session.room].setTime();
            scoreHandler.writePersonnalScore(games[socket.handshake.session.room].exportData())
            scoreHandler.writeScore(games[socket.handshake.session.room].exportData())
            if(socket.handshake.session.player == games[socket.handshake.session.room].winner){
                socket.emit("Victory")
                socket.broadcast.to("room"+socket.handshake.session.room).emit("Defeat");
            }
            else{
                socket.emit("Defeat")
                socket.broadcast.to("room"+socket.handshake.session.room).emit("Victory");
            }
            games[socket.handshake.session.room][0] = 0
            games[socket.handshake.session.room][1] = null;
            games[socket.handshake.session.room][2] = null;

            let srvSockets = io.sockets.sockets;
            srvSockets.forEach(user => {
                if (user.handshake.session.room === socket.handshake.session.room){
                    user.handshake.session.player = undefined;
                    user.handshake.session.room = undefined;
                    user.handshake.session.ready = undefined;
                }
            });
            socket.handshake.session.player = undefined;
            socket.handshake.session.room = undefined;
            socket.handshake.session.ready = undefined;

        }

    });

}); // Fin de io.connection

app.post('/login', body('login').isLength({ min: 3 }).trim().escape(), (req, res) => {
    const login = req.body.login

    // Error management
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.status(400).json({ errors: errors.array() });
    } else {
        // Store login
        req.session.username = login;
        req.session.ready = undefined;
        req.session.save()
        res.redirect('/');
    }

});