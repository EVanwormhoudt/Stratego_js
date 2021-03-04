let EventHandler = (function(){
    let id;

    //Event for when the drag start, that store the data and id of what's moving, and add the position where it can be moved
    function dragStart(obj) {
        obj.dataTransfer.setData('text', obj.target.id);
        let data = obj.dataTransfer.getData("text");
        let cell = document.getElementById(data).parentElement;
        id = parseInt(cell.id);
        addDot(obj);

    }

    // When the object or the mouse is leaving a cell, this function remove the background
    function cellLeave(obj) {
        obj.target.classList.remove('drag-over');
    }

    //Event for when you let drop the draged object, that move the object, and send this info to the serv
    function drop(obj) {
        if(obj.target.parentElement.id !== id && ((obj.target.parentElement.style.backgroundImage !== "" && obj.target.nodeName === "IMG") ||
            (obj.target.style.backgroundImage !== "" && obj.target.nodeName=== "TD"))){      //check if the place to drop is a valid place
            if(obj.target.nodeName === "IMG"){            //Check if the location to drop is an enemy or just a blank space
                console.log("j'attaque " + obj.target.parentElement.id +" avec "+id)
                socket.emit("attack",[id,obj.target.parentElement.id]);  //if it's an enemy, send the info to the socket, and then the fight
            }                                              // is handled on server side
            else{
                socket.emit("move",[id,obj.target.parentElement.id]);//if it's a blank space, then the data is send to the serv
                let data = obj.dataTransfer.getData("text");    //and then the piece is moved.
                obj.target.appendChild(document.getElementById(data));
                console.log("je bouge le "+ id +" à " +obj.target.parentElement.id)

                /*--------Here there might be a modif, where the data is send to the serv, then checked, and
                the server send back if the move is valid or not*/
            }

        }

        obj.target.classList.remove('drag-over');    //remove the background, because the move is finished
        obj.preventDefault();
        removeDot();                                       //and then remove the indicators of moves possibles

    }

    //Event for when you click a piece, his id is stored and the possibles moves are added
    function clickImage(obj){
        removeDot();                //Clear the table, in case of another piece has been selected
        id = parseInt(obj.target.parentElement.id);
        addDot(obj);
    }

    //Event for when a piece has been selected, you can click on a cell to move the piece
    function cellClick(obj){
        cellLeave(obj)
        console.log("etape1")
        if(obj.target.parentElement.id !== id && ((obj.target.parentElement.style.backgroundImage !== "" && obj.target.nodeName === "IMG") ||
            (obj.target.style.backgroundImage !== "" && obj.target.nodeName=== "TD"))){ // check if the cell is a valid place
            console.log("etape2")
            if(obj.target.nodeName === "IMG"){
                socket.emit("attack",[id, obj.target.parentElement.id]);      //same as drop()
                console.log("j'attaque " + obj.target.parentElement.id +" avec "+id)
            }
            else {
                console.log("je bouge le "+ id +" à " +obj.target.parentElement.id)
                socket.emit("move", [id, obj.target.id]);
                let img = document.getElementById(id).firstChild; // Except that instead of a data.transfer
                obj.target.appendChild(img);                      //is just a simple move of the piece manually
            }
            removeDot();
        }
    }

    //Function that removes the indicators for possible moves
    function removeDot(){
        for(let i = 0; i< 100;i++){
            document.getElementById(i).style.backgroundImage = "";
        }
    }

    //Function that add the indicators for possible moves, depending on the kind of pieces
    function addDot(obj){
        if(obj.target.classList.contains("flag") || obj.target.classList.contains("bomb")){}
        else if(obj.target.classList.contains("scout")){
           let i = 1;let blocked = false;
           while(id-(10*i) > 0 && !blocked){
               if(document.getElementById((id - (10*i)).toString()).hasChildNodes()){
                   blocked = true;
               }
               let move = document.getElementById((id - (10*i)).toString());
               if (move.innerHTML === '') {
                   move.style.backgroundImage = "url('../../Front/Images/round.png')";
               } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                   move.style.backgroundImage = "url('../../Front/Images/corner.png')";
               }
               i ++;
           }
           i = 1;blocked = false;
            while(id+(10*i) < 100 && !blocked){
                if(document.getElementById((id + (10*i)).toString()).hasChildNodes()){
                    blocked = true;
                }

                let move = document.getElementById((id +(10*i)).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../../Front/Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../../Front/Images/corner.png')";
                }
                i++;
           }
            i = 1;blocked = false;
            while((id+i) % 10 !== 0 && !blocked){

                if(document.getElementById((id +i).toString()).hasChildNodes()){
                    blocked = true;
                }
                let move = document.getElementById((id +i).toString());

                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../../Front/Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../../Front/Images/corner.png')";
                }
                i++;
            }
            i = 1;blocked = false;
            while((id-i) % 10 !== 9 && !blocked){
                if(document.getElementById((id - i).toString()).hasChildNodes()){
                    blocked = true;
                }
                let move = document.getElementById((id - i).toString());

                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../../Front/Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../../Front/Images/corner.png')";
                }
                i++;
            }
        }
        else {
            if (Math.trunc(id / 10) !== 0) {
                let move = document.getElementById((id - 10).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../../Front/Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../../Front/Images/corner.png')";
                }
            }


            if (Math.trunc(id / 10) !== 9) {
                let move = document.getElementById((id + 10).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../../Front/Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../../Front/Images/corner.png')";
                }
            }
            if (id % 10 !== 0) {
                let move = document.getElementById((id- 1).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../../Front/Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../../Front/Images/corner.png')";
                }
            }
            if (id % 10 !== 9) {
                let move = document.getElementById((id + 1).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../../Front/Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../../Front/Images/corner.png')";
                }
            }
        }
    }

    //Event that add a background that show where you can put your piece depending on the position of the mouse
    function mouseEnter(obj){
        if(obj.target.style.backgroundImage !==""){
            obj.target.classList.add('drag-over');
        }
    }




    return{
        addEvent(obj){
            obj.addEventListener('dragstart', dragStart);
            obj.addEventListener('dragleave', cellLeave);
            obj.addEventListener('drop', drop);
            obj.addEventListener('click', clickImage)
        },
        addCaseDrop(obj){

            obj.addEventListener('dragover', e=>{
                e.preventDefault();

                if(e.target.style.backgroundImage !== "") {
                    e.target.classList.add('drag-over');
                }
                e.dataTransfer.setData("text", e.target.id);});
            obj.addEventListener('drop', drop);
            obj.addEventListener('dragleave', cellLeave);
            obj.addEventListener('click',cellClick);
            obj.addEventListener('mouseenter',mouseEnter);
            obj.addEventListener('mouseleave',cellLeave);
        }
    }

})();

