let EventHandler = (function(){
    let id;

    //Event for when the drag start, that store the data and id of what's moving, and add the position where it can be moved
    function dragStart(obj) {
        obj.dataTransfer.setData('text', obj.target.id);
        let data = obj.dataTransfer.getData("text");
        console.log(data)
        console.log(document.getElementById(data))
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
                socket.emit("attack",[id,obj.target.parentElement.id]);  //if it's an enemy, send the info to the socket, and then the fight
            }                                              // is handled on server side
            else{
                socket.emit("move",[id,obj.target.parentElement.id]);//if it's a blank space, then the data is send to the serv
                let data = obj.dataTransfer.getData("text");    //and then the piece is moved.
                obj.target.appendChild(document.getElementById(data));

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
        if(obj.target.parentElement.id !== id && ((obj.target.parentElement.style.backgroundImage !== "" && obj.target.nodeName === "IMG") ||
            (obj.target.style.backgroundImage !== "" && obj.target.nodeName=== "TD"))){ // check if the cell is a valid place
            if(obj.target.nodeName === "IMG"){
                socket.emit("attack",(id, obj.target.parentElement.id));      //same as drop()
            }
            else {
                socket.emit("move", (id, obj.target.id));
                let img = document.getElementById(id).firstChild; // Except that instead of a data.transfer
                obj.target.appendChild(img);                      //is just a simple move of the piece manually
            }
            removeDot();
        }
    }

    //Function that removes the indicators for possible moves
    function removeDot(){
        for(let i = 1; i< 101;i++){
            document.getElementById(i.toString()).style.backgroundImage = "";
        }
    }

    //Function that add the indicators for possible moves, depending on the kind of pieces
    function addDot(obj){
        if(obj.target.classList.contains("100strength") || obj.target.classList.contains("0strength")){}
        else if(obj.target.classList.contains("2strength")){
           let i = 1;let blocked = false;
           while(id-(10*i) > 0 && !blocked){
               if(document.getElementById((id - (10*i)).toString()).hasChildNodes()){
                   blocked = true;
               }
               let move = document.getElementById((id - (10*i)).toString());
               if (move.innerHTML === '') {
                   move.style.backgroundImage = "url('../Images/round.png')";
               } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                   move.style.backgroundImage = "url('../Images/corner.png')";
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
                    move.style.backgroundImage = "url('../Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../Images/corner.png')";
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
                    move.style.backgroundImage = "url('../Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../Images/corner.png')";
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
                    move.style.backgroundImage = "url('../Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../Images/corner.png')";
                }
                i++;
            }
        }
        else {
            if (Math.trunc(id / 10) !== 0) {
                let move = document.getElementById((id - 10).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../Images/corner.png')";
                }
            }


            if (Math.trunc(id / 10) !== 9) {
                let move = document.getElementById((id + 10).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../Images/corner.png')";
                }
            }
            if (id % 10 !== 0) {
                let move = document.getElementById((id- 1).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../Images/corner.png')";
                }
            }
            if (id % 10 !== 9) {
                let move = document.getElementById((id + 1).toString());
                if (move.innerHTML === '') {
                    move.style.backgroundImage = "url('../Images/round.png')";
                } else if (move.innerText !== ' ' && move.firstChild.classList.contains("enemy")) {
                    move.style.backgroundImage = "url('../Images/corner.png')";
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




