const fs = require('fs');
let scoreHandler = (function (){
    return{
        writeScore(newScore){
            fs.readFile('./Back/Data/Scores.json', (err, data) => {
                if (err) throw err;
                const scores = JSON.parse(data);


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
                console.log(scores.scores[index]);
            });

        }
    }

})();

module.exports = scoreHandler;