let tblbody = document.getElementsByTagName("tbody")

for(let i = 0;i < 10;i++){
    let tr = document.createElement("tr");
    for(let j = 0 ;j < 10;j++){
        let td = document.createElement("td");
        td.id = i*10 + j;
        EventHandler.addCaseDrop(td);
        td.removeAttribute('dragable');
        tr.appendChild(td);

    }

    tblbody[0].appendChild(tr);
}

let elem = document.getElementById('45');
let elem2 = document.getElementById('46');
let elem3 = document.getElementById('80');
let elem4 = document.getElementById('90');



let img = document.createElement("img");
img.src = "../Images/r2.png";
img.id = "img1";
img.classList.add("scout");
EventHandler.addEvent(img);

let img2 = document.createElement("img");
img2.src = "../Images/bn.png";
img2.id = "img2";
img2.classList.add("enemy");

let img3 = document.createElement("img");
img3.src = "../Images/rb.png";
img3.id = "img3";
img3.classList.add("bomb");
EventHandler.addEvent(img3);

let img4 = document.createElement("img");
img4.src = "../Images/r8.png";
img4.id = "img4";
EventHandler.addEvent(img4);





elem.appendChild(img);
elem2.appendChild(img2);
elem3.appendChild(img3);
elem4.appendChild(img4)





