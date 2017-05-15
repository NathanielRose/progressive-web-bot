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
         // Get the canvas element from our HTML above
        var canvas = document.getElementById("renderCanvas");
        var engine = new BABYLON.Engine(canvas, true);

        // This begins the creation of a function that we will 'call' just after it's built
        var createScene = function () {

            // Now create a basic Babylon Scene object 
            var scene = new BABYLON.Scene(engine);

            // Change the scene background color to green.
            scene.clearColor = new BABYLON.Color3(0, 1, 0);

            // This creates and positions a free camera
            var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

            // This targets the camera to scene origin
            camera.setTarget(BABYLON.Vector3.Zero());

            // This attaches the camera to the canvas
            camera.attachControl(canvas, false);

            // This creates a light, aiming 0,1,0 - to the sky.
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

            // Dim the light a small amount
            light.intensity = .5;

            // Let's try our built-in 'sphere' shape. Params: name, subdivisions, size, scene
            var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

            // Move the sphere upward 1/2 its height
            sphere.position.y = 1;

            // Let's try our built-in 'ground' shape.  Params: name, width, depth, subdivisions, scene
            var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

            // Leave this function
            return scene;

        };  // End of createScene 
    }

    //everything is defined, let's start the chat
    startChat();
})();