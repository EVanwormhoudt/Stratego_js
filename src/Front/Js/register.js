let form = document.getElementById("reg-form");
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");
let inputConf = document.getElementById("passwordConf");
let inputMail = document.getElementById("email");


form.addEventListener('submit', event => {
    event.preventDefault();
    registerer.sendReg(inputUser.value, inputPass.value, inputConf.value, inputMail.value);
    if(inputPass === inputConf){
        let sql = "INSERT INTO `users` (`username`,`email`,`password`) VALUES (?,?,?)";
        datab.query(sql,[inputUser, inputMail, inputPass], function(err, res){
            console.log('Account created');
            res.sendFile(__dirname + '/front/html/login.html');
        });
    } else {
        console.log('Password and Password Confirmation do not match ');
    }
});
