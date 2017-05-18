import builder = require('botbuilder');
import config = require('./config');
import harvard = require('./HarvardClientLib');
var request = require('request');

enum ClientEvents {
    Refresh3DPaintings,
    LaunchTextToSpeech,
    LaunchSpeechToText
}

var searchName: string = "harvardmuseum";
var indexName: string = "temp2";
var searchKey: string = "B0DB7CCD7618531AF82FC063971A2D91";
var queryString: string = 'https://harvardmuseum.search.windows.net/indexes/temp2/docs?api-version=2016-09-01&search=*';



class Bot {
    public connector: builder.ConsoleConnector | builder.ChatConnector;
    private bot: builder.UniversalBot;
    private recognizer: builder.LuisRecognizer;
    private dialog: builder.IntentDialog;
    private harvardClient: harvard.HarvardArtMuseums.Client;

    public initializeForWeb() {
        if (!config.bot.key) {
            this.connector = new builder.ChatConnector();
            console.log('WARNING: Starting bot without ID or Secret');
        } else {
            this.connector = new builder.ChatConnector({ appId: config.bot.app, appPassword: config.bot.key });
            console.log('Bot started with App Id %s', config.bot.app);
        }
        this.init();
    }

    public initializeForConsole() {
        this.connector = new builder.ConsoleConnector();
        this.init();
    }

    private searchQueryStringBuilder(query: string): any {
        var sendMessage = {
            url: `${queryString}&${query}`,
            headers: {
                'api-key': `${searchKey}`
            }
        }
        return (sendMessage);
    }

    private performSearchQuery(queryString: any, callback: any) {
        request(queryString, function (error: any, response: any, body: any) {
            if (!error && response && response.statusCode == 200) {
                var result = JSON.parse(body);
                callback(null, result);
            } else {
                callback(error, null);
            }
        });
    }

    private registerDialogs() {
        this.bot.dialog('/', this.dialog);

        this.bot.on('conversationUpdate', (message) => {
            if (message.membersAdded) {
                message.membersAdded.forEach((identity: any) => {
                    if (identity.id === message.address.bot.id) {
                        var reply = new builder.Message()
                            .address(message.address)
                            .text("Hello! I am the art bot. You can say: 'what did picasso paint?'");
                        this.bot.send(reply);
                        // need to push to prompt for dialog
                    }
                });
            }
        });

        this.bot.dialog('/promptArtist', [
            (session) => {
                var choices = ["Artist", "Era"]
                builder.Prompts.choice(session, "How would you like to explore the gallery?", choices);
            },
            (session, results) => {
                if (results.response) {
                    var selection = results.response.entity;
                    // route to corresponding dialogs

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

        this.bot.dialog('/ArtistList', [
            (session) => {

                //Syntax for faceting results by 'Artist'
                var queryString: any = this.searchQueryStringBuilder('facet=people');

                this.performSearchQuery(queryString, function (err: any, result: any) {
                    if (err) {
                        console.log("Error when faceting by people:" + err);
                    } else if (result && result['@search.facets'] && result['@search.facets'].people) {
                        var artists = result['@search.facets'].people;
                        var ArtistNames: any = [];

                        //Pushes the name of each era into an array
                        artists.forEach(function (artist: any, i: any) {
                            ArtistNames.push(artist['value'] + " (" + artist.count + ")");
                        });

                        //Prompts the user to select the era he/she is interested in
                        builder.Prompts.choice(session, "Which painter are you interested in?", ArtistNames);
                    } else {
                        session.endDialog("I couldn't find the Artist");
                    }
                });
            }, (session, results) => {
                //Chooses just the era name - parsing out the count
                var era = results.response.entity.split(' ')[0];;

                //Syntax for filtering results by 'era'. Note the $ in front of filter (OData syntax)
                var queryString = this.searchQueryStringBuilder('$filter=people eq ' + '\'' + era + '\'');

                this.performSearchQuery(queryString, function (err: any, result: any) {

                    if (err) {
                        console.log("Error when filtering by genre: " + err);
                    } else if (result && result['value'] && result['value'][0]) {
                        //If we have results send them to the showResults dialog (acts like a decoupled view)
                        session.replaceDialog('/showResults', { result });
                    } else {
                        session.endDialog("I couldn't find any musicians in that era :0");
                    }
                })
            }
        ]);

        this.bot.dialog("/artist", (session, args) => {
            if (!args.entities) {
                session.endDialog("I did not understand :)");
                return;
            }

            let Artist = builder.EntityRecognizer.findEntity(args.entities, 'Artist');
            this.sendPaintings(session, Artist.entity);
        });
    }

    private sendPaintings(session: builder.Session, artist: string) {
        this.harvardClient.searchFor(artist, (results) => {
            let heroCardList: builder.AttachmentType[] = [];

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

    private bindDialogs() {
        this.dialog.matches('artist', '/artist');
        this.dialog.matches('listartists', '/promptArtist');
    }

    private initBackChannel() {
        this.bot.on("message", (message) => {

        });

        this.bot.on("event", (message) => {
            if (message.name === "paintingInfo") {
                let address = message.address;
                let painting = <harvard.HarvardArtMuseums.Painting>message.value;
                delete address.conversationId;
                let msg = new builder.Message()
                    .address(address)
                    .text(`This painting is named: **${painting.title}**, and was created by: **${painting.people.name}**`);
                this.bot.send(msg);
            }
        });
    }

    private sendEvent(session: any, eventType: ClientEvents, value?: any) {
        var msg: any = new builder.Message();
        msg.data.type = "event";
        msg.data.name = ClientEvents[eventType];
        msg.data.value = value;
        session.send(msg);
    }

    private createHeroCard(session: builder.Session, painting: harvard.HarvardArtMuseums.Painting): builder.HeroCard {
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

    private init() {
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
export = Bot;