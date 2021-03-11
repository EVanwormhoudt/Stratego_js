let form = document.getElementById("reg-form");
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");
let inputConf = document.getElementById("passwordConf");
let inputMail = document.getElementById("email");




form.addEventListener('submit', event => {
    event.preventDefault();
    if(inputPass.value=== inputConf.value){
        logger.sendLogin(inputUser.value);
        socket.emit("register",[inputUser.value, inputPass.value, inputMail.value])
    } else {
        console.log('Password and Password Confirmation do not match ');
    }
});

