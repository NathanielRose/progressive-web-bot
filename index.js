"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DIRECTLINE_SECRET = "X6trl8efldA.cwA._bI.AGbTWeLaR7XS5xqudsCYG7jN4SWj_5_YAZI4yNgiVWE";
var startChat = function () {
    var botConnection;
    botConnection = new DirectLine.DirectLine({
        secret: DIRECTLINE_SECRET,
        webSocket: true
    });
    botConnection.connectionStatus$
        .filter(function (s) { return s === 2; })
        .subscribe(function (c) {
        BotChat.App({
            botConnection: botConnection,
            resize: 'detect'
        }, document.getElementById("bot"));
    });
    botConnection.activity$
        .filter(function (activity) { return activity.type === "event" && activity.name === "launch3D"; })
        .subscribe(function (activity) { return launch3D(); });
    botConnection.activity$
        .filter(function (activity) { return activity.type === "event" && activity.name === "launchAudio"; })
        .subscribe(function (activity) { return launchAudio(); });
    botConnection.activity$.subscribe(handleActivity);
};
var launchAudio = function () {
};
var handleActivity = function (activity) {
};
var sendMessageThroughDirectLine = function (message) {
};
var launch3D = function () {
    var canvas = document.getElementById("scene");
    var engine = new BABYLON.Engine(canvas, true);
    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.Camera("camera1", BABYLON.Vector3.Zero(), scene);
        BABYLON.SceneLoader.Append("https://www.babylonjs.com/Scenes/Espilit/", "Espilit.binary.babylon", scene, function () {
            scene.executeWhenReady(function () {
                scene.onPointerDown = function () {
                    scene.onPointerDown = undefined;
                    scene.activeCamera.attachControl(canvas, true);
                };
            });
        });
        return scene;
    };
    if (!scene) {
        var scene = createScene();
        engine.runRenderLoop(function () {
            scene.render();
        });
        window.addEventListener("resize", function () {
            engine.resize();
        });
    }
};
startChat();
