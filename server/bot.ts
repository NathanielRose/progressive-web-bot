import builder = require('botbuilder');
import config = require('./config');
import harvard = require('./HarvardClientLib');

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

    private registerDialogs() {
        this.bot.dialog('/', this.dialog);

        //here is a classic way of greeting a new user and explaining how things work
        this.bot.on('conversationUpdate', (message) => {
            if (message.membersAdded) {
                message.membersAdded.forEach((identity: any) => {
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

    private bindDialogs() {
        this.bot.dialog("/artist", (session, args) => {
            let Artist = builder.EntityRecognizer.findEntity(args.entities, 'Artist');

            this.harvardClient.searchFor(Artist.entity, (results) => {
                let heroCardList: builder.AttachmentType[] = [];

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
        })

        this.dialog.matches('artist', '/artist');
    }

    private initBackChannel() {
        this.bot.on("message", (message) => {

        });

        this.bot.on("event", (message) => {
            if (message.name === "myCustomEvent") {
            }
        });
    }

    private send3DEvent(session: any) {
        if (session.message.text === "3D") {
            var msg: any = new builder.Message();
            msg.data.type = "event";
            msg.data.name = "launch3D";
            msg.data.value = "Cause 3D rocks.";
            session.send(msg);
        }
    }

    private createHeroCard(session: builder.Session, painting: harvard.HarvardArtMuseums.Painting): builder.HeroCard {
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