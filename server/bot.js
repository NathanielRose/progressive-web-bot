"use strict";
var builder = require("botbuilder");
var config = require("./config");
var Bot = (function () {
    function Bot() {
    }
    Bot.prototype.initializeForWeb = function () {
        if (!config.bot.key) {
            this.connector = new builder.ChatConnector();
            console.log('WARNING: Starting bot without ID or Secret');
        }
        else {
            this.connector = new builder.ChatConnector({ appId: config.bot.app, appPassword: config.bot.key });
            console.log('Bot started with App Id %s', config.bot.app);
        }
        this.init();
    };
    Bot.prototype.initializeForConsole = function () {
        this.connector = new builder.ConsoleConnector();
        this.init();
    };
    Bot.prototype.registerDialogs = function () {
        var _this = this;
        this.bot.dialog('/', this.dialog);
        this.bot.on('conversationUpdate', function (message) {
            if (message.membersAdded) {
                message.membersAdded.forEach(function (identity) {
                    if (identity.id === message.address.bot.id) {
                        var reply = new builder.Message()
                            .address(message.address)
                            .text("Helo! I am the art bot");
                        _this.bot.send(reply);
                    }
                });
            }
        });
    };
    Bot.prototype.bindDialogs = function () {
        this.bot.dialog("/artist", function (session, args) {
            var Artist = builder.EntityRecognizer.findEntity(args.entities, 'Artist');
        });
        this.dialog.matches('artist', '/artist');
    };
    Bot.prototype.initBackChannel = function () {
        this.bot.on("message", function (message) {
        });
        this.bot.on("event", function (message) {
            if (message.name === "myCustomEvent") {
            }
        });
    };
    Bot.prototype.init = function () {
        this.bot = new builder.UniversalBot(this.connector);
        var url = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8204e650-feb0-471d-ab15-2813c0a33447?subscription-key=252d60e7d01c4236a6a7e77d03c558ff&timezoneOffset=0&verbose=true&q=";
        this.recognizer = new builder.LuisRecognizer(url);
        this.dialog = new builder.IntentDialog({ recognizers: [this.recognizer] });
        console.log('Initialize defaults...');
        this.dialog.onDefault(function (session, message) {
            if (session.message.text === "3D") {
                var msg = new builder.Message();
                msg.data.type = "event";
                msg.data.name = "launch3D";
                msg.data.value = "Cause 3D rocks.";
                session.send(msg);
            }
        });
        console.log('Creating dialogs...');
        this.registerDialogs();
        console.log('Binding dialogs to intents...');
        this.bindDialogs();
        console.log('Initialize backchannel...');
        this.initBackChannel();
    };
    return Bot;
}());
module.exports = Bot;
//# sourceMappingURL=bot.js.map