(function () {

    const DIRECTLINE_SECRET = "X6trl8efldA.cwA._bI.AGbTWeLaR7XS5xqudsCYG7jN4SWj_5_YAZI4yNgiVWE"; //you get that from the direct line channel at dev.botframework.com
    var botConnection;
    const startChat = function () {

        //if it is a brand new conversation, we create a fresh one
        botConnection = new DirectLine.DirectLine({
            secret: DIRECTLINE_SECRET,
            webSocket: false
        });

        botConnection.connectionStatus$
            .filter(s => s === 2) //when the status is 'connected' (2)
            .subscribe(c => {

                //everything is setup in DirectLine, we can create the Chatbot control
                app = BotChat.App({
                    botConnection: botConnection,
                    user: { id: botConnection.conversationId }, //you could define you own userid here
                    resize: 'detect'
                }, document.getElementById("bot"));

            });

        botConnection.activity$
            .filter(activity => activity.type === "event" && activity.name === "launch3D")
            .subscribe(activity => launch3D());

        botConnection.activity$
            .filter(activity => activity.type === "event" && activity.name === "launchAudio")
            .subscribe(activity => launchAudio());

        botConnection.activity$.subscribe(handleActivity);
    };

    const launchAudio = function () {

    }


    const handleActivity = function (activity) {

        if (activity.text) {
            console.log("A text message was sent: " + activity.text);
        }
        else if (activity.attachments && activity.attachments.length > 0) {
            console.log("A herocard style message was sent: ", activity.attachments);
            launch3D(() => {
                for(var tid = 1; tid < activity.attachments.length; tid++) {
                    if (tid === 33) tid++;
                    var attachment = activity.attachments[tid];
                    var t = scene.getMeshByName("T" + tid);
                    var url = attachment.content.images[0].url;
                    var materialPlane = new BABYLON.StandardMaterial("paiting", scene);
                    materialPlane.diffuseTexture = new BABYLON.Texture(
                        url, scene, false, false);
                    materialPlane.emissiveTexture = new BABYLON.Texture(
                        url, scene, false, false);
                    t.setVerticesData("uv", [0, 0, 0, 1, 1, 1, 1, 0]);
                    t.material = materialPlane;
                    console.log(t.name + " " + url);
                }
            });
        }
    }

    const sendMessageThroughDirectLine = function (message) {
        // botConnection.postActivity({
        //     type: "message",
        //     text: "Hello world",
        //     locale: "en-US",
        //     textFormat: "plain",
        //     timestamp: new Date().toISOString(),
        //     value: "",
        //     from: { id: botConnection.conversationId },
        //     channelData: {
        //         clientActivityId: 1
        //     }
        // });
        botConnection.postActivity({
            type: "event",
            name: "pushsubscriptionadded",
            value: {},
            from: { id: botConnection.conversationId } //you could define your own userId here
        })
    }

    var scene;
    var launch3D = function (done) {
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
                        done();
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

        scene = createScene();
        engine.runRenderLoop(function () {
            scene.render();
        });

        window.addEventListener("resize", function () {
            engine.resize();
        });
    }

    //everything is defined, let's start the chat
    startChat();
})();