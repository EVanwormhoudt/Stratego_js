socket.on("getScore" ,(score) => {
    let tab = document.createElement("tableScr");
    tab.id = tableScrID;
    let tableauScr = document.getElementById("tableauScr");

    let tblScrCaption = document.createElement("captionScr")
    let tblScrThead = document.createElement("theadScr");
    let tblScrTbody = document.createElement("tbodyScr");

    tblScrCaption.textContent = "" // Sans caption NE PAS ENLEVER
    tblScrThead.innerHTML="<tr><td>Vainqueur</td><td>Perdant</td><td>Pièces restantes du vainqueur</td><td>Pièces restantes du perdant</td><td>Temps</td></tr>";

    for(let i of scores.scores){
        let winner,looser;
        if (i.winner === 1){
            winner = i.joueur1.name;
            looser = i.joueur2.name;
        }
        else{
            winner = i.joueur2.name;
            looser = i.joueur1.name;
        }
        let rowScr = document.createElement("tr");
        let columnScr1 = document.createElement("td");
        columnScr1.textContent=winner;
        rowScr.appendChild(columnScr1);
        let columnScr2 = document.createElement("td");
        columnScr2.textContent=looser;
        rowScr.appendChild(columnScr2);
        let columnScr3 = document.createElement("td");
        if (winner == i.joueur1.name){
            for (let j of scores.scores.tabj1.name){


            }
        }
        else {
            for (let j of scores.scores.tabj1.name){

            }
        }

        rowScr.appendChild(columnScr3);
        let columnScr4 = document.createElement("td");
        if (looser == i.joueur1.name){
            for (let k of scores.scores.tabj1.name){


            }
        }
        else {
            for (let k of scores.scores.tabj1.name){

            }
        }
        columnScr4.texnt="";
        rowScr.appendChild(columnScr4);
        let columnScr5 = document.createElement("td");
        columnScr5.textContent=i.time;
        rowScr.appendChild(columnScr5);

        tblScrTbody.appendChild(rowScr);
    }
    tab.appendChild(tblScrCaption);
    tab.appendChild(tblScrThead);
    tab.appendChild(tblScrTbody);
    tableauScr.appendChild(tab);
})

socket.emit("getScore");
