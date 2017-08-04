import { BotLogic } from './bot/bot'

declare var BotChat:any;
declare var BABYLON:any;
declare var window:any;
declare var BingSpeech:any;

(function () {

    var botConnection: any;
    var sceneReady: any = false;
    var bingClientTTS: any = null;
    var bot: BotLogic.Bot;

    var startChat = function () {

        var speechOptions = {
            speechRecognizer: new BotChat.SpeechRecognition.CognitiveServicesSpeechRecognizer({ subscriptionKey: '86d6de9db3a342619caf3160938799d4' }),
            speechSynthesizer: new BotChat.SpeechSynthesis.BrowserSpeechSynthesizer()
        }

        bot = new BotLogic.Bot(eventHandler);
        bot.initializeForWeb();

        BotChat.App({
            botConnection: window["browserBot"],
            user: { id: 'localuser' },
            bot: { id: 'localbot' },
            resize: 'detect',
            speechOptions: speechOptions,
        }, document.getElementById("bot"));
    };

    var eventHandler = (EventType: BotLogic.ClientEvents, data:any) => {
        switch(EventType){
            case BotLogic.ClientEvents.Refresh3DPaintings:
                refresh3DPaintings(data);
                break;
            case BotLogic.ClientEvents.RequestSelected3DPainting:
                sendSelectedPaintingInfo();
                break;
            case BotLogic.ClientEvents.LaunchTextToSpeech:
                launchAudio();
                break;
        }
    }

    var launchAudio = function () {
        // Initialise Bing Speek 
        bingClientTTS = new BingSpeech.TTSClient("86d6de9db3a342619caf3160938799d4");
        if (bingClientTTS) {
            bingClientTTS.synthesize("Audio is now activated");
        }
    }

    // const handleActivity = function (activity) {
    //     if (activity.text) {
    //         console.log("A text message was sent: " + activity.text);
    //         if (bingClientTTS && activity.from.id !== botConnection.conversationId && activity.text.length < 100) {
    //             bingClientTTS.synthesize(activity.text);
    //         }
    //     }
    //     else if (activity.attachments && activity.attachments.length > 0) {
    //         console.log("A herocard style message was sent: ", activity.attachments);
    //     }
    // }

    const refresh3DPaintings = function (paintingList: any) {
        function injectPaitingsTexturesIntoScene() {
            // scene.debugLayer.show();

            for (var tid = 0; tid < 41; tid++) {
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
                        if (tableau.material) {
                            tableau.material = paitingMaterial;
                        }
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

    var scene: any;
    var camera: any;
    var canvas: any;
    var engine: any;
    var launch3D = function (done: any) {
        // Get the canvas element from our HTML above
        canvas = document.getElementById("scene");
        engine = new BABYLON.Engine(canvas, true);
        engine.enableOfflineSupport = true;

        // This begins the creation of a function that we will 'call' just after it's built
        var createScene = function () {
            BABYLON.SceneLoader.ForceFullSceneLoadingForIncremental = true;

            BABYLON.SceneLoader.Load("https://www.babylonjs.com/Scenes/Espilit/",
                "Espilit.babylon", engine, function (newScene: any) {
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
                            camera = scene.activeCamera;
                            createTargetMesh();
                            scene.registerBeforeRender(function () {
                                castRayAndSelectObject();
                            });
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

        //When click event is raised
        canvas.addEventListener("click", function () {
            // We try to pick an object
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            // if the click hits the wall object, we change the impact picture position
            if (pickResult.hit && pickResult.pickedMesh.paintingData) {
                console.log(pickResult.pickedMesh.paintingData);
                //sendEventThroughDirectLine("PaintingInfo", pickResult.pickedMesh.paintingData);
            }
        });
    }

    const sendSelectedPaintingInfo = function () {
        if (currentPaintingSelected) {
            bot.eventHandler(BotLogic.ClientEvents.PaintingInfo, currentPaintingSelected.paintingData);
        }
        else {
            bot.eventHandler(BotLogic.ClientEvents.PaintingInfo, undefined);
        }
    }

    var createTargetMesh = function () {
        var target = BABYLON.Mesh.CreateSphere("sphere", 12, 0.025, scene);
        var targetMat = new BABYLON.StandardMaterial("targetMat", scene);
        targetMat.emissiveColor = BABYLON.Color3.Purple();
        target.material = targetMat;
        target.parent = camera;
        target.position.z = 2;
    }

    function isNumeric(n: any) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function predicate(mesh: any) {
        if (mesh.name.startsWith("T") && isNumeric(mesh.name[1]) && mesh.name !== "T33") {
            return true;
        }
        return false;
    }

    var mouseOnly = false;
    var currentPaintingSelected: any;
    var castRayAndSelectObject = function () {
        var ray;
        if (mouseOnly || !camera.leftController) {
            ray = camera.getForwardRay();
        } else {
            ray = camera.leftController.getForwardRay();
        }

        var hit = scene.pickWithRay(ray, predicate);

        if (hit.pickedMesh) {
            currentPaintingSelected = hit.pickedMesh;
            // if (currentPaintingSelected.paintaingData) {
            //     console.log(currentPaintingSelected.paintaingData);
            // }
            currentPaintingSelected.edgesColor = BABYLON.Color3.Yellow();
            currentPaintingSelected.edgesWidth = 3;
            currentPaintingSelected.enableEdgesRendering();
        }
        else {
            if (currentPaintingSelected) {
                currentPaintingSelected.disableEdgesRendering();
                currentPaintingSelected = null;
            }
        }
    }

    //everything is defined, let's start the chat

    startChat();
    launchAudio();
})();