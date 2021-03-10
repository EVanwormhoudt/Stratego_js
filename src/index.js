const express = require('express');
const app = express();
const http = require('http').Server(app);
const mysql = require('mysql');
const bodyParser = require('body-parser');
const logger = require('./front/js/login');
const register = require('./front/js/register')

const session = require("express-session")({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000,
        secure: false
    }
});

const urlencodedParser = bodyParser.urlencoded({ extended: true });
// Init of express, to point our assets
app.use(bodyParser.json());
app.use(express.static(__dirname + '/front/'));
app.use(urlencodedParser);
app.use(session);

//Connexion à la base de donnée
const datab = mysql.createConnection({
    host: "localhost",
    user: "root",
    password : "",
    database: "login-data"
});

datab.connect( err => {
    if (err) throw err;
    else console.log('Connexion a mysql effectuee');
});
/***************/

//get
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/front/html/home.html');
    });

app.get("/login", (req, res) => {
    //res.sendFile(__dirname + '/front/html/login.html');
    });

app.get("/register", (req, res) => {
    res.sendFile(__dirname + '/front/html/register.html');
});

app.get('/logout', (req,res) => {
    req.session = null;
    res.redirect('/');
});
/******************/
// post
app.post('/register', register.register);


/******************/
http.listen(8880, () => {
    console.log('Serveur lancé sur le port 8880');
});
