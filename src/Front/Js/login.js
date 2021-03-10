let form = document.getElementById("log-form");
let inputUser = document.getElementById("username");
let inputPass = document.getElementById("password");

form.addEventListener('submit', event => {
    event.preventDefault();
    logger.sendLogin(inputUser.value, inputPass.value);
        let sql = "SELECT id, username FROM `users` WHERE `username`? and `password`?";
        datab.query(sql, [inputUser, inputPass], (err, res) => {
            if (res.length > 0) {
                logger.sendLogin(inputUser);
                req.session.userId = res[0].id;
                req.session.user = res[0];
                console.log(res[0].id);
                res.sendFile(__dirname + '/front/html/home.html');
            } else {
                message = 'Invalid username or password';
                //res.sendFile(__dirname + '/front/html/login.html');
            }
        });


});