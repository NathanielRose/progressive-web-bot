(function () {

    const DIRECTLINE_SECRET = "X6trl8efldA.cwA._bI.AGbTWeLaR7XS5xqudsCYG7jN4SWj_5_YAZI4yNgiVWE"; //you get that from the direct line channel at dev.botframework.com

    var startChat = function () {
        let botConnection;

        //if it is a brand new conversation, we create a fresh one
        botConnection = new DirectLine.DirectLine({
            secret: DIRECTLINE_SECRET,
            webSocket: false
        });

        botConnection.connectionStatus$
            .filter(s => s === 2) //when the status is 'connected' (2)
            .subscribe(c => {

                //everything is setup in DirectLine, we can create the Chatbot control
                BotChat.App({
                    botConnection: botConnection,
                    user: { id: botConnection.conversationId }, //you could define you own userid here
                    resize: 'detect'
                }, document.getElementById("bot"));

                // HOW TO SEND TO BOT
                // botConnection
                //     .postActivity({
                //         type: "event",
                //         name: "pushsubscriptionadded",
                //         value: subscriptionInfo,
                //         from: { id: botConnection.conversationId } //you could define your own userId here
                //     })
                //     .subscribe(id => {
                //     });
            });

        botConnection.activity$
            .filter(activity => activity.type === "event" && activity.name === "launch3D")
            .subscribe(activity => launch3D())

        botConnection.activity$.subscribe(c => {
            //CALLED EACH TIME AN ACTIVITY MESSAGE IS RECEIVED
            console.log(botConnection.watermark);
        });
    };

    var launch3D = function () {
        alert("3D");
    }

    //everything is defined, let's start the chat
    startChat();
})();