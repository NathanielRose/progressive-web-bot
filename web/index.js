(function () {

    const DIRECTLINE_SECRET = "X6trl8efldA.cwA._bI.AGbTWeLaR7XS5xqudsCYG7jN4SWj_5_YAZI4yNgiVWE"; //you get that from the direct line channel at dev.botframework.com

    var startChat = function () {
        let botConnection;

        //if it is a brand new conversation, we create a fresh one
        botConnection = new DirectLine.DirectLine({
            secret: DIRECTLINE_SECRET,
            webSocket: true
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

    var scene;

    var launch3D = function () {
        // Get the canvas element from our HTML above
        var canvas = document.getElementById("scene");
        var engine = new BABYLON.Engine(canvas, true);

        // This begins the creation of a function that we will 'call' just after it's built
        var createScene = function () {

            var scene = new BABYLON.Scene(engine);
            var camera = new BABYLON.Camera("camera1", BABYLON.Vector3.Zero(), scene);

            // Async call
            BABYLON.SceneLoader.Append("https://www.babylonjs.com/Scenes/Espilit/",
                "Espilit.binary.babylon", scene, function () {
                    // The main file has been loaded but let's wait for all ressources
                    // to be ready (textures, etc.)
                    scene.executeWhenReady(function () {
                        // When you're clicking or touching the rendering canvas on the right
                        scene.onPointerDown = function () {
                            scene.onPointerDown = undefined;
                            // Taking the default camera and using the embedded services
                            // In this case: moving using touch, gamepad or mouse/keyboard
                            scene.activeCamera.attachControl(canvas, true);
                        };
                    });
                });

            return scene;

        };  // End of createScene 

        if(!scene){
            var scene = createScene();
            engine.runRenderLoop(function () {
                scene.render();
            });

            window.addEventListener("resize", function () {
                engine.resize();
            });
        }
    }

    //everything is defined, let's start the chat
    startChat();
})();