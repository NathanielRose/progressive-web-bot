(function () {

    const DIRECTLINE_SECRET = "X6trl8efldA.cwA._bI.AGbTWeLaR7XS5xqudsCYG7jN4SWj_5_YAZI4yNgiVWE"; //you get that from the direct line channel at dev.botframework.com
    const DIRECTLINE_SECRET_davrous = "YgAIrcFhc5M.cwA.0Dk.BuBNtSXA13mjj6JOVWQFIzazJRkrjXjEjPLwldR-Oaw"; //you get that from the direct line channel at dev.botframework.com
    const DIRECTLINE_SECRET_pierlag = "0Ze9WPEvj18.cwA.mxg.BWNltLlA6IJ_Fba66GgKWWp-z7ypmvQb4q7TyKOG_nk"; //you get that from the direct line channel at dev.botframework.com


    var botConnection;
    var sceneReady = false;
    var bingClientTTS = null;

    var startChat = function () {
        //if it is a brand new conversation, we create a fresh one
        botConnection = new DirectLine.DirectLine({
            secret: DIRECTLINE_SECRET,
            webSocket: true
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
            .filter(activity => activity.type === "event" && activity.name === "Refresh3DPaintings")
            .subscribe(activity => refresh3DPaintings(activity.value));

        botConnection.activity$
            .filter(activity => activity.type === "event" && activity.name === "launchAudio")
            .subscribe(activity => launchAudio());

        botConnection.activity$.subscribe(handleActivity);
    };

    var launchAudio = function () {
        // Initialise Bing Speek 
        bingClientTTS = new BingSpeech.TTSClient("86d6de9db3a342619caf3160938799d4");
        if (bingClientTTS) {
            bingClientTTS.synthesize("Audio is now activated");
        }
    }

    const handleActivity = function (activity) {
        if (activity.text) {
            console.log("A text message was sent: " + activity.text);
            if (bingClientTTS && activity.from.id !== botConnection.conversationId) {
                bingClientTTS.synthesize(activity.text);
            }
        }
        else if (activity.attachments && activity.attachments.length > 0) {
            console.log("A herocard style message was sent: ", activity.attachments);
        }
    }

    const sendMessageThroughDirectLine = function (message) {
        botConnection.postActivity({
            type: "message",
            text: message,
            locale: "en-US",
            textFormat: "plain",
            timestamp: new Date().toISOString(),
            from: { id: botConnection.conversationId },
            channelData: {
                clientActivityId: 1
            }
        }).subscribe(_ => { });
    }

    const refresh3DPaintings = function (paintingList) {
        function injectPaitingsTexturesIntoScene() {
            // scene.debugLayer.show();

            for (var tid = 0; tid < 46; tid++) {
                // Mesh T33 is not usable, ignoring it
                if (tid !== 29) {
                    let currentId = tid + 4
                    var tableau = scene.getMeshByName("T" + currentId);
                    if (tableau && tableau.material) {
                        tableau.material.dispose();
                    }

                    var paitingMaterial = new BABYLON.StandardMaterial("painting" + tid, scene);
                    var newPaintingTexture;

                    if (tid < paintingList.length) {
                        var painting = paintingList[tid];
                        var url = painting.image.iiifbaseuri;
                        
                        tableau.setVerticesData("uv", [0, 0, 0, 1, 1, 1, 1, 0]);
                        newPaintingTexture = new BABYLON.Texture(url, scene, false, false);
                        paitingMaterial.diffuseTexture = newPaintingTexture;
                        paitingMaterial.emissiveTexture = newPaintingTexture;
                        paitingMaterial.specularColor = BABYLON.Color3.Black();
                        tableau.material = paitingMaterial;
                        tableau.paintingData = painting;
                    } else {
                        paitingMaterial.emissiveColor = BABYLON.Color3.Red();
                        tableau.material = paitingMaterial;
                        tableau.paintingData = painting;
                    }
                }
            }
        }
        if (!sceneReady) {
            launch3D(injectPaitingsTexturesIntoScene);
        }
        else {
            injectPaitingsTexturesIntoScene();
        }
    }

    var scene;
    var launch3D = function (done) {
        // Get the canvas element from our HTML above
        var canvas = document.getElementById("scene");
        var engine = new BABYLON.Engine(canvas, true);
        engine.enableOfflineSupport = true;

        // This begins the creation of a function that we will 'call' just after it's built
        var createScene = function () {
            BABYLON.SceneLoader.ForceFullSceneLoadingForIncremental = true;

            BABYLON.SceneLoader.Load("http://www.babylonjs.com/Scenes/Espilit/",
                "Espilit.babylon", engine, function (newScene) {
                    scene = newScene;
                    // The main file has been loaded but let's wait for all ressources
                    // to be ready (textures, etc.)
                    scene.executeWhenReady(function () {
                        //done();
                        // When you're clicking or touching the rendering canvas on the right
                        scene.onPointerDown = function () {
                            scene.onPointerDown = undefined;
                            // Taking the default camera and using the embedded services
                            // In this case: moving using touch, gamepad or mouse/keyboard
                            scene.activeCamera.attachControl(canvas, true);
                        };
                    });
                });
        };

        createScene();
        engine.runRenderLoop(function () {
            if (scene) {
                scene.render();
                if (scene.getWaitingItemsCount() === 0 && !sceneReady) {
                    sceneReady = true;
                    console.log("-= Scene Ready! =-");
                    window.setTimeout(done, 1000);
                }
            }
        });

        window.addEventListener("resize", function () {
            engine.resize();
        });
    }

    //everything is defined, let's start the chat
    startChat();
    launchAudio();
})();