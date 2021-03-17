let log = document.getElementById("lienLog")
let reg = document.getElementById("lienReg")
let game = document.getElementById("jouer")

socket.emit("isSession")

socket.on("onSession", data=>{
    if(data){
        log.style.pointerEvents = "none";
        reg.style.pointerEvents = "none";
    }
    else{
        game.style.pointerEvents = "none";
    }
})