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

const urlencodedParser = bodyParser.urlencoded({ extended: false });


const Game = require('./Back/Classes/Game.js')
const scoreHandler = require("./Back/Modules/scoreHandler")

app.use(express.static(__dirname + '/front/'));
app.use(urlencodedParser);
app.use(session);

// Configure socket io with session middleware
io.use(sharedsession(session, {
    // Session automatiquement sauvegardée en cas de modification
    autoSave: true
}));

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    session.cookie.secure = true // serve secure cookies
}

app.get('/', (req, res) => {
    let sessionData = req.session;

    // Si l'utilisateur n'est pas connecté
    if (!sessionData.username) {
        res.sendFile(__dirname + '/front/html/login.html');
    } else {
        res.sendFile(__dirname + '/front/html/index.html');
    }
});

app.post('/index', body('login').isLength({ min: 3 }).trim().escape(), (req, res) => {
    const login = req.body.login

    // Error management
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        //return res.status(400).json({ errors: errors.array() });
    } else {
        // Store login
        req.session.username = login;
        req.session.save()
        res.redirect('/');
    }
});


http.listen(63342, () => {
    console.log('Serveur lancé sur le port 63342');
});


let game = new Game("elliott","sheron");
game.remplirValue();
//scoreHandler.writePersonnalScore(game);
//scoreHandler.writeScore(game)
scoreHandler.readPersonnalScore("elliott").then(()=>console.log(scoreHandler.getScores()))


