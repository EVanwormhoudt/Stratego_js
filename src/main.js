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


const urlencodedParser = bodyParser.urlencoded({ extended: false });


const Game = require('./Back/Classes/Game.js')
const scoreHandler = require("./Back/Modules/scoreHandler")


app.use(express.static(__dirname + '/front/'));
app.use(urlencodedParser);
app.use(session);

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



//get
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/accueil.html');
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/login.html');
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + '/Front/Html/register.html');
});

app.get('/logout', (req,res) => {
    req.session = null;
    res.redirect('/');
});
app.get('/waitingRoom', (req,res) => {
    res.sendFile(__dirname + '/Front/Html/salleAttente.html');
});
/******************/

io.on('connection', (socket) => {
    socket.on("register", (info) => {
        let sql = "INSERT INTO users VALUES (default,?,?,?)";
        con.query(sql, [info[0], info[1],info[2]], (err, res)=> {
            if (err)throw err;
            console.log(res);
        });
    });
    socket.on("login",(info)=>{
        let sql = "SELECT id, username FROM users WHERE username = ? and password = ?";
        con.query(sql, [info[0], info[1]], (err, res) => {
            if(err) throw err;
            socket.emit("testLogin",res)
        });
    })


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


