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


const Game = require('./Back/Classes/Game.js')
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



//Connexion à la base de donnée
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
                rooms[i][0] +=1;
                socket.handshake.session.player = rooms[i][0];
                socket.join("room"+i);
                rooms[i][rooms[i][0]] = socket.handshake.session.username
                socket.handshake.session.room = i;
                if(rooms[i][0] === 2){
                    io.to("room"+i).emit("validStart");
                }
                i = 9;
            }
        }
    });
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

    socket.on("tableauPionsServer",()=>{
        console.log("Appel de la fonction 'tableauPionsServer' dans la room"+room+" coté serveur.");
        io.to((socket.handshake.session.room).toString()).emit('tableauPionsClient',game.joueur1.tableOfPawnsView(),game.joueur2.tableOfPawnsView());
        //On envoie ici les tableaux des pions des joueurs 1 et 2 même s'ils sont identiques car, dans le cas où un jour un joueur devait avoir + de pions que l'autre
        // (difficultés supplémentaires futures ?) cela permet que l'affiche des 2 joueurs soient indépendants
    })
    socket.on('tableauPionsListenerServerJ1',()=>{
        console.log("Appel de la fonction 'tableauPionsListenerServerJ1' dans la room"+room+" coté serveur.")
        io.to((socket.handshake.session.room).toString()).emit('tableauPionsListenerClientJ1',game.joueur1);
    })
    // Reçois la pièce actuellement selectionnée par le joueur1

    // Appelle la socket coté client qui applique des listeners sur le plateau Stratego du J1
    socket.on("strategoListenerServerJ1",()=>{
        console.log("Appel de la fonction 'strategoListenerServerJ1' dans la room"+room+" coté serveur.")
        io.to("room"+(socket.handshake.session.room)).emit('strategoListenerClientJ1');
    })

    /* ---------------------- Joueur2 ----------------------*/

    // Appelle la socket coté client qui applique des listeners sur le tableau des pions du J2
    socket.on('tableauPionsListenerServerJ2',()=>{
        console.log("Appel de la fonction 'tableauPionsListenerServerJ2' dans la room"+room+" coté serveur.")
        io.emit('tableauPionsListenerClientJ2');
    })


    // Reçois la pièce actuellement selectionnée par le joueur2

    // Appelle la socket coté client qui applique des listeners sur le plateau Stratego du J2
    socket.on("strategoListenerServerJ2",()=>{
        console.log("Appel de la fonction 'strategoListenerServerJ2' dans la room"+room+" coté serveur.")
        io.to("room"+(socket.handshake.session.room)).emit('strategoListenerClientJ2');
    })

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



/******************/
http.listen(8880, () => {
    console.log('Serveur lancé sur le port 8880');
})


