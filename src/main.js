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
                socket.handshake.session.game= new Array(10);
                if(rooms[i][0] === 2){
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
    socket.on("changeLe",()=>{
        socket.handshake.session.game[0]=9;
    })
    socket.on("startGame",()=>{
        socket.join((socket.handshake.session.room).toString());
        if (games[socket.handshake.session.room] === undefined) {
            games[socket.handshake.session.room] = "something"
        }
        else{
            let joueur1 = new Player(rooms[socket.handshake.session.room][1])
            let joueur2 = new Player(rooms[socket.handshake.session.room][2]);
            games[socket.handshake.session.room] = new Game(joueur1,joueur2);
        }
    });

    socket.on("move",(start,end)=>{
        if(!games[socket.handshake.session.room].verifMove(socket.handshake.session.player,start,end))
            socket.emit("moveImpossible");
    });
    socket.on("attack",(start,end)=>{
        if(!games[socket.handshake.session.room].verifMove(socket.handshake.session.player,start,end))
            socket.emit("moveImpossible")

    });
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

    socket.on("newgame",(joueur1name,joueur2name,room)=>{
        console.log("Un nouveau Stratego vient d'être créé entre le joueur '"+joueur1name+"' et le joueur '"+joueur2name+"' dans la room numéro "+room);
        let joueur1 = new Player(joueur1name)
        let joueur2 = new Player(joueur2name)
        let game = new Game(joueur1,joueur2)

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
            let sendContent = (playerNbr==1) ? game.joueur1.tableOfPawnsView() : game.joueur2.tableOfPawnsView() ; 
            //io.emit('tableauPionsClient',game.joueur1.tableOfPawnsView(),game.joueur2.tableOfPawnsView());
            socket.emit('tableauPionsClientContent',sendContent,playerNbr);
            //On envoie ici les tableaux des pions des joueurs 1 et 2 même s'ils sont identiques car, dans le cas où un jour un joueur devait avoir + de pions que l'autre 
            // (difficultés supplémentaires futures ?) cela permet que l'affichage du tableau des 2 joueurs soit indépendants
        })
        /* ---------------------- Joueur1 ----------------------*/

        // Appelle la socket coté client qui applique des listeners sur le tableau des pions du J1
        socket.on('preparationListenersServer',(playerNbr)=>{
            console.log("Appel de la fonction 'preparationListenersServerJ1' dans la room '"+room+"' coté serveur pour le joueur ",playerNbr,".")
            socket.emit('preparationListenersClient',playerNbr);
        })
        
        // Reçois le type de la pièce actuellement selectionnée par le joueur1 et renvoie le nombre restant du type de cette pièce dispo
        socket.on("TypePionsJ1DispoDemandeServer",typePionsJ1=>{
            socket.emit("TypePionsJ1DispoReponseServer",(joueur1.nombreRestantDuType(typePionsJ1)));
        });

        // Lors du clic sur une case, on vérifie si 'nbrRestant' de la pièce est > 0 (possible), s'il y avait déjà une pièce auquel cas on la suppr du plateau en données 
        // et incrémente nbrRestant de cette pièce, etc...
        socket.on("decrementationTypePionJoueur1Server",(typePiece,idCaseStratego,nbrDeClics)=>{
            let possible;
            let x = Math.floor((idCaseStratego-1)/10);
            let y = (idCaseStratego-1)%10;
            let idPiecePop = undefined;
            console.log("Nbr de clics : ",nbrDeClics)
            if(joueur1.tableOfPawns[joueur1.indiceDuType(typePiece)].nombreRestant>0){
                if(!game.isCaseEmpty(x,y)){
                    let typePrecedentePiece=game.getCase(x,y).typeDeLaPiece();
                    console.log("On enlève la pièce précedente !");
                    joueur1.tableOfPawns[joueur1.indiceDuType(typePrecedentePiece)].nombreRestant++;
                    idPiecePop=joueur1.indiceDuType(typePrecedentePiece);
                    
                }
                joueur1.tableOfPawns[joueur1.indiceDuType(typePiece)].nombreRestant--;
                // Transmission en données de la case où mettre la pièce
                let piece = new Pion(typePiece,joueur1.forceDuType(typePiece),joueur1name,Math.floor((idCaseStratego-1)/10),(idCaseStratego-1)%10);
                game.setCase(x,y,piece);
                possible=true;
            } else { 
                possible=false;
                console.log("Le joueur1 ne peut plus poser de pièce du type "+typePiece)
            }
            socket.emit("decrementationTypePionJoueur1Client",possible,joueur1.forceDuType(typePiece),idCaseStratego,joueur1.indiceDuType(typePiece),idPiecePop,nbrDeClics);
        });

        /* ---------------- Information pour débuger ---------------- */
        // Evenements sur les phrases 'Voir le tableau des pièces du joueur1' et 'Voir plateau Stratego en données.'

        socket.on("strategoDonneesServer",()=>{
            game.consoleLogTable();
            socket.emit("strategoDonneesClient",game.grille);
        })
        socket.on("tableauPiecesJ1Server",()=>{
            socket.emit("tableauPiecesJ1Client",joueur1.tableOfPawnsView())
        })
    }) // Fin de la socket "newgame"
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


