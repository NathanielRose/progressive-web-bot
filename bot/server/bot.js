"use strict";
const builder = require("botbuilder");
const config = require("./config");
const harvard = require("./HarvardClientLib");
class Bot {
    initializeForWeb() {
        if (!config.bot.key) {
            this.connector = new builder.ChatConnector();
            console.log('WARNING: Starting bot without ID or Secret');
        }
        else {
            this.connector = new builder.ChatConnector({ appId: config.bot.app, appPassword: config.bot.key });
            console.log('Bot started with App Id %s', config.bot.app);
        }
        this.init();
    }
    initializeForConsole() {
        this.connector = new builder.ConsoleConnector();
        this.init();
    }
    registerDialogs() {
        this.bot.dialog('/', this.dialog);
        this.bot.on('conversationUpdate', (message) => {
            if (message.membersAdded) {
                message.membersAdded.forEach((identity) => {
                    if (identity.id === message.address.bot.id) {
                        var reply = new builder.Message()
                            .address(message.address)
                            .text("Helo! I am the art bot");
                        this.bot.send(reply);
                    }
                });
            }
        });
    }
    bindDialogs() {
        this.bot.dialog("/artist", (session, args) => {
            let Artist = builder.EntityRecognizer.findEntity(args.entities, 'Artist');
            this.harvardClient.searchFor(Artist.entity, (results) => {
                let heroCardList = [];
                results.forEach((painting) => {
                    heroCardList.push(this.createHeroCard(session, painting));
                });
                let msg;
                if (heroCardList.length > 0) {
                    msg = new builder.Message(session).attachments(heroCardList);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                }
                else {
                    msg = 'I did not find anything';
                }
                session.endDialog(msg);
            });
        });
        this.dialog.matches('artist', '/artist');
    }
    initBackChannel() {
        this.bot.on("message", (message) => {
        });
        this.bot.on("event", (message) => {
            if (message.name === "myCustomEvent") {
            }
        });
    }
    send3DEvent(session) {
        if (session.message.text === "3D") {
            var msg = new builder.Message();
            msg.data.type = "event";
            msg.data.name = "launch3D";
            msg.data.value = "Cause 3D rocks.";
            session.send(msg);
        }
    }
    createHeroCard(session, painting) {
        return new builder.HeroCard(session)
            .title(painting.title)
            .subtitle(painting.people.name)
            .text(painting.description)
            .images([
            builder.CardImage.create(session, painting.image.iiifbaseuri.replace("https", "http") + "/full/pct:50/0/native.jpg")
        ])
            .buttons([
            builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Get Started')
        ]);
    }
    init() {
        this.bot = new builder.UniversalBot(this.connector);
        const url = config.luis.url;
        this.recognizer = new builder.LuisRecognizer(url);
        this.dialog = new builder.IntentDialog({ recognizers: [this.recognizer] });
        this.harvardClient = new harvard.HarvardArtMuseums.Client();
        console.log('Initialize defaults...');
        this.dialog.onDefault((session, message) => {
        });
        console.log('Creating dialogs...');
        this.registerDialogs();
        console.log('Binding dialogs to intents...');
        this.bindDialogs();
        console.log('Initialize backchannel...');
        this.initBackChannel();
    }
}
module.exports = Bot;
//# sourceMappingURL=bot.js.map