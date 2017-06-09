"use strict";
const builder = require("botbuilder");
const config = require("./config");
const harvard = require("./HarvardClientLib");
var request = require('request');
var ClientEvents;
(function (ClientEvents) {
    ClientEvents[ClientEvents["Refresh3DPaintings"] = 0] = "Refresh3DPaintings";
    ClientEvents[ClientEvents["LaunchTextToSpeech"] = 1] = "LaunchTextToSpeech";
    ClientEvents[ClientEvents["LaunchSpeechToText"] = 2] = "LaunchSpeechToText";
    ClientEvents[ClientEvents["RequestSelected3DPainting"] = 3] = "RequestSelected3DPainting";
    ClientEvents[ClientEvents["PaintingInfo"] = 4] = "PaintingInfo";
})(ClientEvents || (ClientEvents = {}));
var searchName = config.azuresearch.searchName;
var indexName = config.azuresearch.indexname;
var searchKey = config.azuresearch.searchKey;
var queryString = config.azuresearch.searchquery;
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
    searchQueryStringBuilder(query) {
        var sendMessage = {
            url: `${queryString}&${query}`,
            headers: {
                'api-key': `${searchKey}`
            }
        };
        return (sendMessage);
    }
    performSearchQuery(queryString, callback) {
        request(queryString, function (error, response, body) {
            if (!error && response && response.statusCode == 200) {
                var result = JSON.parse(body);
                callback(null, result);
            }
            else {
                callback(error, null);
            }
        });
    }
    registerDialogs() {
        this.bot.dialog('/', this.dialog);
        this.bot.on('conversationUpdate', (message) => {
            if (message.membersAdded) {
                message.membersAdded.forEach((identity) => {
                    if (identity.id === message.address.bot.id) {
                        var reply = new builder.Message()
                            .address(message.address)
                            .text("Hello! I am the art bot. You can say: 'what did picasso paint?'");
                        this.bot.send(reply);
                    }
                });
            }
        });
        this.bot.dialog('/promptArtist', [
            (session) => {
                var choices = ["Artist", "Era"];
                builder.Prompts.choice(session, "How would you like to explore the gallery?", choices);
            },
            (session, results) => {
                if (results.response) {
                    var selection = results.response.entity;
                    switch (selection) {
                        case "Artist":
                            session.replaceDialog('/ArtistList');
                            break;
                        case "Era":
                            session.replaceDialog('/ArtistEra');
                            break;
                        default:
                            session.reset('/');
                            break;
                    }
                }
            }
        ]);
        this.bot.dialog('/sendPaintingInfo', (session) => {
            this.sendEvent(session, ClientEvents.RequestSelected3DPainting);
        });
        this.bot.dialog('/ArtistList', [
            (session) => {
                var queryString = this.searchQueryStringBuilder('facet=people');
                this.performSearchQuery(queryString, function (err, result) {
                    if (err) {
                        console.log("Error when finding all the Artists:" + err);
                    }
                    else if (result && result['@search.facets'] && result['@search.facets'].people) {
                        var artists = result['@search.facets'].people;
                        var ArtistNames = [];
                        artists.forEach(function (artist, i) {
                            ArtistNames.push(artist['value'] + " (" + artist.count + ")");
                        });
                        builder.Prompts.choice(session, "Which painter are you interested in?", ArtistNames);
                    }
                    else {
                        session.endDialog("I couldn't find the Artist");
                    }
                });
            }, (session, results) => {
                var artistName = results.response.entity.split(' (')[0];
                ;
                this.sendPaintings(session, artistName);
            }
        ]);
        this.bot.dialog("/artist", (session, args) => {
            if (!args.entities) {
                session.endDialog("I did not understand :)");
                return;
            }
            let Artist = builder.EntityRecognizer.findEntity(args.entities, 'Artist');
            if (!Artist) {
                session.endDialog("I did not understand the artist you are looking for :)");
            }
            else {
                this.sendPaintings(session, Artist.entity);
            }
        });
    }
    bindDialogs() {
        this.dialog.matches(/What am I looking at\?/i, '/sendPaintingInfo');
        this.dialog.matches(/What is this\?/i, '/sendPaintingInfo');
        this.dialog.matches('artist', '/artist');
        this.dialog.matches('listartists', '/promptArtist');
    }
    initBackChannel() {
        this.bot.on("message", (message) => {
        });
        this.bot.on("event", (message) => {
            if (message.name === ClientEvents[ClientEvents.PaintingInfo]) {
                var textToSend;
                let address = message.address;
                if (message.value) {
                    let painting = message.value;
                    textToSend = `This painting is named: **${painting.title}**, and was created by: **${painting.people.name}**`;
                }
                else {
                    textToSend = "You are not looking directly at any painting.";
                }
                delete address.conversationId;
                let msg = new builder.Message()
                    .address(address)
                    .text(textToSend);
                this.bot.send(msg);
            }
        });
    }
    sendEvent(session, eventType, value) {
        var msg = new builder.Message();
        msg.data.type = "event";
        msg.data.name = ClientEvents[eventType];
        msg.data.value = value;
        session.send(msg);
    }
    sendPaintings(session, artistName) {
        this.harvardClient.searchFor(artistName, (results) => {
            let heroCardList = [];
            results.forEach((painting) => {
                painting.image.iiifbaseuri = painting.image.iiifbaseuri + "/full/pct:20/0/native.jpg";
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
            if (results.length > 0) {
                this.sendEvent(session, ClientEvents.Refresh3DPaintings, results);
            }
        });
    }
    createHeroCard(session, painting) {
        return new builder.HeroCard(session)
            .title(painting.title)
            .subtitle(painting.people.name)
            .text(painting.description)
            .images([
            builder.CardImage.create(session, painting.image.iiifbaseuri)
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
