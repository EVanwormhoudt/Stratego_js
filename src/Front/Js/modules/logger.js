let logger = (function(){

    function postLog(username, password) {
        console.log(username);
        $.ajax({
            type: "POST",
            url: "/login/",
            data: {
                user: username,
                password: password
            },
            success: () => {
                window.location.href = "/";
            },
        });
    }

    return {
        sendLogin(username, password) {
            postLog(username, password);
        }
    }
})();