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
        this.dialog.matches('favoriteFood', '/food');
    };
    Bot.prototype.initBackChannel = function () {
        this.bot.on("outgoing", function (message) {
        });
        this.bot.on("event", function (message) {
            if (message.name === "myCustomEvent") {
            }
        });
    };
    Bot.prototype.init = function () {
        this.bot = new builder.UniversalBot(this.connector);
        var url = config.luis.url.replace('##APP##', config.luis.app).replace('##KEY##', config.luis.key);
        this.recognizer = new builder.LuisRecognizer(url);
        this.dialog = new builder.IntentDialog({ recognizers: [this.recognizer] });
        console.log('Initialize defaults...');
        this.dialog.onDefault(builder.DialogAction.send("I did not understand"));
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