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

for(let i = 0;i<10;i++){
    rooms[i] = new Array(3);
    rooms[i][0] = 0;
}

// Le serveur ecoute sur ce port
http.listen(8880, () => {
    console.log('Serveur lancé sur le port 8880');
})

// Connexion à la base de donnée
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sheron",
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
    req.session = null;
    res.redirect('/');
});

// redirige vers la page d'attente si l'URL contient '/waitingRoom'
app.get('/waitingRoom', (req,res) => {
    if(req.session.username) {
        res.sendFile(__dirname + '/Front/Html/salleAttente.html');
    }
    else
        res.redirect('/');
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
        for(let i = 0;i<10;i++){
            if(rooms[i][0] !== 2 && (i === 0||rooms[i-1][0]===2)){
                rooms[i][0] +=1; // Nbr de joueurs
                socket.handshake.session.player = rooms[i][0];
                socket.join("room"+i);
                rooms[i][rooms[i][0]] = socket.handshake.session.username
                socket.handshake.session.room = i;
                socket.handshake.session.ready=false;
                if(rooms[i][0] === 2){
                    let joueur1 = new Player(rooms[socket.handshake.session.room][1])
                    let joueur2 = new Player(rooms[socket.handshake.session.room][2]);
                    games[socket.handshake.session.room] = new Game(joueur1,joueur2);
                    games[socket.handshake.session.room].ready = 0;
                    socket.to("room"+i).broadcast.emit("redirectJ1"); // Envoie uniquement à l'autre joueur cette socket
                    socket.emit("redirectJ2"); // socket envoyé uniquement à l'emetteur
                }
                i = 9;
            }
        }
    });
    socket.on("emitInfo",()=>{
        socket.emit("getInfo",socket.handshake.session,rooms[socket.handshake.session.room],socket.handshake.session.username,socket.handshake.session.player,socket.handshake.session.room)
    })


    socket.on('disconnect', () => {

        /*if(socket.handshake.session.room !== undefined && !games[socket.handshake.session.room]){
            rooms[socket.handshake.session.room][0]--;
            rooms[socket.handshake.session.room][socket.handshake.session.player] = undefined;
            if(socket.handshake.session.player === 1){
                let srvSockets = io.to[socket.handshake.session.room].sockets.sockets;
                srvSockets.forEach(user => {
                    if (user.handshake.session.room === socket.handshake.session.room){
                        user.handshake.session.player = 1;
                    }
                });
            }

            io.to("room" +socket.handshake.session.room).emit("removePlay");
            console.log(rooms)
        }

       if(socket.handshake.session.room !==0){
           rooms[socket.handshake.session.room]--;
       }*/

    });

    // --------------- Socket pour la page game.html ---------------

    socket.on("game",(playerNbr,room)=>{
        let joueur = new Player(socket.handshake.session.username); // Sert uniquement à appelé des fonctions de l'instance Player

        console.log("Le plateau en données :",games[socket.handshake.session.room].grille);
        socket.join("room"+socket.handshake.session.room);

        socket.on("introductionServer",(userSocket,userRoom)=>{
            console.log("Appel de la fonction 'introduction' dans la room '"+room+"' coté serveur pour le joueur ",userSocket.player,".")
            socket.emit("introductionClient",userSocket,userRoom);
        })
        // Appelle la socket coté client qui crée dynamiquement le tableau des pions du joueur, en fonction de 'playerNbr' (J1 ou J2)
        socket.on("tableauPionsServerBuild",(playerNbr)=>{
            console.log("tableauPionsServerBuild appelé coté Serveur.")
            socket.emit("tableauPionsClientBuild",playerNbr);
        })
        // Appelle la socket coté client qui remplit le tableau des pions des 2 joueurs
        socket.on("tableauPionsServerContent",(playerNbr)=>{
            //console.log("Appel de la fonction 'tableauPionsServer' dans la room"+room+" coté serveur.");
            // AVANT : let sendContent = (playerNbr==1) ? game.joueur1.tableOfPawnsView() : game.joueur2.tableOfPawnsView() ; 
            //io.emit('tableauPionsClient',game.joueur1.tableOfPawnsView(),game.joueur2.tableOfPawnsView());
            let sendContent = (playerNbr==1) ? games[socket.handshake.session.room].joueur1.tableOfPawns : games[socket.handshake.session.room].joueur2.tableOfPawns;
            socket.emit('tableauPionsClientContent',sendContent,playerNbr);
       })

        // Appelle la socket coté client qui applique des listeners sur le tableau des pions du joueur
        socket.on('preparationListenersServer',(playerNbr)=>{
            console.log("Appel de la fonction 'preparationListenersServerJ1' dans la room '"+room+"' coté serveur pour le joueur ",playerNbr,".")
            socket.emit('preparationListenersClient',playerNbr);
        })
        
        // Reçois le type de la pièce actuellement selectionnée par le joueur et renvoie le nombre restant du type de cette pièce dispo
        socket.on("TypePionsDispoDemandeServer",typePions=>{
            socket.emit("TypePionsDispoReponseServer",(joueur.nombreRestantDuType(typePions)));
            
        });

        // Lors du clic sur une case, on vérifie si 'nbrRestant' de la pièce est > 0 (possible), s'il y avait déjà une pièce auquel cas on la suppr du plateau en données 
        // et incrémente nbrRestant de cette pièce, etc...
        socket.on("decrementationTypePionJoueurServer",(typePiece,idCaseStratego,nbrDeClics)=>{
            let possible;
            let x = Math.floor((idCaseStratego-1)/10);
            let y = (idCaseStratego-1)%10;
            let idPiecePop = undefined;
            console.log("Nbr de clics : ",nbrDeClics)
            let gameJoueur = (socket.handshake.session.player == 1) ? games[socket.handshake.session.room].joueur1 : games[socket.handshake.session.room].joueur2;
            // gameJoueur est l'accès au joueur via la socket gloable games[numeroDeLaRoom]
            
            if(gameJoueur.tableOfPawns[joueur.indiceDuType(typePiece)].nombreRestant>0){
                if(games[socket.handshake.session.room].grille[x][y]!=null){
                    let typePrecedentePiece=games[socket.handshake.session.room].grille[x][y].typeDeLaPiece();
                    console.log("On enlève la pièce précedente !");
                    joueur.tableOfPawns[joueur.indiceDuType(typePrecedentePiece)].nombreRestant++;
                    gameJoueur.tableOfPawns[joueur.indiceDuType(typePiece)].nombreRestant++;
                    idPiecePop=joueur.indiceDuType(typePrecedentePiece);
                    
                }
                joueur.tableOfPawns[joueur.indiceDuType(typePiece)].nombreRestant--;
                gameJoueur.tableOfPawns[joueur.indiceDuType(typePiece)].nombreRestant--;
                // Transmission en données de la case où mettre la pièce
                let piece = new Pion(typePiece,joueur.forceDuType(typePiece),joueur.getName(),Math.floor((idCaseStratego-1)/10),(idCaseStratego-1)%10);
                //game.setCase(x,y,piece);
                games[socket.handshake.session.room].grille[x][y]=piece;
                possible=true;
            } else { 
                possible=false;
                console.log("Le joueur "+socket.handshake.session.username+"ne peut plus poser de pièce du type "+typePiece)
            }
            socket.emit("decrementationTypePionJoueurClient",possible,joueur.forceDuType(typePiece),idCaseStratego,joueur.indiceDuType(typePiece),idPiecePop,nbrDeClics);
        });

        /* ---------------- Information pour débuger ---------------- */

        socket.on("tableauPiecesJoueurServer",()=>{
            socket.emit("tableauPiecesJoueurClient",joueur.tableOfPawnsView())
        })
        socket.on("grilleCommuneServer",()=>{
            socket.emit("grilleCommuneClient", games[socket.handshake.session.room].grille);
        })

        socket.on("testgameBegin",()=>{
            socket.emit("gameBegin",(socket.handshake.session.player))
            socket.broadcast.to("room"+socket.handshake.session.room).emit("gameBegin",((socket.handshake.session.player)%2 +1));
        })
        socket.on('readyButtonServer',()=>{
            if(!socket.handshake.session.ready){ // Pour empecher games[roomNbr].ready==2 à partir d'une seule fenetre
                let joueurReady=true;
                for(element of joueur.tableOfPawns){
                    if(element.nombreRestant!=0){
                        joueurReady=false;
                    }
                }
                if(joueurReady){
                    games[socket.handshake.session.room].ready++;
                    socket.handshake.session.ready=true;
                }
                socket.emit("readyButtonClient",joueurReady);
                console.log(games[socket.handshake.session.room].ready)
                if(games[socket.handshake.session.room].ready === 2){

                    socket.emit("gameBegin",(socket.handshake.session.player))
                    socket.broadcast.to("room"+socket.handshake.session.room).emit("gameBegin",((socket.handshake.session.player)%2 +1));
                }
            }else{console.log("Vous ne pouvez pas etre ready 2 fois.")}
        })
    }) // Fin de la socket "newgame"

    socket.on("move",(start,end)=>{
        console.log("Move")

        if(!games[socket.handshake.session.room].verifMove(socket.handshake.session.player,start,end)) {
            socket.emit("moveImpossible");
            console.log("moveImpossible")
            return
        }
        games[socket.handshake.session.room].move(start,end,socket.handshake.session.player);
        socket.broadcast.to("room"+socket.handshake.session.room).emit("PieceMoved",start,end);
    });
    socket.on("attack",(start,end)=>{
        if(!games[socket.handshake.session.room].verifMove(socket.handshake.session.player,start,end)) {
            socket.emit("moveImpossible");
            console.log("moveImpossible")
            return
        }
        if(games[socket.handshake.session.room].attack(start,end,socket.handshake.session.player)===-1){
            console.log("attackLost")
            socket.emit("attackLost",start,end,
                games[socket.handshake.session.room].getCase(Math.trunc(end/10),end%10).force,socket.handshake.session.player);
            socket.broadcast.to("room"+socket.handshake.session.room).emit("defenseWon",start,end);
        }
        if(games[socket.handshake.session.room].attack(start,end,socket.handshake.session.player) ===0){
            console.log("attackEven")
            socket.emit("attackEven",start,end);
            socket.broadcast.to("room"+socket.handshake.session.room).emit("attackEven",start,end);
        }
        if(games[socket.handshake.session.room].attack(start,end,socket.handshake.session.player) ===1){
            console.log("attackWon")
            socket.emit("attackWon",start,end);
            socket.broadcast.to("room"+socket.handshake.session.room).emit("defenseLost",start,end
                ,games[socket.handshake.session.room].getCase(Math.trunc(end/10),end%10).force,socket.handshake.session.player);
        }
        if(games[socket.handshake.session.room].isFinished()){
            if(socket.handshake.session.player === games[socket.handshake.session.room].winner){
                socket.emit("Victory")
                socket.broadcast.to("room"+socket.handshake.session.room).emit("Defeat");
            }
            else{
                socket.emit("Defeat")
                socket.broadcast.to("room"+socket.handshake.session.room).emit("Victory");
            }
        }

    });
});

app.post('/login', body('login').isLength({ min: 3 }).trim().escape(), (req, res) => {
    const login = req.body.login

    // Error management
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.status(400).json({ errors: errors.array() });
    } else {
        // Store login
        req.session.username = login;
        req.session.save()
        res.redirect('/');
    }

});


