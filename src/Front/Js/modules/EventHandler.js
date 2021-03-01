let EventHandler = (function(){
    let id;


    function dragStart(obj) {
        console.log('drag starts...');
        obj.dataTransfer.setData('text', obj.target.id);
        let data = obj.dataTransfer.getData("text");
        let cell = document.getElementById(data).parentElement
        id = cell.id
        addDot(obj)

    }






    function dragLeave(obj) {

        obj.target.classList.remove('drag-over');
    }

    function drop(obj) {
        if(obj.target.style.backgroundImage!== "") {
            let data = obj.dataTransfer.getData("text");
            obj.target.appendChild(document.getElementById(data));
        }

        obj.target.classList.remove('drag-over');
        obj.preventDefault();
        removeDot(obj)
    }

    function clickImage(obj){
        id = obj.target.parentElement.id
        addDot(obj)


    }
    function cellClick(obj){

        if(obj.target.parentElement.id !== id && obj.target.style.backgroundImage !== ""){
            removeDot(obj)
            let img = document.getElementById(id).firstChild
            obj.target.appendChild(img)


        }
    }

    function removeDot(obj){


        let move;
        if(Math.trunc(id/10) !== 0){
            move = document.getElementById((id-10).toString());
            if(move.style.backgroundImage !== ""){
                move.style.backgroundImage = ""
            }
        }
        if(Math.trunc(id/10) !== 9){
            move = document.getElementById((id/10 *10 +10).toString());
            if(move.style.backgroundImage !== ""){
                move.style.backgroundImage = ""
            }
        }
        if(id%10 !== 0){
            move = document.getElementById((id/10 *10 -1).toString());
            if(move.style.backgroundImage !== ""){
                move.style.backgroundImage = ""
            }
        }
        if(id%10 !== 9){
            move = document.getElementById((id/10 *10 +1).toString());
            if(move.style.backgroundImage !== ""){
                move.style.backgroundImage = ""
            }
        }
    }

    function addDot(obj){
        if(Math.trunc(id/10) !== 0){
            let move = document.getElementById((id-10).toString());
            if(move.innerHTML === ''){
                move.style.backgroundImage = "url('../../Front/Images/round.png')"
            }
        }


        if(Math.trunc(id/10) !== 9){
            let move = document.getElementById((id/10 *10 +10).toString());

            if(move.innerHTML === ''){
                move.style.backgroundImage = "url('../../Front/Images/round.png')"
            }
        }
        if(id%10 !== 0){
            let move = document.getElementById((id/10 *10 -1).toString());
            if(move.innerHTML === ''){
                move.style.backgroundImage = "url('../../Front/Images/round.png')"
            }
        }
        if(id%10 !== 9){
            let move = document.getElementById((id/10 *10 +1).toString());
            if(move.innerHTML === ''){
                move.style.backgroundImage = "url('../../Front/Images/round.png')"
            }
        }
    }


    return{
        addEvent(obj){
            obj.addEventListener('dragstart', dragStart)
            obj.addEventListener('dragleave', dragLeave);
            obj.addEventListener('drop', drop);
            obj.addEventListener('click', clickImage)

        },
        addCaseDrop(obj){

            obj.addEventListener('dragover', e=>{
                e.preventDefault();

                if(e.target.style.backgroundImage !== "") {
                    e.target.classList.add('drag-over')
                }
                e.dataTransfer.setData("text", e.target.id);});
            obj.addEventListener('drop', drop);
            obj.addEventListener('dragleave', dragLeave);
            obj.addEventListener('click',cellClick)
        }
    }

})();

let tblbody = document.getElementsByTagName("tbody")

for(let i = 0;i < 10;i++){
    let tr = document.createElement("tr")
    for(let j = 0 ;j < 10;j++){
        let td = document.createElement("td")
        td.id = i*10 + j
        EventHandler.addCaseDrop(td)
        td.removeAttribute('dragable');
        tr.appendChild(td);

    }

    tblbody[0].appendChild(tr)
}

let elem = document.getElementById('45')
let img = document.createElement("img")
EventHandler.addEvent(img)
let div = document.createElement("div")

img.src = "https://legacy.imagemagick.org/Usage/canvas/gradient_bilinear.jpg"
img.id = "img1"

elem.appendChild(img)







