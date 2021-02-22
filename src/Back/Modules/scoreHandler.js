const fs = require('fs');
const mysql = require('mysql')
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "stratego"
});

con.connect(err => {
    if (err) throw err;
    else console.log('Connexion effectuée');
});


let scoreHandler = (function (){
    let scores = []

    return{
        writeScore(newScore){
            fs.readFile('./Back/Data/Scores.json', (err, data) => {
                if (err) throw err;
                const scores = JSON.parse(data);


                if(scores.scores.length === 5){
                    scores.scores.shift();
                }
                newScore.grid = undefined;
                scores.scores.push(newScore);

                let mydatas = JSON.stringify(scores, null, 2);


                fs.writeFile('./Back/Data/Scores.json', mydatas, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
            })
        },
        readScore(index){
            fs.readFile('./Back/Data/Scores.json', (err, data) => {
                if (err) throw err;
                const scores = JSON.parse(data);
                return scores.scores[index];
            });

        },
        writePersonnalScore(newScore) {
            let sql = "INSERT INTO scores VALUES (default,?,?,?)";
            let winner,looser;
            if (newScore.winner === 1){
                winner = newScore.joueur1;
                looser = newScore.joueur2;
            }
            else{
                winner = newScore.joueur2;
                looser = newScore.joueur1;
            }

            con.query(sql, [winner,looser,newScore.time], (err, result) => {
                if (err)throw err;
                console.log("1 record inserted");
                console.log(result);
                sql = "INSERT INTO pionts VALUES (?,?,?)";
                for(let i in newScore.pieces){
                    con.query(sql, [result.insertId,i,newScore.pieces[i]], (err, result2) => {
                        if (err) throw err;
                    });
                }
            });
        },
        readPersonnalScore(name){
            return new Promise((resolve, reject) => {
                con.query("SELECT * FROM scores WHERE winner = ? OR looser = ?", [name,name], (err, result) => {
                    if (err) throw err;
                    for(let i of result){
                        con.query("SELECT * FROM pionts WHERE idscores = ?", [i.idscores], (err, result2) => {
                            if (err) throw err;
                            let tab = []
                            for(let i of result2){
                                tab.push(i.quantity);

                            }
                            let Data = {
                                winner: i.winner,
                                looser: i.looser,
                                time :i.time,
                                pieces : tab
                            }
                            scores.push(Data)
                            if(i == result[result.length-1]){
                                resolve(true)
                            }
                        });
                    }
                });
            });
        },
        getScores(){
            return scores;
        }
    }

})();

module.exports = scoreHandler;