let registerer = (function(){

    function postLog(username, password, passwordConf, email) {
        console.log(username);
        $.ajax({
            type: "POST",
            url: "/login/",
            data: {
                user: username,
                password: password,
                passwordConfirmation : passwordConf,
                email: email
            },
            success: () => {
                window.location.href = "/login";
            },
        });
    }

    return {
        sendReg(username, password, passwordConf, email) {
            postLog(username, password, passwordConf, email);
        }
    }
})();